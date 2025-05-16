const {Client} = require('pg');		// Se importa la clase cliente, el constructor lleva las credenciales en formato clave:valor
require('dotenv').config();	// No se importa ninguna función, se consulta el archivo de configuración 

// Crea un cliente con credenciales del archivo .env y luego realiza la conexión con el servidor localhost postgres
async function connect() 
{
    const client= new Client(
    {
        host: process.env.DB_HOST,	// Que es process??
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    await client.connect();
    console.log('Connected to database');
    //console.log(client);
    return client;
}

// La base de datos no contesta luego luego, debe esperar
//  Necesitamos la consulta y el cliente 
// El cliente es un objeto que se crea con los datos de conexión en la 
// librería pg, tiene un metodo query que maneja las querys
async function query(client, query, params = [])
{
    //await measn async await
    const result = await client.query(query, params);
    console.log(result.rows);
    return result.rows;	// El resultado de la consulta tiene
                // varios metadatos, tiempo de conexión, etc
                //Solo una parte son los registros
}

// Exportar las funciones, en forma de objeto
module.exports = {
    connect,
    query
}