import crypto from 'node:crypto'

const KEYLEN = 64

function scryptAsync(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey.toString('hex'))
    })
  })
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = await scryptAsync(password, salt)
  return `${salt}:${hash}`
}

export async function verifyPassword(password, storedHash) {
  const [salt, hashOriginal] = String(storedHash).split(':')

  if (!salt || !hashOriginal) {
    return false
  }

  const hashActual = await scryptAsync(password, salt)
  return crypto.timingSafeEqual(Buffer.from(hashActual, 'hex'), Buffer.from(hashOriginal, 'hex'))
}
