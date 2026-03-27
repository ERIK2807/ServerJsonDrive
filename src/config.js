import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../.env')

function cargarEnv() {
  if (!fs.existsSync(envPath)) {
    return
  }

  const contenido = fs.readFileSync(envPath, 'utf8')
  const lineas = contenido.split(/\r?\n/)

  for (const linea of lineas) {
    const limpia = linea.trim()

    if (!limpia || limpia.startsWith('#')) {
      continue
    }

    const separador = limpia.indexOf('=')

    if (separador === -1) {
      continue
    }

    const clave = limpia.slice(0, separador).trim()
    const valorCrudo = limpia.slice(separador + 1).trim()
    const valor = valorCrudo.replace(/^['"]|['"]$/g, '')

    if (!(clave in process.env)) {
      process.env[clave] = valor
    }
  }
}

function requerirEnv(nombre) {
  const valor = process.env[nombre]

  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`)
  }

  return valor
}

function parsearBoolean(valor, fallback = false) {
  if (typeof valor !== 'string') {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(valor.toLowerCase())
}

function parsearLista(valor, fallback = []) {
  if (!valor) {
    return fallback
  }

  return valor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

cargarEnv()

const isProduction = process.env.NODE_ENV === 'production'
const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'None' : 'Lax')
const cookieSecure = process.env.COOKIE_SECURE
  ? parsearBoolean(process.env.COOKIE_SECURE)
  : cookieSameSite === 'None'

export const config = {
  port: process.env.PORT || '8080',
  adminUsername: requerirEnv('ADMIN_USERNAME'),
  adminPasswordHash: requerirEnv('ADMIN_PASSWORD_HASH'),
  sessionSecret: requerirEnv('SESSION_SECRET'),
  fileId: process.env.FILE_ID || '1JKSJUykO-eQXi85B2F_LwleLDLtA23e-',
  credentialsFile: process.env.CREDENTIALS_FILE || './credenciales.json',
  corsOrigins: parsearLista(process.env.CORS_ORIGIN, [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://estoes.com.co',
    'https://www.estoes.com.co',
  ]),
  cookieSameSite,
  cookieSecure,
  isProduction,
}
