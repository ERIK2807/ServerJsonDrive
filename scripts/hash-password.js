import { hashPassword } from '../src/auth.js'

const password = process.argv[2]

if (!password) {
  console.error('Uso: node scripts/hash-password.js <tu-password>')
  process.exit(1)
}

const hash = await hashPassword(password)
console.log(hash)
