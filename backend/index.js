const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connect, queryLogin, queryNewUser } = require('./database/database');
dotenv.config();

const app = express()
const port = 9000
app.use(cors({ origin: '*' }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.post('/login', async(req, res) => {
  const { email, password } = req.body;
  if( !email || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryLogin(client, { email, password });
  if (result && result.status === 200) {
    res.send(result);
  } else {
    res.send(result);
  }
})

app.post('/register', async(req, res) => {
  const { username, password, name, lastname, email, rol } = req.body;
  if( !username || !password || !name || !lastname || !rol || !email ) {
    res.status(400).json({ error: "Faltan datos para completar el registro" });
    return;
  }
  const client = await connect();
  try {
    // Verificar si ya existe el email o username
    const userExists = await client.query('SELECT 1 FROM users WHERE email = $1 OR "user" = $2', [email, username]);
    if (userExists.rows.length > 0) {
      res.status(409).json({ error: "El email o nombre de usuario ya existe" });
      return;
    }
    const result = await queryNewUser(client, { username, password, name, lastname, rol, email });
    if (result && result.status === 200) {
      res.json({ message: "Usuario registrado exitosamente" });
    } else {
      res.status(500).json({ error: "No se pudo registrar el usuario" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
