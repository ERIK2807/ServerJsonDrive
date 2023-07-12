import { createServer } from 'http';
import { obtenerJson } from './leerDrivechatGPT3.js';

// Función de middleware de CORS personalizado
// const corsMiddleware = (req, res, next) => {
//   // Establecer los encabezados CORS necesarios
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   // Continuar con el siguiente middleware
//   next();
// };

// Crear el servidor HTTP

const server = createServer(async (req, res) => {
    // // Habilitar CORS permitiendo solicitudes.Desde cualquier origen dejar '*' en lugar de url
    res.setHeader('Access-Control-Allow-Origin', '*');
    // // // Permitir los métodos GET, POST y OPTIONS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    // // // Permitir el encabezado Content-Type
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/GetEstoEsPrd') {
    const fileUrl = "https://drive.google.com/uc?export=download&id=1JKSJUykO-eQXi85B2F_LwleLDLtA23e-";
    res.setHeader('Content-Type', 'application/json');

    try {
      // Obtener el objeto JSON desde la función obtenerJson
      const infoprd = await obtenerJson(fileUrl);

      // Convertir el objeto JSON a una cadena de texto
      const jsonString = JSON.stringify(infoprd);

      // Escribir la cadena de texto en la respuesta del servidor
      res.write(jsonString);
    } catch (error) {
      console.error('Error al obtener el archivo:', error);

      // En caso de error, proporcionar una respuesta de error adecuada
      res.write(JSON.stringify({ error: 'Error al obtener el archivo' }));
    }

    // Finalizar la respuesta del servidor
    res.end();
  } else {
    // Manejar solicitud para una URL no válida
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write('Error code 404');
    res.end();
  }
});

// Aplicar el middleware de CORS personalizado
// server.on('request', corsMiddleware);

// Iniciar el servidor en el puerto 8080
server.listen(8080, () => {
  console.log('Servidor en ejecución en el puerto 8080');
});
