const express = require('express');
const pg = require('pg');
const { connect, query } = require('./database.js');
const app = express();
const port = 8080;

app.get('/', async function (req, res) {
  const client = await connect();
  const result = await query(
    'SELECT osm_id, ST_NPoints(way) AS n_puntos, '+ 
    'ST_AsGeoJSON((ST_DumpPoints(way)).geom) AS point '+
    'FROM planet_osm_line limit 50'
    , client
  );
  res.json(result);
  await client.end();
})


app.use(express.json()); 
app.post('/1827577k', async function (req, res) {
  const { id } = req.body; // Se obtiene el ID desde el body del request
  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID' });
  }

  const client = await connect();
  try {
    const result = await client.query(
      `SELECT ST_AsGeoJSON(dp.geom) as geojson 
       FROM (
         SELECT (ST_DumpPoints(way)).geom 
         FROM planet_osm_line
         WHERE osm_id = $1
       ) as dp`, [id]
    );

    const points = result.rows.map(row => {
      const geojson = JSON.parse(row.geojson);
      return geojson.coordinates;
    });

    res.json({ points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
});

console.log(`Servidor corriendo en http://localhost:${port}/`);

app.listen(port);