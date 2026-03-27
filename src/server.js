import http from 'node:http'
import './config.js'
import { config } from './config.js'
import { aplicarCors, responderJson } from './http.js'
import { manejarAuth } from './routes/auth.js'
import { manejarProductos, manejarProductosPublicos } from './routes/productos.js'

const server = http.createServer(async (req, res) => {
  aplicarCors(req, res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const productosMatch = url.pathname.match(/^\/api\/productos(?:\/([^/]+))?$/)

  if (url.pathname === '/GetEstoEsPrd') {
    await manejarProductosPublicos(req, res)
    return
  }

  if (url.pathname.startsWith('/api/auth/')) {
    await manejarAuth(req, res, url.pathname)
    return
  }

  if (productosMatch) {
    const idprd = productosMatch[1]
    await manejarProductos(req, res, idprd)
    return
  }

  responderJson(res, 200, {
    mensaje: 'Backend activo',
    publico: '/GetEstoEsPrd',
    auth: '/api/auth/login',
    productos: '/api/productos',
  })
})

server.listen(config.port, () => {
  console.log(`Backend escuchando en http://localhost:${config.port}`)
})
