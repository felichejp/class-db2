const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const secretKey = "my_secret_key";

const { connect, queryLogin, queryNewUser, createUserToken, revocarToken } = require('./database/database');
const { generateToken } = require('./database/secure/secure');

/* const { connect, queryLogin, queryNewUser } = require('./database/database'); */
dotenv.config();

const app = express()
const port = 9000
app.use(cors({ origin: 'http://localhost:5500', 
  credentials: true, methods: ['POST', 'GET', 'OPTIONS']
 }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/login', async(req, res) => {
  const { email, password } = req.body;
  if( !email || !password ) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }
  const client = await connect();
  const result = await queryLogin(client, { email, password });
  if (result && result.status === 200) {
    const token = generateToken();
    const expires = new Date(Date.now() + 3600000); //1 hora
    const resultToken = await createUserToken(client, result.data.id, token, expires);
    const user = {
      username: result.data.user,
      nombre: result.data.name,
      apellido: result.data.lastname || "",
      email: result.data.email,
    };
    return res.status(200).json({
      message: 'Login exitoso',
      user,
      token: resultToken.token
    });
  } else {
    return res.status(401).json({ error: "Email o contraseña incorrectos" });
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
  const { username, password, name, lastname, email, rol } = req.body;
  if( !username || !password || !name || !lastname ||  !email || !rol ) {
    res.status(400).json({ error: "Faltan datos para completar el registro" });
    return;
  }
  const client = await connect();
  const result = await queryNewUser(client, { username, password, name, lastname,  rol, email });
  if (result && result.status === 200) {
    res.send(result);
  } else {
    res.send(result);
  }
})

app.post('/revoke-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token requerido" });
  }
  const client = await connect();
  const revoked = await revocarToken(client, token);
  if (revoked) {
    res.json({ message: "Token revocado correctamente" });
  } else {
    res.status(404).json({ error: "Token no encontrado o ya revocado" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
