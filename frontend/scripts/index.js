const express = require('express');
const pg = require('pg');
const { connect, query }= require('./database');
const app = express();

const port = 8080;

app.get('/', async function (req, res){
    const client = await connect();
    const r =  await query(
        'SELECT * FROM planet_osm_line', 
        client
    );
    await client.end();
    res.send(r);

});

app.use(express.json());

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    res.json({ message: `Login recibido para ${email}` });
});

app.post('/register', async (req, res) => {
    const { nombre, apellido, email, password } = req.body;
    res.json({ message: `Registro recibido para ${nombre} ${apellido}` });
});

app.listen(8080);