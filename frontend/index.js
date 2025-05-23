const express = require('express') // Importar express
const path = require('path') // Importar path
const app = express() // Crear instancia de express

app.use(express.static(path.join(__dirname, 'public'))) // Servir archivos estáticos

// Ruta raíz: muestra el formulario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(9000, () => {
  console.log('Frontend corriendo en http://localhost:9000')
})