import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { connect, ejecutarQuery } from "./database.js"; //Iporta funciones de database.js para la 
                                                        // conección y ejecucion de consultas

const app = express();
const port = 8080;

app.use(cors()); //Permite solicitudes desde el frontend
app.use(bodyParser.json()); //Para recibir datos en formato JSON


app.post('/buscar', async function (req, res) { //en la ruta buscar recibira un ID 
    const client = await connect();
    const {id} = req.body;
    if(!id){
        return res.status(400).json({error: "ID es requerido"}); //valida que si haya un ID

    }
    console.log(`Recibido ID: ${id}`); //impresion del ID
        
    const sql= //Consula donde mustra el num puntos de linea y su formato de coordenadas [1 2], [3,4]
        `SELECT 
                ARRAY_AGG(ST_AsText(p.geom)) AS coordenadas
            FROM planet_osm_line AS l,
            LATERAL ST_DumpPoints(l.way) AS p
            WHERE l.osm_id = $1`
    ;
    try {
        const result = await ejecutarQuery(sql, [id]);   //Ejecucion de la consulta   
        console.log("Datos obtenidos:", result); //impresion de los datos
        
        res.json(result.rows);
    } catch (error) { //errosononon si la consulta ni es correcta
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: "Error en la consulta" });
    } finally { //finalmente termina las acciones del cliente
        await client.end();
    }
});

app.listen(8080);




/*`SELECT 
                l.osm_id AS line_id, 
                COUNT(p.geom) AS num_puntos,
                ARRAY_AGG(ST_AsText(p.geom)) AS coordenadas
            FROM planet_osm_line AS l,
            LATERAL ST_DumpPoints(l.way) AS p
            GROUP BY l.osm_id
            HAVING COUNT(p.geom) < 10
            ORDER BY l.osm_id
            LIMIT 10;`
            
*/
// sigo trabajando en la consulta