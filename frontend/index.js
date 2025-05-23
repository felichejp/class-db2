const express = require('express');
const session = require('express-session');

const app = express();
const port = 8000;

app.use(express.json());

app.use(express.static('public'));

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


app.get('/', (req, res) => {
  if (req.session.userid) {
    res.send("fer:)");
  } else {
    res.send("Unauthorized");
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await fetch(`http://localhost:3000/users?username=eq.${username}`, {
      headers: { 'Accept': 'application/json' }
    });

    const users = await response.json();

    if (users.length === 0) {
      return res.status(401).send('Usuario no encontrado');
    }

    const userID = users[0].userID;

    const passRes = await fetch(`http://localhost:3000/passwords?userID=eq.${userID}`, {
      headers: { 'Accept': 'application/json' }
    });

    const passData = await passRes.json();

    if (passData.length === 0 || passData[0].password !== password) {
      return res.status(401).send('Contraseña incorrecta');
    }

    // Guardar sesión
    req.session.userid = userID;
    req.session.username = username;

    res.send('Login correcto');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send("Logout");
});

// Otros endpoints protegidos
app.get('/private', (req, res) => {
  if (!req.session.username) {
    return res.send("Unauthorized");
  }
  res.send("Private");
});

app.get('/wallet', (req, res) => {
  if (!req.session.userid) {
    return res.send("Unauthorized");
  }
  res.send("Wallet amount 1000");
});

console.log("¿Está entrando aquí?");
app.listen(port, () => {
  console.log(`App escuchando en http://localhost:${port}`);
});

