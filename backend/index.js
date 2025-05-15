const express = require('express') // Importar express
const pg = require('pg') // Importar pg
const path = require('path')
const app = express() // Crear instancia de express

app.use(express.urlencoded({ extended: true })) // Middleware para parsear formularios
app.use(express.static(path.join(__dirname, 'public'))) // Servir archivos estáticos

// Ruta raíz: muestra el formulario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Ruta para recibir el formulario
app.post('/login', async (req, res) => {
  const { user, pass } = req.body

  // Validar que los campos no estén vacíos
  if (!user || !pass) {
    return res.status(400).send('Usuario y contraseña son requeridos')
  }

  // Crear un nuevo cliente de PostgreSQL con las credenciales recibidas
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: user,
    password: pass,
    database: 'osm'
  })

  try {
    await client.connect()
    // Si conecta, muestra mensaje de éxito
    res.send('¡Conexión exitosa a la base de datos!')
  } catch (err) {
    // Si falla, muestra mensaje de error
    res.send('Error de conexión: ' + err.message)
  } finally {
    await client.end()
  }
})

app.listen(9000, () => { // Iniciar servidor en el puerto 9000
  console.log('Servidor corriendo en http://localhost:9000')
})