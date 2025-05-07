const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        console.log('Conexión exitosa a la base de datos');
        const result = await client.query('SELECT osm_id, way FROM planet_osm_line;');
        console.log('Resultados:', result.rows);
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    } finally {
        await client.end();
    }
}

testConnection();