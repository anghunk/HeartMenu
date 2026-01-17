const randBytes = (len = 16) => crypto.getRandomValues(new Uint8Array(len))

const bufToHex = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0')
  return s
}

const hexToBuf = (hex: string) => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  return bytes.buffer
}

const derive = async (password: string, saltHex: string, iterations: number) => {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(hexToBuf(saltHex)), iterations, hash: 'SHA-256' }, keyMaterial, 256)
  return bufToHex(bits)
}

export const hashPassword = async (password: string) => {
  const salt = randBytes(16)
  const saltHex = bufToHex(salt.buffer)
  const iterations = 100000
  const hashHex = await derive(password, saltHex, iterations)
  return `pbkdf2-sha256:${iterations}:${saltHex}:${hashHex}`
}

export const verifyPassword = async (password: string, stored: string) => {
  const parts = stored.split(':')
  if (parts.length !== 4) return false
  const [, iterStr, saltHex, hashHex] = parts
  const iterations = parseInt(iterStr, 10)
  const calc = await derive(password, saltHex, iterations)
  return calc === hashHex
}
