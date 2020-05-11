const conexion = require('../lib/conexionbd');


var response ={
    peliculas:'',
    generos:'',
    total:'',

}

function buscarPeliculas(req, res) {
    const pagina = parseInt(req.query.pagina),
          cantidad = parseInt(req.query.cantidad), 
          titulo = req.query.titulo, 
          genero = req.query.genero, 
          anio = req.query.anio, 
          director = req.query.director, 
          orderBy = req.query.columna_orden + " " + req.query.tipo_orden, 
          limit = ((pagina - 1) * cantidad).toString() + "," + cantidad.toString() ;

    let sql = "SELECT * FROM pelicula", 
        where = "";        

    if (titulo){
        where = where + "titulo Like '%" + titulo + "%'";
    }

    if (genero){
        if (titulo){
            where = where + " AND ";
        }
        
        where = where + "genero_id = " + genero;
    }

    if (anio){
        if (titulo || genero){
            where = where + " AND ";
        }
        
        where = where + "anio = " + anio;
    }

    if (director){
        if (titulo || genero || anio){
            where = where + " AND ";
        }
        
        where = where + "director Like '%" + director + "%'";
    }

    if (where){
        sql = sql + " WHERE " + where;
    }

    sql = sql + " ORDER BY " + orderBy + " LIMIT " + limit;

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        const peliculas = resultado;
        sql = "SELECT count(*) As total FROM pelicula";

        if (where){
            sql = sql + " WHERE " + where;
        }

        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }

            const response = {
                'peliculas': peliculas,
                'total': resultado[0].total
            };

            res.send(JSON.stringify(response));    
        });            
    });
};

//FUNCION QUE TRAE LA PELICULA CON EL ID
function detallesPelicula(req,res){
    id = req.params.id;
    sql2 = `SELECT pelicula.titulo, pelicula.trama, pelicula.duracion, pelicula.director, pelicula.fecha_lanzamiento, pelicula.anio,pelicula.poster,pelicula.puntuacion, actor.nombre as actor, genero.nombre as genero_nombre FROM (((actor_pelicula INNER JOIN actor ON actor.id = actor_pelicula.actor_id) INNER JOIN pelicula ON pelicula.id = actor_pelicula.pelicula_id) INNER JOIN genero ON pelicula.genero_id = genero.id) WHERE pelicula.id =${id}`;
    var actores = [];
    conexion.query(sql2, function(error,resultado){
        if(error){
            console.log("Hubo un error en la consulta",error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }
        //Junta los actores en un array
        resultado.forEach(element => {
            actores.push({'nombre':element.actor})
        });
        //Armado de la respuesta
        var detalles ={
            'pelicula' : {'titulo':resultado[0].titulo, 'trama':resultado[0].trama,'duracion':resultado[0].duracion,'director':resultado[0].director,'fecha_lanzamiento':resultado[0].fecha_lanzamiento,'anio':resultado[0].anio,'poster':resultado[0].poster,'puntuacion':resultado[0].puntuacion,'nombre':resultado[0].genero_nombre},
            'actores': actores
        }
        console.log(detalles);
        res.send(JSON.stringify(detalles));
    })
    }    

function recomendarPelicula(req, res){

    var genero = req.query.genero
    var puntuacion = req.query.puntuacion
    var anio_inicio = req.query.anio_inicio
    var anio_fin = req.query.anio_fin
    
    var sqlAnio = "(anio BETWEEN " + anio_inicio + " AND " + anio_fin + ")"
    var sqlPuntuacion = "puntuacion >= " + puntuacion
    var sqlGenero = "genero.nombre = '" + genero + "'"
    
    var sqlWhere = (function(){
            if(genero && puntuacion && !anio_inicio){
                return "WHERE " + sqlGenero + " AND " + sqlPuntuacion
            } else if (genero && !puntuacion && anio_inicio){
                return "WHERE " + sqlGenero + " AND " + sqlAnio
            } else if (genero && !puntuacion && !anio_inicio) {
                return "WHERE " + sqlGenero
            } else if(!genero && puntuacion && !anio_inicio) {
                return "WHERE " + sqlPuntuacion
            } else if(!genero && !puntuacion && anio_inicio){
                return "WHERE " + sqlAnio
            } else if(!genero && !puntuacion && !anio_inicio){
                return ""
            }
        })()
    
    var sqlRecomendacion = 
        `SELECT *, genero.nombre
        FROM pelicula
        LEFT JOIN genero on genero.id = pelicula.genero_id ` + sqlWhere

    conexion.query(sqlRecomendacion, function(error, resultado, fields){
        if(error){
             console.log("Hubo un error en la consulta", error.message)
            return res.status(404).send("Hubo un error en la consulta")
        }
            var response = {
                'peliculas': resultado
            }           
            res.send(JSON.stringify(response))      
        })
    
}
  

 

module.exports = {
   buscarPeliculas : buscarPeliculas,
   detallesPelicula: detallesPelicula,
   recomendarPelicula : recomendarPelicula
};