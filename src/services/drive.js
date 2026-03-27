import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'
import { config } from '../config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const credencialesPath = path.resolve(__dirname, '../../', config.credentialsFile)  // para leer el credenciales.json localmente

function leerCredencialesDesdeEnv() {
  if (config.googleServiceAccountJsonBase64) {
    const json = Buffer.from(config.googleServiceAccountJsonBase64, 'base64').toString('utf8')
    return JSON.parse(json)
  }

  if (config.googleServiceAccountJson) {
    return JSON.parse(config.googleServiceAccountJson)
  }

  return null
}

function crearGoogleAuth() {
  const credentials = leerCredencialesDesdeEnv()

  if (credentials) {
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    })
  }

  if (fs.existsSync(credencialesPath)) {
    return new google.auth.GoogleAuth({
      keyFile: credencialesPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    })
  }

  throw new Error(
    'No se encontraron credenciales de Google. Define GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, GOOGLE_SERVICE_ACCOUNT_JSON o agrega credenciales.json localmente.',
  )
}

const auth = crearGoogleAuth()
const drive = google.drive({
  version: 'v3',
  auth,
})

function normalizarProductos(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (typeof data === 'string') {
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  }

  if (data && typeof data === 'object') {
    return Array.isArray(data.productos) ? data.productos : []
  }

  return []
}

async function leerArchivo() {
  const response = await drive.files.get({
    fileId: config.fileId,
    alt: 'media',
  })

  return normalizarProductos(response.data)
}

async function guardarArchivo(productos) {
  await drive.files.update({
    fileId: config.fileId,
    media: {
      mimeType: 'application/json',
      body: JSON.stringify(productos, null, 2),
    },
  })
}

function siguienteId(productos) {
  const maxId = productos.reduce((maximo, producto) => {
    const valor = Number(producto.idprd)
    return Number.isFinite(valor) ? Math.max(maximo, valor) : maximo
  }, 0)

  return maxId + 1
}

function normalizarPayload(producto) {
  return {
    desc: producto.desc ?? '',
    precio: producto.precio ?? '',
    rating: producto.rating ?? '',
    vendidos: producto.vendidos ?? '',
    imageUrl: producto.imageUrl ?? '',
    url: producto.url ?? '',
  }
}

export async function leerProductos() {
  return leerArchivo()
}

export async function crearProducto(producto) {
  const productos = await leerArchivo()
  const nuevoProducto = {
    idprd: producto.idprd ? Number(producto.idprd) : siguienteId(productos),
    ...normalizarPayload(producto),
  }

  const existe = productos.some(
    (item) => String(item.idprd) === String(nuevoProducto.idprd),
  )

  if (existe) {
    throw new Error('Ya existe un producto con ese idprd')
  }

  const actualizados = [...productos, nuevoProducto]
  await guardarArchivo(actualizados)
  return nuevoProducto
}

export async function actualizarProducto(idprd, cambios) {
  const productos = await leerArchivo()
  const indice = productos.findIndex((item) => String(item.idprd) === String(idprd))

  if (indice === -1) {
    throw new Error('Producto no encontrado')
  }

  const actual = productos[indice]
  const actualizado = {
    ...actual,
    ...normalizarPayload(cambios),
    idprd: actual.idprd,
  }

  const actualizados = [...productos]
  actualizados[indice] = actualizado
  await guardarArchivo(actualizados)
  return actualizado
}

export async function eliminarProducto(idprd) {
  const productos = await leerArchivo()
  const actualizados = productos.filter((item) => String(item.idprd) !== String(idprd))

  if (actualizados.length === productos.length) {
    throw new Error('Producto no encontrado')
  }

  await guardarArchivo(actualizados)
}
