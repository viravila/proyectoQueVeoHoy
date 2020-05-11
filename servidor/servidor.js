//paquetes necesarios para el proyecto
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const peliculasController = require('./controladores/peliculasController');
const generosController = require('./controladores/generosController');
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/peliculas', peliculasController.buscarPeliculas);
app.get('/peliculas/recomendacion', peliculasController.recomendarPeliculas);
app.get('/peliculas/:id', peliculasController.detallesPelicula);
app.get('/generos', generosController.buscarGeneros);

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
const puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});