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
  if (res.rows.length === 0) {  // Sin registros coincidentes
    response = {
      status: 401,
      data: null,
      token:undefined
    }
    return response;
  }
  // Contraseña correcta
  if (res.rows[0].ispassok) {
    response = {
      status: 200,
      data: res.rows[0],  // Regresa el registro de usuario en las tablas users y passwords
      token: undefined  // Se rellena el token por el servidor backend, cuando le llegue un 200 code
    }
    return response;
  } else {  // Error de credenciales
    response = {
      status: 401,
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
  const res2 = await client.query(query2, params2); // Se obtiene el idUser de la tabla users

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
  // Se obtiene el iduser de la tabla passwords
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
    data: resPassword2.rows[0] // Regresa el id de usuario de la tabla passwords
  }
  return response;
  }
}

//Función para generar el token de sesión de usuario y retornarlo para su almacenamiento en el localStorage
async function createUserToken(client, idUser, token, expires) {
  const query = queries.find(q => q.name === 'create_user_token').query;
  const params = [idUser, token, expires];
  const res = await client.query(query, params);  // El insert no te regresa el resultset
  const query2 = queries.find(q => q.name === 'find_token_by_iduser').query;
  const params2 = [idUser];
  const res2 = await client.query(query2, params2); 
  if(res2 && res2.rows[0].length != 0)
  {
    return res2.rows[0];  // Regresa todo el registro del usurio en la tabla tokens
  }
  else
    return false;
}


// FUnción para validar un inicio de sesión exitoso previo
async function findTokenInDB(token) {
  const query = queries.find(q => q.name === 'find_token').query;
  const params = [token];
  const client = await connect();
  const res = await client.query(query, params);
  if(res.rows.length == 0)
  {
    return 
  }
  else
  {
    return res.rows[0];
  }
}

// FUnción para revocar el token del usuario para hacer logout
async function revokeTokenInDB(token) {
  const query = queries.find(q => q.name === 'revoke_token').query;
  const params = [token];
  const client = await connect();
  const res = await client.query(query, params);
  // Consulta auxiliar para verificar el estado del token
  const query2 = queries.find(q => q.name === 'find_token').query;
  const res2 = await client.query(query2, params);  
  return res2.rows[0]; // Se regresa el registro del token del usuario
}

// Exportar funciones
module.exports = {
  connect,
  queryLogin,
  queryNewUser,
  findTokenInDB,
  createUserToken,
  revokeTokenInDB
}