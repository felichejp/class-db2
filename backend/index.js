const express = require('express');
const dotenv = require('dotenv');
const { connect, query } = require('./database/database');
dotenv.config();

const app = express()
const port = 9000
app.use(express.json())

app.post('/', async (req, res) => {
  const { username, password } = req.body;
  const client = await connect();
  const result = await query( 'SELECT * FROM users WHERE username = $1 AND pass = crypt($2, pass);', [username, password], client);
  console.log('Result:', result.rows);
  if (result && result.rows.length > 0) {
    res.send("User authenticated");
  } else {
    res.send("User not authenticated");
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
