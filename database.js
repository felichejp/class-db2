import pkg from "pg";  
import dotenv from "dotenv"; //Cargar variables de entorno de .env

dotenv.config(); //No hay necesidades de poner credenciales aquí

const { Client } = pkg; //Para conectarse a Postgresql


//Crea un objeto con los datos de la conexion y se conecta a la base de datos
async function connect() {
    const client  = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    await client.connect();
    console.log('Connected to database');
    return client;
}

//Recibe una consulta sql, tambien parametros adicionales para evitar SQL Injection
export async function ejecutarQuery(sql, params = []) { 
    const client = await connect();  //Conexion
    const res = await client.query(sql, params); //Ejecuta la consulta
    await client.end(); //cerrar conexion
    return res.rows; //devuelve datos obtenidos
}
export {connect}; //Esto se exporta para que pueda utilizarlo index.js


/*
SQL Injection:
Es un ataque que introcude codigo SQL malicioso en los campos
de entrada de una aplicacion para manipular la base de datos
*/ 