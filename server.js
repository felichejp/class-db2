const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  res.send('Hola profe Feliche, y hola mundo');});
app.listen(port, () => {
    console.log(`Aparentemente está funcinando, debería de correr el server en: http://localhost:${port}`);});