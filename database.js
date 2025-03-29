const {Client } = require('pg');
require('dotenv').config();


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
async function query(query,client){
    const res = await client.query(query);
    console.log(res.rows);
    return res.rows;
}
module.exports = {
    connect,
    query
}