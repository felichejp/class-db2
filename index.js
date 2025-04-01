const express = require('express');	// Se importa la función express que crea una instancia de servidor, del modulo express desde node_modules
const {connect,query} = require('./database');	// Se importan las funciones desde el archivo database.js
const {parser} = require("./parser");	// Se importa el convertidor de datos
const app = express();		// Se crea una instancia de servidor


// Le dice a express que lea el cuerpo de las peticiones si vienen en formato url-encoded (req.body)
app.use(express.urlencoded({extended:true}));

// Se sirve el index.html que conendrá el formulario para hacer el post
app.get("/", (req, res)=>
{
	// La ruta de los archivos debe ser absoluta o} configurar un root. Se sirve un archivo del servidor 
	res.sendFile("/home/sam_mtz/bases2/post_line/index.html");
});

// Prueba con 615419837
app.post("/line", async (req,res) =>{
	// Se obtiene el id del body del html, a partir del name del input
	const line = req.body.line;
	// Se obtiene el linestring (conjunto de puntos en wkt)
	const query_points = `SELECT l.way from planet_osm_line l where osm_id = ${line}`;
	const client = await connect();
	let result1 = await query(query_points, client);
	//console.log(result1[0].way);
	// Se convierten esos puntos a coordenadas x e y
	let result2 = parser(result1[0].way);
	res.send(result2);
	//res.send(`<p>Los puntos que componene la linea con id = ${line} son: </p> <br> <div> ${result2}</div>`);
} );

//constraint: undefine
app.listen(8080);


