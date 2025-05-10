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
