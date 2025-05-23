const { Client } = require('pg') // Importar Client de pg
require('dotenv').config() // Importar configuración de dotenv
const queries = require('./queries')

// Función para conectar a la base de datos
async function connect () {
  // Crear instancia de Client con la configuración de dotenv
  const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: {
        rejectUnauthorized: false
      }
  });
  await client.connect() // Conectar a la base de datos
  console.log('Conneted to database') // Mostrar mensaje en consola
  return client // Retornar cliente
}

// Función para realizar consultas
async function queryLogin(client, { username, password }) {
  const query = queries.find(q => q.name === 'login').query;
  const params = [username, password];
  const res = await client.query(query, params) // Realizar consulta
  if (res.rows && res.rows.length === 0) {
    response = {
      status: 401,
      message: 'Unauthorized',
      data: null
    }
    return response;
  }
  if (res.rows[0].ispassok) {
    response = {
      status: 200,
      message: 'Authorized',
      data: res.rows[0]
    }
    return response;
  } else {
    response = {
      status: 401,
      message: 'Unauthorized',
      data: null
    }
    return response;
  }
}

async function queryNewUser(client, { username, password, name, lastname, rol }) {
  const query = queries.find(q => q.name === 'create_user').query;
  const params = [username, rol, name, lastname];
  const res = await client.query(query, params);
  if (res.rows && res.rows.length === 0) {
    response = {
      status: 401,
      message: 'Unauthorized',
      data: null
    }
    return response;
  }
  const queryPassword = queries.find(q => q.name === 'create_password').query;
  const paramsPassword = [res.rows[0].id, password];
  const resPassword = await client.query(queryPassword, paramsPassword);
  if (resPassword.rows && resPassword.rows.length === 0) {
    response = {
      status: 401,
      message: 'Unauthorized',
      data: null
    }
    return response;
  }
  response = {
    status: 200,
    message: 'User created',
    data: res.rows[0]
  }
  return response;
}

// Exportar funciones
module.exports = {
  connect,
  queryLogin,
  queryNewUser
}