const express = require('express');
const dotenv = require('dotenv');
const pg = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
const port = 9000;
app.use(express.json());
app.use(cors());

const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
})

// Ruta de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip;

    try {
        // Buscar el usuario
        const userResult = await pool.query(
            'SELECT u.id_serial, u.username, p.password, p.fail FROM users u JOIN Password p ON u.id_serial = p.idUser WHERE u.username = $1',
            [username]
        );

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            
            // Verificar si la contraseña coincide
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                // Registrar acceso exitoso
                await pool.query(
                    'INSERT INTO Access (idUser, typeAcces, ip) VALUES ($1, $2, $3)',
                    [user.id_serial, 1, clientIp]
                );
                
                // Resetear contador de fallos
                await pool.query(
                    'UPDATE Password SET fail = 0 WHERE idUser = $1',
                    [user.id_serial]
                );

                return res.json({ success: true, message: 'Login exitoso' });
            } else {
                // Incrementar contador de fallos
                await pool.query(
                    'UPDATE Password SET fail = fail + 1 WHERE idUser = $1',
                    [user.id_serial]
                );

                // Registrar acceso fallido
                await pool.query(
                    'INSERT INTO Access (idUser, typeAcces, ip) VALUES ($1, $2, $3)',
                    [user.id_serial, 0, clientIp]
                );

                return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
            }
        } else {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta de registro
app.post('/register', async (req, res) => {
    const { username, nombre, apellido, password } = req.body;
    let client;
    
    try {
        // Verificar si el usuario ya existe
        const checkUser = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }

        // Obtener una conexión del pool para la transacción
        client = await pool.connect();

        try {
            await client.query('BEGIN');
            
            // Insertar usuario con nombre y apellido
            const userInsertResult = await client.query(
                'INSERT INTO users (username, lastname, rol) VALUES ($1, $2, $3) RETURNING id_serial',
                [username, apellido, 1] // rol 1 por defecto
            );

            const userId = userInsertResult.rows[0].id_serial;

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar contraseña
            await client.query(
                'INSERT INTO Password (idUser, password) VALUES ($1, $2)',
                [userId, hashedPassword]
            );

            await client.query('COMMIT');
            return res.json({ success: true, message: 'Registro exitoso' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            if (client) {
                client.release();
            }
        }
    } catch (err) {
        console.error('Error en el registro:', err);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Evento para manejar el cierre de la aplicación
process.on('SIGINT', async () => {
    try {
        await pool.end();
        console.log('Pool has ended');
        process.exit(0);
    } catch (err) {
        console.error('Error during disconnection', err.stack);
        process.exit(1);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('Database pool initialized');
});
