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
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
  });
  await client.connect() // Conectar a la base de datos
  console.log('Conneted to database') // Mostrar mensaje en consola
  return client // Retornar cliente
}

async function queryLogin(client, { email, password }) {
  const loginUserQuery = queries.find(q => q.name === 'login').query;
  const params = [email, password];
  const res = await client.query(loginUserQuery, params) // Realizar consulta
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

async function queryNewUser(client, { username, password, name, lastname, email }) {
  const createUserQuery = queries.find(q => q.name === 'create_user').query;
  const createPasswordQuery = queries.find(q => q.name === 'create_password').query;

  try {
    await client.query('BEGIN'); // Inicia transacción

    // Insertar en users
    const userResult = await client.query(createUserQuery, [username, name, lastname, email]);
    if (userResult.rowCount === 0) {
      throw new Error('User insertion failed');
    }

    const userId = userResult.rows[0].id;

    // Insertar contraseña relacionada
    const passwordResult = await client.query(createPasswordQuery, [userId, password]);
    if (passwordResult.rowCount === 0) {
      throw new Error('Password insertion failed');
    }

    await client.query('COMMIT'); // Confirma transacción

    return {
      status: 200,
      message: 'User created',
      data: { id: userId, username, name, lastname, email }
    };
  } catch (error) {
    await client.query('ROLLBACK'); // Reversión si algo falla
    return {
      status: 500,
      message: `Error during user creation: ${error.message}`,
      data: null
    };
  }
}

async function findTokenInDB(client, { token }) {
  const query = queries.find(q => q.name === 'find_token').query;
  const params = [token];
  const res = await client.query(query, params);
  return res.rows[0];
}

async function createUserToken(client, { idUser, token, expires }) {
  const query = queries.find(q => q.name === 'create_user_token').query;
  const params = [idUser, token, expires];
  const res = await client.query(query, params);
  return res.rows[0];
}

// Exportar funciones
module.exports = {
  connect,
  queryLogin,
  queryNewUser,
  findTokenInDB,
  createUserToken
}