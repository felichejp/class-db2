/*const {Client} = require('pg');
require('dotenv').config()

async function connect() 
{
	const client = new Client
	({
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME
	});
	await client.connect();
	console.log ('Connected to database');
	console.log (client);
	return client;
}
async function query(query, client)
{
	return await client.query(query).rows;
}
module.exports = {
	connect,
	query
}
*/

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function query(query) {
  const client = await pool.connect();
  try {
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release(); // Libera el cliente de vuelta al pool
  }
}

module.exports = {
  query,
};