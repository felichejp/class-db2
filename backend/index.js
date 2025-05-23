const express = require('express') // Importar express
const pg = require('pg') // Importar pg
const path = require('path') // Importar path
const app = express() // Crear instancia de express
const { connect, query } = require('./database/database.js'); // Importar funciones de base de datos

// Middleware para parsear formularios
app.use(express.urlencoded({ extended: true })) 

// Ruta para recibir el formulario
app.post('/login', async (req, res) => {
  const { user, pass } = req.body

  // Validar que los campos no estén vacíos
  if (!user || !pass) {
    return res.status(400).send('Usuario y contraseña son requeridos')
  }

  try {
    // Conectar a la base de datos
    const client = await connect()
    // Realizar consulta para verificar usuario y contraseña
    const query_text = 
    'SELECT crypt($2, p.pass) = p.pass AS ispassok \
     FROM users u JOIN pass p ON u.id = p.idUser \
     WHERE u.user = $1'
    const result = await query(query_text, client, [user, pass])

    // Verificar si el usuario existe
    if (result.rows.length > 0 && result.rows[0].ispassok == true) {
      res.send('Usuario y contraseña correctos')
    }
    else {
      res.send('Usuario o contraseña incorrectos')
    }

  } catch (err) {
    // Si falla, muestra mensaje de error
    res.send('Error de conexión: ' + err.message)
  } finally {
    await client.end()
  }
})

app.post('/register', async (req, res) => {
  const { user, name, lastname, pass } = req.body

  if (!user || !name || !lastname || !pass) {
    return res.status(400).send('Usuario, nombre, apellido y contraseña son requeridos')
  }

  const client = await connect()
  try {
    await client.query('BEGIN')

    // Insertar en users y obtener el id generado
    const userResult = await client.query(
      'INSERT INTO users ("user", name, lastname, rol) VALUES ($1, $2, $3, 1) RETURNING id',
      [user, name, lastname]
    )
    const userId = userResult.rows[0].id

    // Insertar en pass usando el id del usuario
    await client.query(
      'INSERT INTO pass (idUser, pass) VALUES ($1, crypt($2, gen_salt(\'md5\')))',
      [userId, pass]
    )

    await client.query('COMMIT')
    res.send('Registro exitoso, id: ' + userId)
  } catch (err) {
    await client.query('ROLLBACK')
    res.send('Error de conexión: ' + err.message)
  } finally {
    await client.end()
  }
})

app.listen(9001, () => {
  console.log('Backend corriendo en http://localhost:9001')
})