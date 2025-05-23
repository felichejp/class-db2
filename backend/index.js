const express = require('express');
const dotenv = require('dotenv');
const pg = require('pg');

dotenv.config();

const app = express()
const port = 9000
app.use(express.json())

const client = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
})

app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  if (!client.connected) {
    client.connect();
  }
  if (username === "admin" && password === "admin") {
    res.send("Login successful");
  } else {
    res.send("Login failed");
  }
})

app.post('/login', async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).send("login incorrecto");
  }

  try {
    if (!client._connected) {
      await client.connect();
      client._connected = true;
    }

    const query = `
      SELECT
        crypt($1, p.password) = p.password AS ispassok
      FROM users u
      JOIN passwords p ON u.id = p.iduser
      WHERE u."user" = $2
    `;

    const result = await client.query(query, [password, user]);

    if (result.rows.length > 0 && result.rows[0].ispassok === true) {
      res.send("login correcto");
    } else {
      res.send("login incorrecto");
    }

  } catch (err) {
    res.send("login incorrecto");
  }
});


app.post('/register', async (req, res) => {
  const { user, name, lastname, password } = req.body;

  if (!user || !name || !lastname || !password) {
    return res.status(400).send("registro fallido");
  }

  try {
    if (!client._connected) {
      await client.connect();
      client._connected = true;
    }
    const insertUserQuery = `
      INSERT INTO users ("user", name, lastname)
      VALUES ($1, $2, $3) RETURNING id
    `;
    const userResult = await client.query(insertUserQuery, [user, name, lastname]);
    const userId = userResult.rows[0].id;
    const insertPasswordQuery = `
      INSERT INTO passwords (iduser, password)
      VALUES ($1, crypt($2, gen_salt('md5')))
    `;
    await client.query(insertPasswordQuery, [userId, password]);

    res.send("registro exitoso");

  } catch (err) {
    res.send("registro fallido");
  }
});



app.post('/isUserAuth', async (req, res) => {
    const { username, password } = req.body;
    if (!client.connected) {
      client.connect();
    }
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      if (result.rows[0].password === password) {
        res.send("User authenticated");
      } else {
        res.send("User not authenticated");
      }
    } else {
      res.send("User not authenticated");
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
