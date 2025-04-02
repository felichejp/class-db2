import { query } from './database.js';

async function main() {
  // Consulta que usa funciones nativas de PostGIS
  const sql = `
    SELECT 
      ST_AsGeoJSON(way) AS geojson
    FROM 
      planet_osm_line
    WHERE 
      way IS NOT NULL
    LIMIT 3
  `;

  const results = await query(sql);
  
  results.forEach((line, index) => {
    if (line) {
      try {
        const geojson = JSON.parse(line);
        console.log(`\nLínea ${index + 1}:`);
        console.log('Coordenadas:', geojson.coordinates);
      } catch (e) {
        console.error('Error al parsear JSON:', e.message);
      }
    }
  });
}

main();