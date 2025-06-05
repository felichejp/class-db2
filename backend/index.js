const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Dependencias para el manejo de cookies
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { connect, queryLogin, queryNewUser } = require('./database/database');
dotenv.config();

const secretKey = 'secret_key_sam';  // LLave para general el token

const app = express()
const port = 9000
app.use(cors({ origin: '*' }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.post('/login', async(req, res) => {
  const { email, password } = req.body;
  //console.log(req.body)
  if( !email || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryLogin(client, { email, password });
  if (result && result.status === 200) {
    // Si el usuario se encuentra en la db (login exitoso, code 200)
    // Se genera un token a partir del id del usuario (no es info confidencial, la llave secreta 
    // y se configura el tiempo de expiración)
    //console.log(result.data)
    const token = jwt.sign({ id: result.data.idUser }, secretKey, { expiresIn: '1h' });
    console.log("Token generado: ",token);
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
    // Se envía el token al navegador del cliente
    result.token = token
    res.send(result);
  } else {
    res.send(result);
  }
})

app.post('/register', async(req, res) => {
  const { username, password, name, lastname, email } = req.body;
  
 // console.log(req.body)
  // Rol por defecto
  const rol = 1
  if( !username || !password || !name || !lastname || !email  || !rol) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryNewUser(client, { username,rol, name, lastname, email, password});
  if (result && result.status === 200) {
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
})

app.listen(port, () => {
  console.log(`Backend de Samuel corriendo en el puerto ${port}`)
})
