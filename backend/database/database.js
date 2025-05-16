const { Client } = require('pg') // Importar Client de pg
require('dotenv').config() // Importar configuración de dotenv
const queries = require('./queries.json')

// Función para conectar a la base de datos
async function connect () {
  // Crear instancia de Client con la configuración de dotenv
  const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
  });
  await client.connect() // Conectar a la base de datos
  console.log('Conneted to database') // Mostrar mensaje en consola
  return client // Retornar cliente
}

// Función para realizar consultas
async function queryAuth(client, { username, password }) { response } {
  const query = queries.find(q => q.name === 'auth').query;
  const params = [username, password];
  const res = await client.query(query, params) // Realizar consulta
  if (res.rows.length === 0) {
    res.response = {
      status: 401,
      message: 'Unauthorized',
      data: null
    }
  }
  if (res.rows[0].isPassOK) {
    res.response = {
      status: 200,
      message: 'Authorized',
      data: res.rows[0]
    }
  } else {
    res.response = {
      status: 401,
      message: 'Unauthorized',
      data: null
    }
  }
  return res.rows // Retornar filas de la respuesta
}

// Exportar funciones
module.exports = {
  connect,
  queryAuth
}