const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { connect, queryLogin, queryNewUser } = require('./database/database');

dotenv.config();

const app = express();
const port = 9000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Username and password are required");
    return;
  }

  const client = await connect();
  const result = await queryLogin(client, { email, password });

  if (result && result.status === 200) {
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 1000
    });
  
    res.status(200).json({
      message: 'Login exitoso',
      user: {
        username: result.data.username,
        nombre: result.data.name,
        apellido: result.data.lastname,
        email: result.data.email
      },
      token
    });
  } 
 else {
    res.status(401).send("Credenciales incorrectas");
  }
});

app.post('/register', async (req, res) => {
  const { username, password, name, lastname, rol, email } = req.body;
  if (!username || !password || !name || !lastname || !rol || !email) {
    res.status(400).send("completa todos los campos");
    return;
  }

  const client = await connect();
  const result = await queryNewUser(client, { username, password, name, lastname, rol, email });
  if (result && result.status === 200) {
    res.send(result);
  } else {
    res.send(result);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


//ruta protegida para verificar el token
app.get('/protected', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      message: 'Acceso autorizado',
      user: decoded
    });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});
