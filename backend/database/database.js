const { Client } = require('pg')
require('dotenv').config()

async function connect () {
  const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
  });
  await client.connect()
  console.log('Conneted to database')
  return client
}

async function query(query,  params = [], client) {
  const res = await client.query(query, params)
  return res;
}

// Exportar funciones
module.exports = {
  connect,
  query
}