const express = require('express');
const cors = require('cors');
class Server{
    constructor(){
        this.app = express();
        this.port = process.env.PORT
        this.userpath = '/api/user'
        
        //middlewares: 
        //funciones que van añadir otra funcionalidad, siempre se ejecuta cuando levantemos nuestro servidor.
        this.middlewares();

        //Rutas de mi aplicación:

        this.routes();

    }
    
    middlewares(){
        //CORS
        this.app.use(cors());
        // lectura y parseo del body
        this.app.use(express.json());
        //Directorio publico
        this.app.use(express.static('public'));
    }

    routes(){
        //toma la ruta de user.js
        this.app.use(this.userpath, require('../routes/user'))
    }

    listen(){
        this.app.listen(this.port, ()=> 
        console.log(`Servidor corriendo en localhost:${this.port}`))
    }

}
module.exports = Server;