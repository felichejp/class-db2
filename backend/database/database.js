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
      ssl: false
  });
  await client.connect() // Conectar a la base de datos
  console.log('Conneted to database') // Mostrar mensaje en consola
  return client // Retornar cliente
}

// Función para realizar consultas
async function queryLogin(client, {email, password }) {
  const query = queries.find(q => q.name === 'login').query;
  const params = [email, password];
  const res = await client.query(query, params) // Realizar consulta
  // No hay registros coincidentes
  if (res.rows.length === 0) {
    response = {
      status: 401,
      message: 'Sin registros coincidentes',
      data: null,
      token:undefined
    }
    return response;
  }
  // Contraseña correcta
  if (res.rows[0].ispassok) {
    response = {
      status: 200,
      message: 'Authorized',
      data: res.rows[0],
      token: undefined  // Se rellena el token por el servidor backend, cuando le llegue un 200 code
    }
    return response;
  } else {
    response = {
      status: 401,
      message: 'Unauthorized',
      data: null,
      token: undefined
    }
    return response;
  }
}

async function queryNewUser(client, { username,rol, name, lastname, email, password}) {
  
  //Consulta para crear el usuario
  const query = queries.find(q => q.name === 'create_user').query;
  const params = [username, rol, name, lastname, email];
  const res = await client.query(query, params);

  // Consulta para obtener el id del usuario recién creado
   const query2 = queries.find(q => q.name === 'get_id_user_created').query;
   const params2 = [name]
  const res2 = await client.query(query2, params2);

  // Si no hay registro del usuario creado, error 
  if (res2.rows && res2.rows.length === 0) {
    response = {
      status: 401,
      message: 'Error al crear el usuario',
      data: null
    }
    return response;
  }

  // Consulta para crear la contraseña
  const countFail = 0   // Intentos fallidos por defecto
  const queryPassword = queries.find(q => q.name === 'create_password').query;
  const paramsPassword = [res2.rows[0].iduser, password, countFail];
  const resPassword = await client.query(queryPassword, paramsPassword);
  
  // Consulta para verificar la creación de contraseña
  const queryPassword2 = queries.find(q => q.name === 'verify_created_password').query;
  const paramsPassword2 = [res2.rows[0].iduser];
  const resPassword2 = await client.query(queryPassword2, paramsPassword2);
  
  
  if (resPassword2.rows && resPassword2.rows.length === 0) {
    response = {
      status: 401,
      message: 'Error al crear la contraseña',
      data: null
    }
    return response;
  }
  else
  {
      response = {
    status: 200,
    message: 'User created',
    data: res.rows[0]
  }
  return response;
  }
}

// Exportar funciones
module.exports = {
  connect,
  queryLogin,
  queryNewUser
}