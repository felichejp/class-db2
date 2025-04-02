const pg = require('pg');
//require ('dotenv/config');
require('dotenv').config();

const { Client } = pg;

async function connect() {
    const client = new Client({
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

async function query(query, client) {
    const result = await client.query(query);
    console.log(result.rows);
    return result.rows;
}

module.exports = {
    connect,
    query
};