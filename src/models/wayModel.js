const { pool } = require('../config/db');

/**
 * Obtiene los puntos de una línea (way) de OSM por su ID
 * @param {number} wayId - El ID del way en OSM
 * @returns {Promise<Array>} - Promesa que resuelve a un array con los puntos
 */
const getWayById = async (wayId) => {
  try {
    // Consulta SQL para obtener la geometría del way como un array de puntos
    // Esta consulta asume que los datos OSM han sido importados usando osm2pgsql
    const query = `
      SELECT 
        w.osm_id,
        ST_AsText(w.way) as way_text,
        ST_AsGeoJSON(w.way) as geojson
      FROM 
        planet_osm_line w
      WHERE 
        w.osm_id = $1
    `;

    const result = await pool.query(query, [wayId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    throw new Error('Error al obtener el way: ' + error.message);
  }
};

module.exports = {
  getWayById
};