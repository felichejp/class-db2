const PORT = 8080;
const express = require('express');
const bodyparser = require('body-parser');
const { connect, query } = require('./database');

const app = express();
app.use(bodyparser.json());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/test', async function (req, res) {
  const client = await connect();
  const result = await query(
    'SELECT osm_id, st_numpoints(way)' +
    'FROM planet_osm_line LIMIT 1'
    , client
  );
  res.json(result);
  await client.end();
})

app.get('/', async function (req, res) {
  res.render('index.html');
})

app.post('/search', async function (req, res) {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: 'ID Required' });
  }
  console.log(`ID: ${id}`);
  const client = await connect();
  const query =
  `SELECT ST_AsGeoJSON(dp.geom) as geojson FROM (
    SELECT (ST_DumpPoints(way)).geom 
    FROM planet_osm_line
    WHERE osm_id = $1
  ) as dp`;
  try {
    const result = await client.query(query, [id]);
    const points = result.rows.map(row => {
      const geojson = JSON.parse(row.geojson);
      return geojson.coordinates;
    });
    res.json({ points });
  } catch (error) {
    console.error("Bad query:", error);
    res.status(500).json({ error: "Error" });
  } finally {
    await client.end();
  }
});

app.listen(PORT);
console.log(`Server running on: http://localhost:${PORT}/`);