const express = require('express'); // Importa Express
const app = express(); // Crea una instancia de la app

app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});

const PORT = 3000; // Configura el puerto
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});