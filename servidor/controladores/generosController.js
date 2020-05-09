const conexion = require('../lib/conexionbd');

function buscarGeneros(req, res) {
    const sql = "select * from genero"

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }
        const response = {
            'generos': resultado
        };
    
        res.send(JSON.stringify(response));
    });
}

module.exports = {
    buscarGeneros : buscarGeneros
};
