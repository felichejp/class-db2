const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la configuración de la base de datos
const { testConnection } = require('./config/db');

// Importar rutas
const wayRoutes = require('./routes/wayRoutes');

// Inicializar la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de consultas a OpenStreetMap con PostgreSQL/PostGIS',
    endpoints: {
      getWayPoints: 'GET /api/ways/:id',
      postWayPoints: 'POST /api/ways/points'
    }
  });
});

// Rutas API
app.use('/api/ways', wayRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Ruta para cualquier otra solicitud
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
const startServer = async () => {
  try {
    // Probar la conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Verifica tu configuración.');
      process.exit(1);
    }

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`API disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Ejecutar el servidor
startServer();

module.exports = app;