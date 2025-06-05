const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 8000;

// Configurar sesiones
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 5,
    httpOnly: true,
    secure: false
  }
}));

// Servir archivos estáticos (JS, CSS, imágenes, etc.)
app.use(express.static(__dirname));

// Rutas personalizadas para los HTML
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rutas de prueba de sesión
app.get('/', (req, res) => {
  if (req.session.userid) {
    res.send("Fabian first PR:)");
  } else {
    res.send("Unauthorized");
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send("Logout");
});

app.get('/login-session', (req, res) => {
  req.session.userid = 1234;
  res.send("Login (session)");
});

app.get('/private', (req, res) => {
  if (!req.session.username) {
    res.send("Unauthorized");
  }
  res.send("Private");
});

app.get('/wallet', (req, res) => {
  if (!req.session.userid) {
    res.send("Unauthorized");
  }
  res.send("Wallet amount 1000");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

