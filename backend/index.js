const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { connect, queryLogin, queryNewUser, createUserToken, findTokenInDB, revokeToken } = require('./database/database');

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
    const token = jwt.sign({ email }, process.env.JWT_SECRET,{ expiresIn: '30s' });
    
    const expires = new Date(Date.now() + 30 * 1000); // 30 segundos
    await createUserToken(client, {idUsers: result.data.id, token, expires}); // lo guardas en tu tabla

    res.cookie('token', token, { httpOnly: true, secure: false,maxAge: 30 * 1000 });// aqui defino los 30 segundos
  
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
app.get('/protected', async (req, res) => {
  const token = req.cookies.token;
// lo que le da el res
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }
//abre conexion para las consulas en la base de datos
    const client = await connect();
    const tokenRecord = await findTokenInDB(client, { token }); // para buscar en la tabla tokens

    if (!tokenRecord) { //no esta en la tabla 
      return res.status(401).json({ error: 'Token no encontrado en la base de datos' });
    }

    if (tokenRecord.revoked) {// ya ha sido revocado
      return res.status(401).json({ error: 'Token revocado' });
    }

    const now = new Date();
    const expires = new Date(tokenRecord.expires);// compara fecha actual con el de expire de la tabla 
    if (now > expires) { //ya expiro
      return res.status(401).json({ error: 'Token expirado' });
    }
// hasta aqui si todo esta bien 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      message: 'Acceso autorizado',
      user: decoded
    });
});

// ruta para cerrar sesión y revocar el token
app.post('/logout', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({ error: 'No hay token para revocar' });
  }

  const client = await connect();
  const tokenRecord = await findTokenInDB(client, { token });

  if (!tokenRecord) {
    return res.status(400).json({ error: 'Token no registrado' });
  }

  if (tokenRecord.revoked) {
    return res.status(400).json({ error: 'Token ya estaba revocado' });
  }

  // Revocar el token en la base de datos
  await revokeToken(client, { token });

  // Borrar cookie del cliente
  res.clearCookie('token');

  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
});


