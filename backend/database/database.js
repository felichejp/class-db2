const { Client } = require('pg');
require('dotenv').config();
const queries = require('./queries');

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

client.connect();

async function connect() {
  return client;
}

async function queryLogin(client, { email, password }) {
  const query = queries.find(q => q.name === 'login').query;
  const params = [email, password];
  const res = await client.query(query, params);

  if (res.rows && res.rows.length === 0) {
    return { status: 401, message: 'Unauthorized', data: null };
  }

  if (res.rows[0].ispassok) {
    return { status: 200, message: 'Authorized', data: res.rows[0] };
  } else {
    return { status: 401, message: 'Unauthorized', data: null };
  }
}

async function queryNewUser(client, { username, email, password, name, lastname, rol }) {
  const query = queries.find(q => q.name === 'create_user').query;
  const params = [username, rol, name, lastname];
  const res = await client.query(query, params);

  if (res.rows && res.rows.length === 0) {
    return { status: 401, message: 'Unauthorized', data: null };
  }

  const userId = res.rows[0].id;

  const queryPassword = queries.find(q => q.name === 'create_password').query;
  const paramsPassword = [userId, password];
  const resPassword = await client.query(queryPassword, paramsPassword);

  if (resPassword.rows && resPassword.rows.length === 0) {
    return { status: 401, message: 'Unauthorized', data: null };
  }

  return { status: 200, message: 'User created', data: { id: userId, username, email, name, lastname, rol } };
}

async function createToken(client, { userId, token, expires }) {
  const query = queries.find(q => q.name === 'create_token').query;
  const params = [userId, token, expires];
  await client.query(query, params);
}

module.exports = {
  connect,
  queryLogin,
  queryNewUser,
  createToken,
  client
};
