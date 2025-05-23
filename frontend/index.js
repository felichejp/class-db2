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
    res.send("lograste ingresar " + req.session.userid + " al Himalaya helao?");
  } else {
    res.sendFile(path.join(__dirname, 'login.html'));
  }
})

app.get('/login',(req,res)=>{
  res.sendFile(path.join(__dirname,'login.html'));
})

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname,'registro.html'));
});

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
      res.redirect('/');
    } else {
      res.redirect('/login?error=' + encodeURIComponent('Credenciales inválidas'));

    }
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=' + encodeURIComponent('Inicio de sesión fallido'));
  }
});

app.post('/registro', async (req, res) => {
  try {
    const { name,lastname , username, password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
      return res.status(400).send("Contraseña no coincide");
    }

    const response = await axios.post('http://localhost:9000/registro', {
      name,
      lastname,
      username,
      password
    });
    if (response.data === "User registered") {
      return res.redirect('/login?success=Registro exitoso');
    } else {
      return res.redirect('/registro?error=Error al registrar el usuario'+encodeURIComponent(response.data));
    }


  } catch (error) {
    console.error('Register error:', error);
    return res.redirect('/registro?error=Error al registrar el usuario');
  }
})

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