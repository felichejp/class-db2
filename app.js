const express = require('express')
const { connect, query } = require('./database.js')
const pg = require('pg');
const app = express()
const port = 8080

app.use(express.json())

app.get('/sexo', async function (req, res) {
      const client = await connect();
      const result = await query(
        'SELECT osm_id, ST_NPoints(way) AS numero_puntos, ' +
        'ST_AsGeoJSON((ST_DumpPoints(way)).geom) AS punto ' +
        'FROM planet_osm_line LIMIT 10',
        client
      );
      await client.end();
      res.send(result);
});


app.post('/POSTparto', async function (req, res) {
    const { id } = req.body;
    const client = await connect();
    try {
    const result = await query(
    'SELECT ST_AsGeoJSON(way) AS wayjson FROM planet_osm_line WHERE osm_id = $1',
    [id],
    client);
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
