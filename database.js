const {Client} = require('pg');		// Se importa la clase cliente, el constructor lleva las credenciales en formato clave:valor
require('dotenv').config();	// No se importa ninguna función, se consulta el archivo de configuración 

// Crea un cliente con credenciales del archivo .env y luego realiza la conexión con el servidor localhost postgres
async function connect() 
{
	const client= new Client(
	{
		host: process.env.DB_HOST,	// Crea un cliente con las siguientes conexiones
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});
	await client.connect();	// Realiza la conexión a la base de datos
	console.log('Connected to database');
	return client;
}

async function query(query, client)
{
	const result = await client.query(query);	// El método query del objeto de la clase Client maneja las consultas
	//console.log(result.rows);
	return result.rows;
}

// Exportar las funciones, en forma de objeto
module.exports = {
	connect,
	query
}
