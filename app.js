const express = require('express');
const { query } = require('./database');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <form action="/" method="post">
      <input type="text" name="osm_id">
      <button>></button>
    </form>
  `);
});

app.post('/', async (req, res) => {
  try {
    const osmId = req.body.osm_id;
    const result = await query(
      `SELECT array_agg(ST_X(geom) || ' ' || ST_Y(geom)) FROM st_dumppoints((SELECT way FROM planet_osm_line WHERE osm_id = '${osmId}')) as a;`
    );
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.listen(3000)