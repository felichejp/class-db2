const express = require('express');
const { connect, query } = require('./database'); // Importar funciones desde database.js
const wkx = require('wkx'); // Importar wkx para procesar geometrías

const app = express(); // Inicializar Express
const PORT = 8083;

app.get('/', async function (req, res) {
    const client = await connect(); // Conectar a la base de datos
    console.log('Solicitud recibida en la ruta /');
    try {
        console.log('Conexión establecida con la base de datos');
        // Consulta para obtener las geometrías
        const result = await query('SELECT osm_id, way FROM planet_osm_line LIMIT 10;', client);
        console.log('Resultados de la consulta:', result);

        // Procesar las geometrías con wkx como en parser.js
        const geoJsonCoordinates = result.map(row => {
            const wkbBuffer = Buffer.from(row.way, 'hex'); // Convertir WKB a Buffer
            const geometry = wkx.Geometry.parse(wkbBuffer); // Parsear la geometría
            return geometry.toGeoJSON().coordinates; // Obtener las coordenadas GeoJSON
        });

        console.log('Coordenadas procesadas:', geoJsonCoordinates);
        res.json(geoJsonCoordinates); // Enviar las coordenadas como JSON
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).send('Error al consultar la base de datos');
    } finally {
        await client.end(); // Cerrar conexión
        console.log('Conexión cerrada');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el http://localhost:${PORT}`);
});