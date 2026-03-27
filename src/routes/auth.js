import { config } from '../config.js'
import { verifyPassword } from '../auth.js'
import { leerJson, responderJson } from '../http.js'
import {
  crearCookieLogout,
  crearCookieSesion,
  crearSesion,
  destruirSesion,
  obtenerSesion,
  obtenerTokenSesion,
  parsearCookies,
} from '../session.js'

export async function manejarAuth(req, res, path) {
  try {
    if (req.method === 'GET' && path === '/api/auth/me') {
      const cookies = parsearCookies(req.headers.cookie)
      const sesion = obtenerSesion(obtenerTokenSesion(cookies), config.sessionSecret)

      responderJson(res, 200, {
        authenticated: Boolean(sesion),
        user: sesion ? { username: sesion.username } : null,
      })
      return
    }

    if (req.method === 'POST' && path === '/api/auth/login') {
      const payload = await leerJson(req)
      const username = String(payload.username ?? '').trim()
      const password = String(payload.password ?? '')

      if (username !== config.adminUsername) {
        responderJson(res, 401, { error: 'Credenciales invalidas' })
        return
      }

      const esValido = await verifyPassword(password, config.adminPasswordHash)

      if (!esValido) {
        responderJson(res, 401, { error: 'Credenciales invalidas' })
        return
      }

      const token = crearSesion(username, config.sessionSecret)

      responderJson(
        res,
        200,
        { ok: true, user: { username } },
        { 'Set-Cookie': crearCookieSesion(token) },
      )
      return
    }

    if (req.method === 'POST' && path === '/api/auth/logout') {
      const cookies = parsearCookies(req.headers.cookie)
      destruirSesion(obtenerTokenSesion(cookies))
      responderJson(
        res,
        200,
        { ok: true },
        { 'Set-Cookie': crearCookieLogout() },
      )
      return
    }

    responderJson(res, 405, { error: 'Metodo no permitido' })
  } catch (error) {
    responderJson(res, 500, {
      error: 'No se pudo procesar la autenticacion',
      detalle: error.message,
    })
  }
}

export function requireAuth(req, res) {
  const cookies = parsearCookies(req.headers.cookie)
  const sesion = obtenerSesion(obtenerTokenSesion(cookies), config.sessionSecret)

  if (!sesion) {
    responderJson(res, 401, { error: 'No autenticado' })
    return null
  }

  return sesion
}
