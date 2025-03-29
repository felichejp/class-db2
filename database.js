const { Client } = require('pg'); //pg: interactuar con postgres
require('dotenv/config'); // toma las variables de .env

async function connect() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
    
    await client.connect();
    console.log('Conectado a la base de datos');
    
    return client;
}

async function query(queryText, client) {
    const res = await client.query(queryText);
    return res.rows;
}

module.exports = {
    connect,
    query
};