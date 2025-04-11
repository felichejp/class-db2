/**
 * Convierte una geometría LINESTRING de PostGIS a un array de coordenadas [lon, lat]
 * 
 * @param {string} wayText - Texto con formato LINESTRING de PostGIS
 * @returns {Array<Array<number>>} - Array de puntos en formato [[lon, lat], [lon, lat], ...]
 */
const lineStringToPointsArray = (wayText) => {
    // Extraer solo las coordenadas dentro de los paréntesis
    const match = wayText.match(/LINESTRING\(([^)]+)\)/);
    if (!match || !match[1]) {
      throw new Error('Formato de LINESTRING inválido');
    }
    
    // Dividir las coordenadas por comas
    const coordPairs = match[1].split(',');
    
    // Convertir cada par de coordenadas en un array de números [lon, lat]
    return coordPairs.map(pair => {
      const [lon, lat] = pair.trim().split(' ');
      return [parseFloat(lon), parseFloat(lat)];
    });
  };
  
  /**
   * Convierte GeoJSON a un array de coordenadas [lon, lat]
   * 
   * @param {string} geojson - Cadena de texto GeoJSON
   * @returns {Array<Array<number>>} - Array de puntos en formato [[lon, lat], [lon, lat], ...]
   */
  const geojsonToPointsArray = (geojson) => {
    try {
      const geojsonObj = JSON.parse(geojson);
      
      // Si es un LineString, debería tener coordenadas como array
      if (geojsonObj.type === 'LineString') {
        return geojsonObj.coordinates;
      }
      
      // Si es un MultiLineString, extraer el primer segmento
      if (geojsonObj.type === 'MultiLineString' && geojsonObj.coordinates.length > 0) {
        return geojsonObj.coordinates[0];
      }
      
      // Si llegamos aquí, el formato no es compatible
      throw new Error('Formato GeoJSON no compatible. Se espera LineString o MultiLineString');
    } catch (error) {
      throw new Error(`Error al procesar GeoJSON: ${error.message}`);
    }
  };
  
  module.exports = {
    lineStringToPointsArray,
    geojsonToPointsArray
  };