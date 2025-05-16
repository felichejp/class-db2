const express = require('express');
const dotenv = require('dotenv');
const { connect, query } = require('./database/database');
dotenv.config();

const app = express()
const port = 9000
app.use(express.json())

app.get('/', async (req, res) => {
  const client = await connect();
  if (!client.connected) {
    client.connect();
  }
  console.log("Connected");
  client.end();
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
