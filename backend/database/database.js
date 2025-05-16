const { Client } = require('pg')
require('dotenv').config()

async function connect () {
  const client = new Client({
      host: "db-class.cmr6u4w8wkgu.us-east-1.rds.amazonaws.com",
      port: "5432",
      user: "brandon_alex",
      password: "2100730H",
      database: "postgres"
  });
  await client.connect()
  console.log('Connected to database')
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