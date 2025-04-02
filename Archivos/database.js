const { Client } = require('pg'); 
require('dotenv').config();

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

    async function query(query, client) { 
        const res = await  client.query(query); 
        return res.rows; 
    }

    module.exports = { 
        connect , 
        query
    };