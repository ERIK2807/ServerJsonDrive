import crypto from 'node:crypto'
import { config } from './config.js'

const sesiones = new Map()
const COOKIE_NAME = 'estoes_admin_session'
const DURACION_MS = 1000 * 60 * 60 * 8

function firmarValor(valor, secreto) {
  return crypto.createHmac('sha256', secreto).update(valor).digest('hex')
}

function serializarCookie(nombre, valor, opciones = {}) {
  const partes = [`${nombre}=${valor}`]

  if (opciones.httpOnly) {
    partes.push('HttpOnly')
  }

  if (opciones.sameSite) {
    partes.push(`SameSite=${opciones.sameSite}`)
  }

  if (opciones.secure) {
    partes.push('Secure')
  }

  if (opciones.path) {
    partes.push(`Path=${opciones.path}`)
  }

  if (typeof opciones.maxAge === 'number') {
    partes.push(`Max-Age=${opciones.maxAge}`)
  }

  return partes.join('; ')
}

export function parsearCookies(header = '') {
  return header
    .split(';')
    .map((parte) => parte.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const index = item.indexOf('=')

      if (index === -1) {
        return acc
      }

      const clave = item.slice(0, index)
      const valor = item.slice(index + 1)
      acc[clave] = valor
      return acc
    }, {})
}

export function crearSesion(username, sessionSecret) {
  const id = crypto.randomBytes(24).toString('hex')
  const firma = firmarValor(id, sessionSecret)
  const token = `${id}.${firma}`

  sesiones.set(id, {
    username,
    expiresAt: Date.now() + DURACION_MS,
  })

  return token
}

export function obtenerSesion(token, sessionSecret) {
  if (!token) {
    return null
  }

  const [id, firma] = token.split('.')

  if (!id || !firma) {
    return null
  }

  const firmaEsperada = firmarValor(id, sessionSecret)

  if (firma !== firmaEsperada) {
    return null
  }

  const sesion = sesiones.get(id)

  if (!sesion) {
    return null
  }

  if (sesion.expiresAt < Date.now()) {
    sesiones.delete(id)
    return null
  }

  return sesion
}

export function destruirSesion(token) {
  if (!token) {
    return
  }

  const [id] = token.split('.')

  if (id) {
    sesiones.delete(id)
  }
}

export function crearCookieSesion(token) {
  return serializarCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: '/',
    maxAge: DURACION_MS / 1000,
  })
}

export function crearCookieLogout() {
  return serializarCookie(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: '/',
    maxAge: 0,
  })
}

export function obtenerTokenSesion(cookies = {}) {
  return cookies[COOKIE_NAME]
}
