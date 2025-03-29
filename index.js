const express = require('express') // Importar express
const path = require('path')
const {connect, query} = require('./database') // Importar funciones de database.js
const app = express() // Crear instancia de express

// Middleware para parsear datos del formulario
app.use(express.urlencoded({ extended: true }))

// Ruta GET para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')) // Enviar archivo index.html
})

// Ruta POST para obtener para obtener el way y convertirlo a un arreglo de puntos
app.post('/get_way', async function (req, res) {
  const { ID } = req.body // Obtener el ID del cuerpo de la solicitud
  if (!ID) {
      return res.status(400).send({ error: 'ID es requerido' })
  }

  const client = await connect() // Conectar a la base de datos
  try {
      // Consulta para obtener el way como GeoJSON
      const query_statement = `
        SELECT ST_AsGeoJSON(way) AS geojson
        FROM planet_osm_line
        WHERE osm_id = $1
      `
      const result = await query(query_statement, client, [ID]) // Realizar consulta con parámetro
      await client.end() // Cerrar conexión

      if (result.length === 0) {
          return res.status(404).send({ error: 'ID no encontrado' })
      }

      // Convertir el GeoJSON a un arreglo de puntos
      const geojson = JSON.parse(result[0].geojson)
      const coordinates = geojson.coordinates // Extraer las coordenadas

      res.send({ points: coordinates }) // Enviar arreglo de puntos al cliente
  } catch (error) {
      await client.end() // Asegurar cierre de conexión en caso de error
      console.error(error)
      res.status(500).send({ error: 'Error interno del servidor' })
  }
})

app.listen(8080, () => { // Iniciar servidor en el puerto 8080
  console.log('Servidor corriendo en http://localhost:8080')
})