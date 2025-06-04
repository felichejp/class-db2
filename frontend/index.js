const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');

const app = express()
const port = 8000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 5,
    httpOnly: true,
    secure: false
  }
}))

app.get('/', (req, res) => {
  if (req.session.userid) {
    // Redirigir a la página de bienvenida con el nombre de usuario
    res.sendFile(path.join(__dirname, 'inicio.html'));
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const response = await axios.post('http://localhost:9000/auth', {
      username,
      password
    });
    
    if (response.data === "User authenticated") {
      req.session.userid = username;
      res.redirect('/?username=' + encodeURIComponent(username));
    } else {
      res.status(401).redirect('/login?error=Credenciales+inválidas');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).redirect('/login?error=Error+del+servidor');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;
    
    const response = await axios.post('http://localhost:9000/register', {
      username,
      firstName,
      lastName,
      email,
      password
    });
    
    if (response.data === "User registered successfully") {
      res.redirect('/login?message=Registration+successful.+Please+login.');
    } else {
      res.redirect('/register?error=Registration+failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed: Server error';
    
    if (error.response) {
      errorMessage = error.response.data;
    }
    
    res.redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
  }
});

app.get('/private', (req, res) => {
  if (!req.session.username) {
    res.send("Unauthorized");
    return;
  }
  res.send("Private");
})

app.get('/wallet', (req, res) => {
  if (!req.session.userid) {
    res.send("Unauthorized");
    return;
  }
  res.send("Wallet amount 1000");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
