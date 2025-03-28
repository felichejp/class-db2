const express = require('express')
const { connect, query } = require('./database.js')
const pg = require('pg');
const app = express()
const port = 8080

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* TA OCUPAOOO 

const query = `
SELECT * FROM planet_osm_point 
`

*/

/*
app.get('/', async function (req, res) {
  const client = await connect();
  const result = await query('SELECT * FROM planet_osm_point LIMIT 10', client);
  await client.end();

  res.send(result);
})

*/

/* Se supone que este es el chido 
app.get('/', async function (req, res) {
  const client = await connect();
  const result = await query('SELECT SUM(ST_NPoints(way)) AS total_puntos FROM planet_osm_line', client);
  await client.end();
  res.send(result);
})
*/

/*
app.get('/', async function (req, res) {
  const client = await connect();
  const result = await query('SELECT osm_id, (dp).geom AS punto FROM planet_osm_line, LATERAL ST_DumpPoints(way) AS dp', client);
  await client.end();
  res.send(result);
})
*/

app.get('/datos', async function (req, res) {
  const client = await connect();
  const result = await query(
    'SELECT osm_id, ST_NPoints(way) AS numero_puntos, ' +
    'ST_AsGeoJSON((ST_DumpPoints(way)).geom) AS punto ' +
    'FROM planet_osm_line LIMIT 10000',
    client
  );
  await client.end();
  res.send(result);

});

app.get('/hello', function (req, res) {
  res.send('Hello World!')
})

console.log(`Server running at http://localhost:${port}/`)

app.listen(8080)


app.get('/consulta', async function (req, res) {
  const client = await connect();
  const result = await query(
    'SELECT osm_id, l.highway, l.name, l.oneway,l.way, p.way' +
    'FROM planet_osm_line l INNER JOIN planet_osm_polygon p on ST_Contains(p.way,l.way) AND p."name"=\'Morelia\' ' +
    'WHERE l.highway IS NOT NULL'+
    'AND l.name LIKE \'%Avenida Universidad%\' ' +
    'LIMIT 5',
  client
  );
  await client.end();
  res.send(result);
});

// points={{x,y}{x,y  }}
/*

app.get('/datos2', async function (req, res) {
  const client = await connect();
  const result = await query(
    'SELECT ST_NPoints.coordinates '
      'SELECT osm_id, ST_NPoints(way) AS numero_puntos, ' +
      'ST_AsGeoJSON((ST_DumpPoints(way)).geom) AS punto ' +
      'FROM planet_osm_line LIMIT 10000',
      client
  );
  await client.end();
  res.send(result);

});

*/


app.post('/getcoord', async function (req, res) {
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  if (!req.body || req.body.id === undefined) {
    return res.status(400).send('Missing id parameter in request body');
  }
  
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