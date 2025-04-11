const express = require('express');
const router = express.Router();
const wayController = require('../controllers/wayController');

/**
 * @route   GET /api/ways/:id
 * @desc    Obtiene los puntos de un way por su ID
 * @access  Public
 */
router.get('/:id', wayController.getWayPoints);

/**
 * @route   POST /api/ways/points
 * @desc    Obtiene los puntos de un way mediante un ID enviado en el cuerpo de la petición
 * @access  Public
 */
router.post('/points', async (req, res) => {
  try {
    const { wayId } = req.body;
    
    // Validar que se proporcionó un ID
    if (!wayId) {
      return res.status(400).json({ 
        error: 'Debe proporcionar un wayId en el cuerpo de la petición' 
      });
    }
    
    // Redirigir al controlador existente simulando un parámetro
    req.params = { id: wayId };
    return wayController.getWayPoints(req, res);
    
  } catch (error) {
    console.error('Error en POST /points:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      message: error.message 
    });
  }
});

module.exports = router;