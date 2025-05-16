const express = require('express');
const dotenv = require('dotenv');
const { connect, queryAuth } = require('./database/database');
dotenv.config();

const app = express()
const port = 9000
app.use(express.json())

app.post('/auth', async(req, res) => {
  const { username, password } = req.body;
  if( !username || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryAuth(client, { username, password });
  if (result.rows.length > 0 && result.row[0].isPassOk) {
    res.send("User authenticated");
  } else {
    res.send("User not authenticated");
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
