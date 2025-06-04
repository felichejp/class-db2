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
  const { username, password, name, lastname, rol } = req.body;
  if( !username || !password || !name || !lastname || !rol ) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryNewUser(client, { username, password, name, lastname, rol });
  if (result && result.status === 200) {
    res.send(result);
  } else {
    res.send(result);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})