import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  leerProductos,
} from '../services/drive.js'
import { leerJson, responderJson } from '../http.js'
import { requireAuth } from './auth.js'

export async function manejarProductos(req, res, idprd) {
  try {
    const sesion = requireAuth(req, res)

    if (!sesion) {
      return
    }

    if (req.method === 'GET' && !idprd) {
      const productos = await leerProductos()
      responderJson(res, 200, productos)
      return
    }

    if (req.method === 'POST' && !idprd) {
      const payload = await leerJson(req)
      const producto = await crearProducto(payload)
      responderJson(res, 201, producto)
      return
    }

    if (req.method === 'PUT' && idprd) {
      const payload = await leerJson(req)
      const producto = await actualizarProducto(idprd, payload)
      responderJson(res, 200, producto)
      return
    }

    if (req.method === 'DELETE' && idprd) {
      await eliminarProducto(idprd)
      responderJson(res, 200, { ok: true })
      return
    }

    responderJson(res, 405, { error: 'Metodo no permitido' })
  } catch (error) {
    const status = error.message === 'Producto no encontrado' ? 404 : 400
    responderJson(res, status, {
      error: 'No se pudo procesar la solicitud',
      detalle: error.message,
    })
  }
}

export async function manejarProductosPublicos(req, res) {
  try {
    if (req.method !== 'GET') {
      responderJson(res, 405, { error: 'Metodo no permitido' })
      return
    }

    const productos = await leerProductos()
    responderJson(res, 200, productos)
  } catch (error) {
    responderJson(res, 500, {
      error: 'No se pudo leer el catalogo publico',
      detalle: error.message,
    })
  }
}
