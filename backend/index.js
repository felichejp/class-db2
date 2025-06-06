const express = require('express');
const dotenv = require('dotenv');
const pg = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const port = 9000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:8000', // Frontend URL
    credentials: true // Allow cookies to be sent
}));

const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

// Session configuration
const SESSION_DURATION =  30 * 1000; // 30 seconds in milliseconds

// Utility function to create session
async function createSession(userId, ipAddress, userAgent) {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    
    await pool.query(
        'INSERT INTO sessions (session_id, user_id, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
        [sessionId, userId, expiresAt, ipAddress, userAgent]
    );
    
    return { sessionId, expiresAt };
}

// Utility function to validate session
async function validateSession(sessionId) {
    if (!sessionId) return null;
    
    const result = await pool.query(
        `SELECT s.session_id, s.user_id, s.expires_at, u.username, u.lastname, u.rol 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id_serial 
         WHERE s.session_id = $1 AND s.expires_at > CURRENT_TIMESTAMP AND s.is_active = TRUE`,
        [sessionId]
    );
    
    if (result.rows.length > 0) {
        // Update last activity
        await pool.query(
            'UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = $1',
            [sessionId]
        );
        return result.rows[0];
    }
    
    return null;
}

// Middleware to check authentication
async function requireAuth(req, res, next) {
    try {
        const sessionId = req.cookies.sessionId;
        const session = await validateSession(sessionId);
        
        if (!session) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }
        
        req.user = session;
        next();
    } catch (error) {
        console.error('Error validating session:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
}

// Ruta de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    try {
        // Buscar el usuario
        const userResult = await pool.query(
            'SELECT u.id_serial, u.username, u.lastname, u.rol, p.password, p.fail FROM users u JOIN password p ON u.id_serial = p.iduser WHERE u.username = $1',
            [username]
        );

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            
            // Verificar si la contraseña coincide
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                // Crear sesión
                const { sessionId, expiresAt } = await createSession(user.id_serial, clientIp, userAgent);
                
                // Registrar acceso exitoso
                await pool.query(
                    'INSERT INTO access (iduser, typeacces, ip) VALUES ($1, $2, $3)',
                    [user.id_serial, 1, clientIp]
                );
                
                // Resetear contador de fallos
                await pool.query(
                    'UPDATE password SET fail = 0 WHERE iduser = $1',
                    [user.id_serial]
                );

                // Configurar cookie
                res.cookie('sessionId', sessionId, {
                    httpOnly: true,
                    secure: false, // Set to true in production with HTTPS
                    sameSite: 'lax',
                    expires: expiresAt
                });

                return res.json({ 
                    success: true, 
                    message: 'Login exitoso',
                    user: {
                        id: user.id_serial,
                        username: user.username,
                        lastname: user.lastname,
                        rol: user.rol
                    }
                });
            } else {
                // Incrementar contador de fallos
                await pool.query(
                    'UPDATE password SET fail = fail + 1 WHERE iduser = $1',
                    [user.id_serial]
                );

                // Registrar acceso fallido
                await pool.query(
                    'INSERT INTO access (iduser, typeacces, ip) VALUES ($1, $2, $3)',
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

// Ruta de logout
app.post('/logout', async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        
        if (sessionId) {
            // Invalidar sesión en la base de datos
            await pool.query(
                'UPDATE sessions SET is_active = FALSE WHERE session_id = $1',
                [sessionId]
            );
        }
        
        // Limpiar cookie
        res.clearCookie('sessionId');
        res.json({ success: true, message: 'Logout exitoso' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para verificar autenticación
app.get('/check-auth', async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const session = await validateSession(sessionId);
        
        if (session) {
            res.json({ 
                success: true, 
                authenticated: true,
                user: {
                    id: session.user_id,
                    username: session.username,
                    lastname: session.lastname,
                    rol: session.rol
                }
            });
        } else {
            res.json({ success: true, authenticated: false });
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
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
                'INSERT INTO password (iduser, password) VALUES ($1, $2)',
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

// Ruta protegida de ejemplo (requiere autenticación)
app.get('/dashboard', requireAuth, async (req, res) => {
    try {
        // Obtener información adicional del usuario si es necesario
        const userInfo = await pool.query(
            'SELECT username, lastname, created, rol FROM users WHERE id_serial = $1',
            [req.user.user_id]
        );
        
        // Obtener últimos accesos
        const recentAccess = await pool.query(
            'SELECT typeacces, ip, cheekfeel FROM access WHERE iduser = $1 ORDER BY cheekfeel DESC LIMIT 10',
            [req.user.user_id]
        );
        
        res.json({
            success: true,
            user: userInfo.rows[0],
            recentAccess: recentAccess.rows
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Ruta para limpiar sesiones expiradas (puede ejecutarse periódicamente)
app.post('/cleanup-sessions', async (req, res) => {
    try {
        const result = await pool.query('SELECT cleanup_expired_sessions()');
        const deletedCount = result.rows[0].cleanup_expired_sessions;
        
        res.json({ 
            success: true, 
            message: `${deletedCount} sesiones expiradas eliminadas` 
        });
    } catch (error) {
        console.error('Error cleaning up sessions:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
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
