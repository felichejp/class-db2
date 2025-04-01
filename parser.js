const wkx = require('wkx'); // Se importa el convertidor de datos geometry
const buffer = require('buffer').Buffer;    

// Array de nuevos datos ya en GEOJSON
json_array =[]; 
// Se convierten a un formato adecuado (coordenadas) los datos en wkt
// El parsing se da desde el cliente -> el programa. La serialización es desde el programa -> cliente
function parser (line)
{

   // Suponiendo que solo queremos convertir un line
   //const geometry = wkx.Geometry.parse(line);
   //console.log(geometry.toGeoJSON); 
   // Convertimos el string hexadecimal a un búfer
    const buffer = Buffer.from(line, 'hex');

    // Parseamos la geometría
    const geometry = wkx.Geometry.parse(buffer);

    // Obtenemos los puntos como coordenadas [[x, y], [x, y], ...]
    const coordinates = geometry.points.map(point => [point.x, point.y]);

    return coordinates;
}

// Exports es una propiedad del archivo actual, al que se igualan las variables o funciones a exportar
module.exports= {parser};

