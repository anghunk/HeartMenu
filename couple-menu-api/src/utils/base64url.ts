const toBase64 = (bytes: ArrayBuffer) => {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary)
}

const fromBase64 = (b64: string) => {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export const toBase64Url = (bytes: ArrayBuffer) => toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
export const fromBase64Url = (b64url: string) => fromBase64(b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '='))

export const strToBytes = (s: string) => new TextEncoder().encode(s).buffer
export const bytesToStr = (b: ArrayBuffer) => new TextDecoder().decode(new Uint8Array(b))
