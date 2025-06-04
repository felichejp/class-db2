const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const secretKey = 'my_secret_key';

const { connect, queryLogin, queryNewUser } = require('./database/database');
dotenv.config();

const app = express()
const port = 9000
app.use(cors({ origin: '*' }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/login', async(req, res) => {
  const { email, password } = req.body;
  if( !email || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryLogin(client, { email, password });

  if (result && result.status === 200) {
    const token = jwt.sign({ id: result.data.id }, secretKey, { expiresIn: '1h' });
    console.log(token);
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
    res.send(result);
  } else {
    res.send(result);
  }
})

app.post('/protected', async(req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    res.send(`Welcome ${decoded.id}`);
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
});

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
