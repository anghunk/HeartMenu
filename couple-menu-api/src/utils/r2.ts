// R2 工具模块 - 使用 AWS Signature V4 实现 S3 兼容 API

export type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  customDomain?: string
  region?: string
}

// 辅助函数：将 ArrayBuffer 转为十六进制字符串
const toHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// 辅助函数：SHA256 哈希
const sha256 = async (data: string | ArrayBuffer): Promise<ArrayBuffer> => {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data
  return await crypto.subtle.digest('SHA-256', buffer)
}

// 辅助函数：HMAC-SHA256
const hmacSha256 = async (key: ArrayBuffer, data: string): Promise<ArrayBuffer> => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
}

// 生成 AWS Signature V4 签名
const signRequest = async (
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: ArrayBuffer | null,
  config: R2Config
): Promise<Record<string, string>> => {
  const region = config.region || 'auto'
  const service = 's3'
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)

  // 计算 payload 哈希
  const payloadHash = toHex(await sha256(body || new ArrayBuffer(0)))

  // 规范请求头
  const signedHeaders: Record<string, string> = {
    host: url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...headers,
  }

  // 排序请求头
  const sortedHeaderKeys = Object.keys(signedHeaders).sort()
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k.toLowerCase()}:${signedHeaders[k]}\n`).join('')
  const signedHeadersStr = sortedHeaderKeys.map((k) => k.toLowerCase()).join(';')

  // 规范请求
  const canonicalRequest = [
    method,
    url.pathname,
    url.search.slice(1), // 去掉 '?'
    canonicalHeaders,
    signedHeadersStr,
    payloadHash,
  ].join('\n')

  // 待签名字符串
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    toHex(await sha256(canonicalRequest)),
  ].join('\n')

  // 计算签名密钥
  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${config.secretAccessKey}`), dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')

  // 计算签名
  const signature = toHex(await hmacSha256(kSigning, stringToSign))

  // 构建 Authorization 头
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`

  return {
    ...signedHeaders,
    Authorization: authorization,
  }
}

// 测试 R2 连接
export const testR2Connection = async (config: R2Config): Promise<{ success: boolean; error?: string }> => {
  try {
    const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`
    const url = new URL(`/${config.bucketName}`, endpoint)

    const headers = await signRequest('HEAD', url, {}, null, config)

    const response = await fetch(url.toString(), {
      method: 'HEAD',
      headers,
    })

    if (response.ok || response.status === 200) {
      return { success: true }
    }

    // 尝试 ListObjects 作为备选
    const listUrl = new URL(`/${config.bucketName}?list-type=2&max-keys=1`, endpoint)
    const listHeaders = await signRequest('GET', listUrl, {}, null, config)

    const listResponse = await fetch(listUrl.toString(), {
      method: 'GET',
      headers: listHeaders,
    })

    if (listResponse.ok) {
      return { success: true }
    }

    return { success: false, error: `连接失败: HTTP ${listResponse.status}` }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

// 上传文件到 R2
export const uploadToR2 = async (
  config: R2Config,
  file: ArrayBuffer,
  key: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`
    const url = new URL(`/${config.bucketName}/${key}`, endpoint)

    const headers = await signRequest(
      'PUT',
      url,
      { 'content-type': contentType },
      file,
      config
    )

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers,
      body: file,
    })

    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: `上传失败: ${response.status} - ${text}` }
    }

    // 生成访问 URL
    let publicUrl: string
    if (config.customDomain) {
      const domain = config.customDomain.replace(/\/$/, '')
      publicUrl = `${domain}/${key}`
    } else {
      // 默认使用 R2 公开访问 URL（需要开启公开访问）
      publicUrl = `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${key}`
    }

    return { success: true, url: publicUrl }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

// 生成唯一文件名
export const generateFileName = (originalName: string): string => {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `images/${timestamp}_${random}.${ext}`
}

// 验证文件类型
export const isValidImageType = (contentType: string): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return allowedTypes.includes(contentType)
}

// 文件大小限制（5MB）
export const MAX_FILE_SIZE = 5 * 1024 * 1024
