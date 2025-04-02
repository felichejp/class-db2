const {Client } = require('pg');
require('dotenv').config();

async function connect() {
    const client  = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
    });
    await client.connect();
    console.log('Connection stablished');
    return client;
}

async function query(query, client){
    const res = await client.query(query);
    return res.rows;
}

module.exports = {
    connect,
    query
}