const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connect, queryLogin, queryNewUser, createToken } = require('./database/database');
const { generateToken, validateToken } = require('./secure/secure');

dotenv.config();

const app = express();
const port = 9000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Username and password are required");
    return;
  }

  const client = await connect();
  const result = await queryLogin(client, { email, password });

  if (result && result.status === 200) {
    const token = generateToken(); // generar solo una vez
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    console.log("Token generado:", token); // imprimir el que se guardará y se enviará

    await createToken(client, { userId: result.data.id, token, expires });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000
    });

    res.send(result);
  } else {
    res.send(result);
  }
});


app.post('/protected', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  const validation = await validateToken(token);
  if (!validation.valid) {
    res.status(401).send("Unauthorized");
    return;
  }

  res.send(`Welcome ${validation.user_id}`);
});

app.post('/register', async (req, res) => {
  const { username, password, name, lastname, rol } = req.body;

  if (!username || !password || !name || !lastname || !rol) {
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
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
