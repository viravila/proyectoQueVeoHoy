const conexion = require('../lib/conexionbd');

var response ={
    peliculas:'',
    generos:'',
}

function buscarGeneros(req, res) {
    const sql = "select * from genero"

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }
        response.generos = resultado;
        res.send(JSON.stringify(response));
    });
}


module.exports = {
    buscarGeneros : buscarGeneros
};
