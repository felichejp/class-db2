const express = require('express');
const dotenv = require('dotenv');
const pg = require('pg');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express()
const port = 8000
app.use(express.json())

const client = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
})

//recibo username y pass
app.post('/register', async (req, res) => {
  const { username, pass } = req.body;
  if (!client.connected) {
    await client.connect();
  }

  await client.query('INSERT INTO users (username, pass) VALUES ($1, crypt($2, gen_salt(\'bf\')))',[username, pass]);
  res.send("Usuario registrado exitosamente");
})


app.post('/auth', async (req, res) => {
  const { username, pass } = req.body;
  if (!client._connected) {
    await client.connect();
  }

  //buscar si el usuario existe
  const userExist = await client.query('SELECT pass FROM users WHERE username = $1',[username]);

  if (userExist.rows.length === 0) {
    return res.send("Login failed: usuario no encontrado");
  }

  //validad contraseña 
  const password_match = await client.query('SELECT pass = crypt($2, pass) AS password_match FROM users WHERE username = $1',[username, pass]);

  if (password_match.rows[0].password_match) {
    res.send("Login successful");
  } else {
    res.send("Login failed: wrong password");
  }
});

app.post('/isUserAuth', async (req, res) => {
  // yo creo que aqui deberiamos usar lo de los token para una sesion, porque ya hizo la autenticacion en /auth
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
