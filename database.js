const { Client } = require('pg');
require('dotenv').config();

async function connect() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    await client.connect();
    return client;
}

function query(text, params, client) {
    return client.query(text, params);
}

module.exports = { connect, query };

// commit example