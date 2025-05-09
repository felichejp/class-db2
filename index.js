const express = require('express');
const session = require('express-session');

const app = express()
const port = 8000

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
    res.send("Fabian first PR:)")
  } else {
    res.send("Unauthorized");
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send("Logout");
})

app.get('/login', (req, res) => {
  req.session.userid = 1234;
  res.send("Login");
})

app.get('/private', (req, res) => {
  if (!req.session.username) {
    res.send("Unauthorized");
  }
  res.send("Private");
})

app.get('/wallet', (req, res) => {
if (!req.session.userid) {
    res.send("Unauthorized");
  }
  res.send("Wallet amount 1000");
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
