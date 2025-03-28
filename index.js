const express = require('express')
const { connect, query } = require('./database.js')
const pg = require('pg');
const app = express()
const port = 8080

app.use(express.json()); // Agregar esto al inicio del archivo

app.get('/', async function (req, res) {
  const client = await connect();
  const result = await query(
    'SELECT osm_id, ST_NPoints(way) AS numero_puntos, ' +
    'ST_AsGeoJSON((ST_DumpPoints(way)).geom) AS punto ' +
    'FROM planet_osm_line LIMIT 5',
    client
  );
  await client.end();
  res.send(result);

});

//hacer consulta a la base de datos
/*app.get('/consulta', async function (req, res) {
  const client = await connect();
  const result = await query(
    'SELECT osm_id, l.higheay, l.name, l.oneway,l.way, p.way' +
    'FROM planet_osm_line l INNER JOIN planet_osm_polygon p on ST_Contains(p.way,l.way) AND p."name"=\'Morelia\' ' +
    'WHERE l.highway IS NOT NULL'+
    'AND l.name LIKE \'%Avenida Universidad%\' ' +
    'LIMIT 5',
    client
  );
  await client.end();
  res.send(result);

});*/
app.post('/consultaDatos', async function (req, res) {
  const { id } = req.body;
  const client = await connect();
  try {
        const result = await query(
              'SELECT ST_AsGeoJSON(way) AS wayjson FROM planet_osm_line WHERE osm_id = $1',
              [id],
              client
        );
        if (result.rows.length === 0) {
              res.status(404).send('Línea no encontrada');
        } else {
              // El campo wayjson es un string JSON, lo parseamos para extraer las coordenadas.
              const geojson = JSON.parse(result.rows[0].wayjson);
              const points = geojson.coordinates;
              res.send(points);
        }
  } catch (error) {
        res.status(500).send(error.message);
  } finally {
        await client.end();
  }
});

app.get('/hello', function (req, res) {
  res.send('Hello World!')
})

console.log('Server running at http://localhost:${port}/')

app.listen(8080)