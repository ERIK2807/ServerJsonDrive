import { config } from './config.js'

const METODOS = 'GET, POST, PUT, DELETE, OPTIONS'
const HEADERS = 'Content-Type'

export async function leerJson(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  const body = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(body)
}

export function origenPermitido(origen) {
  if (!origen) {
    return null
  }

  if (config.corsOrigins.includes('*')) {
    return origen
  }

  return config.corsOrigins.includes(origen) ? origen : null
}

export function aplicarCors(req, res) {
  const origin = req.headers.origin
  const allowedOrigin = origenPermitido(origin)

  if (!allowedOrigin) {
    return
  }

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', METODOS)
  res.setHeader('Access-Control-Allow-Headers', HEADERS)
  res.setHeader('Vary', 'Origin')
}

export function responderJson(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...headers,
  })
  res.end(JSON.stringify(payload))
}
