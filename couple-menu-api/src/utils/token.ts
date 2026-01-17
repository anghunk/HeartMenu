import { toBase64Url, fromBase64Url, strToBytes } from './base64url'

export type Payload = {
  sub: string | number
  username: string
  role: string
  avatar?: number
  iat: number
  exp: number
}

const alg = { alg: 'HS256', typ: 'JWT' }

const signHmac = async (data: string, secret: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return toBase64Url(sig)
}

export const encode = async (payload: Omit<Payload, 'iat' | 'exp'>, secret: string, ttlSeconds = 24 * 60 * 60) => {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + ttlSeconds
  const header = toBase64Url(strToBytes(JSON.stringify(alg)))
  const body = toBase64Url(strToBytes(JSON.stringify({ ...payload, iat, exp })))
  const data = `${header}.${body}`
  const signature = await signHmac(data, secret)
  return `${data}.${signature}`
}

export const decode = (token: string) => {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const payloadJson = new TextDecoder().decode(new Uint8Array(fromBase64Url(parts[1])))
  return JSON.parse(payloadJson) as Payload
}

export const verify = async (token: string, secret: string) => {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts
  const data = `${header}.${body}`
  const expected = await signHmac(data, secret)
  if (expected !== signature) return null
  const payload = decode(token)
  if (!payload) return null
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}
