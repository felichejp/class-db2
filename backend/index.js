const express = require('express');
const dotenv = require('dotenv');
const { connect, query } = require('./database/database');
dotenv.config();

const app = express()
const port = 9000
app.use(express.json())



app.post('/auth', async(req, res) => {
  const { username, password } = req.body;
  if( !username || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  console.log('BODY:', req.body); 
  const client = await connect();
  
  const result = await query(
    `SELECT u.id, u.name, u.rol 
     FROM users u 
     JOIN passwords p ON u.id = p.iduser 
     WHERE u."user" = $1 AND p.password = crypt($2, p.password)`,
    [username, password],
    client
  );
  
  console.log('RESULT:', result.rows);
  if (result && result.rows.length > 0) {
    res.send("User authenticated");
  } else {
    res.send("User not authenticated");
  }
})

app.post('/registro', async (req, res) => {
  const { name, lastname, username, password } = req.body;
  console.log('Solicitud recibida en /registro:', req.body);


  if (!name || !lastname || !username || !password) {
    return res.status(400).send("Faltan campos requeridos");
  }

  try {
    const client = await connect();

    // Verifica si el usuario ya existe
    const checkUser = await query(
      `SELECT * FROM users WHERE "user" = $1`,
      [username],
      client
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).send("Usuario ya existe");
    }

    // Inserta en users
    await query(
      `INSERT INTO users(name, lastname, "user", rol) VALUES($1, $2, $3, $4) RETURNING id`,
      [name, lastname, username, '1'],
      client
    ).then(async insertUser => {
      const userId = insertUser.rows[0].id;

      // Inserta en passwords (usa crypt)
      await query(
        `INSERT INTO passwords(password, iduser) VALUES(crypt($1, gen_salt('des')), $2)`,
        [password, userId],
        client
      );
    });

    res.send("User registered");
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).send("Error al registrar el usuario");
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})