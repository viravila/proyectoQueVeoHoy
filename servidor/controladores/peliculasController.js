const conexion = require('../lib/conexionbd');

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

function buscarPelicula(req, res) {
    const id = req.params.id; 
    let sql = "SELECT * FROM pelicula WHERE id = " + id;

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna pelicula con este id");
            return res.status(404).send("No se encontro ninguna pelicula con este id");
        }

        const pelicula = resultado[0];

        sql = "SELECT actor.nombre FROM actor_pelicula INNER JOIN actor ON actor_pelicula.actor_id = actor.id WHERE actor_pelicula.pelicula_id = " + id;

        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }

            const actores = resultado;

            sql = "SELECT * FROM genero WHERE id = " + pelicula.genero_id;

            conexion.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la consulta", error.message);
                    return res.status(404).send("Hubo un error en la consulta");
                }

                const response = {
                    'pelicula': pelicula,
                    'actores': actores,
                    'genero': resultado[0]
                };
                
                res.send(JSON.stringify(response));    
            });             
        });     
    });
};

function recomendarPeliculas(req, res) {
    const genero = req.query.genero, 
          anio_inicio = req.query.anio_inicio, 
          anio_fin = req.query.anio_fin, 
          puntuacion = req.query.puntuacion

    let sql = "SELECT *  FROM pelicula INNER JOIN genero ON pelicula.genero_id = genero.id", 
        where = "";        

    if (genero){
        where = where + "genero.nombre = '" + genero + "'";
    }

    if (anio_inicio){
        if (genero){
            where = where + " AND ";
        }
        
        where = where + "anio >= " + anio_inicio;
    }

    if (anio_fin){
        if (genero || anio_inicio){
            where = where + " AND ";
        }
        
        where = where + "anio <= " + anio_fin;
    }

    if (puntuacion){
        if (genero || anio_inicio || anio_fin){
            where = where + " AND ";
        }
        
        where = where + "puntuacion = " + puntuacion;
    }

    if (where){
        sql = sql + " WHERE " + where;
    }

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        const response = {
            'peliculas': resultado
            };

        res.send(JSON.stringify(response));    
    });
};

module.exports = {
   buscarPeliculas : buscarPeliculas,
   buscarPelicula : buscarPelicula,
   recomendarPeliculas : recomendarPeliculas
};