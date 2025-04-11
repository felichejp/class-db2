const wayModel = require('../models/wayModel');
const { lineStringToPointsArray, geojsonToPointsArray } = require('../utils/wayFormatter');

/**
 * Controlador para obtener los puntos de un way por su ID
 */
const getWayPoints = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    const wayId = parseInt(id);
    if (isNaN(wayId)) {
      return res.status(400).json({ 
        error: 'El ID del way debe ser un número' 
      });
    }

    // Obtener los datos del way desde el modelo
    const wayData = await wayModel.getWayById(wayId);
    
    // Si no se encuentra el way
    if (!wayData) {
      return res.status(404).json({ 
        error: `No se encontró un way con el ID ${wayId}` 
      });
    }

    // Convertir la geometría del way a un array de puntos
    let points;
    
    // Preferir usar GeoJSON si está disponible
    if (wayData.geojson) {
      points = geojsonToPointsArray(wayData.geojson);
    } else if (wayData.way_text) {
      points = lineStringToPointsArray(wayData.way_text);
    } else {
      return res.status(500).json({ 
        error: 'No se pudo obtener la geometría del way' 
      });
    }

    // Devolver los puntos como respuesta
    res.json({
      wayId: wayData.osm_id,
      points: points
    });
    
  } catch (error) {
    console.error('Error en getWayPoints:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      message: error.message 
    });
  }
};

module.exports = {
  getWayPoints
};