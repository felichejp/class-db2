const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión a PostgreSQL exitosa');
    
    // Verificar si PostGIS está instalado
    const postgisResult = await client.query('SELECT PostGIS_Version()');
    console.log(`PostGIS version: ${postgisResult.rows[0].postgis_version}`);
    
    client.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};