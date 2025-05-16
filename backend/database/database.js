const { Client } = require('pg') // Importar Client de pg
require('dotenv').config() // Importar configuración de dotenv

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
async function query (client,queryText, params = []) {
  const res = await client.query(queryText, params) // Realizar consulta
  return res.rows; // Retornar filas de la respuesta
}

// Exportar funciones
module.exports = {
  connect,
  query
}
