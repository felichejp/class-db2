const express = require('express');
const dotenv = require('dotenv');
const pg = require('pg');
const cors = require('cors');

dotenv.config();
const app = express();
const port = 9000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos (una sola vez)
const client = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err.stack));

// RUTA: Registro de usuario
app.post('/register', async (req, res) => {
  const { username, email, name, lastname, password } = req.body;

  if (!username || !email || !name || !lastname || !password) {
    return res.status(400).send("Datos incompletos");
  }

  try {
    const insertUserQuery = `
      INSERT INTO users (username, email, name, lastname)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const userResult = await client.query(insertUserQuery, [username, email, name, lastname]);
    const userId = userResult.rows[0].id;

    const insertPasswordQuery = `
      INSERT INTO passwords (iduser, password)
      VALUES ($1, crypt($2, gen_salt('md5')))
    `;
    await client.query(insertPasswordQuery, [userId, password]);

    res.send("Registro exitoso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al registrar usuario");
  }
});

// RUTA: Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Datos incompletos");
  }

  try {
    const query = `
      SELECT
        u.id,
        u.username,
        u.name,
        crypt($2, p.password) = p.password AS ispassok
      FROM users u
      JOIN passwords p ON u.id = p.iduser
      WHERE u.email = $1
    `;
    const result = await client.query(query, [email, password]);

    if (result.rows.length > 0 && result.rows[0].ispassok) {
      res.send("Login correcto");
    } else {
      res.send("Login incorrecto");
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Error en el login");
  }
});

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});
