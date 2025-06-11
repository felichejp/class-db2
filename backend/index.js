const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const secretKey = 'my_secret_key';

const { connect, queryLogin, queryNewUser, findTokenInDB, createUserToken } = require('./database/database');
const { generateToken } = require('./secure/secure');
dotenv.config();

const app = express()
const port = 9000
/*app.use(cors({
  origin: 'http://127.0.0.1:5500', // O el que te muestre Live Server
  credentials: true
})); */
app.use(cors({ origin : '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/login', async(req, res) => {
  const { email, password } = req.body;
  if( !email || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const user = await queryLogin(client, { email, password });

  if (user && user.status === 200) {
    //const token = jwt.sign({ id: result.data.id }, secretKey, { expiresIn: '1h' });
    //console.log('Token generado',token);
    //res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 3600000 });
    const token = generateToken();
    const expires = new Date(Date.now() + 3600000); // 1 hora
    const resultToken = await createUserToken(client, { idUser : user.data.id , token, expires });
    res.send({
      user,
      token: resultToken.token
    });
  } else {
    res.send(user);
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
    res.send(`Welcome user with ID: ${decoded.id}`);
  } catch (err) {
    res.status(401).send("Unauthorized - Token invalido");
  }
});

app.post('/register', async(req, res) => {
  const { username, password, name, lastname, email } = req.body;
  if( !username || !password || !name || !lastname || !email ) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryNewUser(client, { username, password, name, lastname, email });
  if (result && result.status === 200) {
    res.send(result);
  } else {
    res.send(result);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
