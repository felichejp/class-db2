const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE JWT
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_super_secreta_2024_abcd1234';
const JWT_EXPIRES_IN = '24h'; // Token expira en 24 horas

// Base de datos simulada (usar MongoDB, PostgreSQL, etc. en producción)
let usuarios = [];

// ========================================
// FUNCIONES PARA MANEJAR JWT
// ========================================

// Función para generar token JWT
function generarToken(usuario) {
    const payload = {
        id: usuario.id,
        email: usuario.email,
        nickname: usuario.nickname,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        iat: Math.floor(Date.now() / 1000), // Issued at
    };
    
    const options = {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'mi-sistema-usuarios',
        audience: 'usuarios-app'
    };
    
    return jwt.sign(payload, JWT_SECRET, options);
}

// Función para verificar y decodificar token
function verificarToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'mi-sistema-usuarios',
            audience: 'usuarios-app'
        });
        return decoded;
    } catch (error) {
        console.log('Error verificando token:', error.message);
        return null;
    }
}

// Función para extraer token del header Authorization
function extraerToken(authHeader) {
    if (!authHeader) return null;
    
    // Formato esperado: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    return authHeader; // Por si viene sin "Bearer "
}

// ========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ========================================
function autenticacionRequerida(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = extraerToken(authHeader);
    
    if (!token) {
        return res.status(401).json({
            error: 'Token de acceso requerido',
            code: 'TOKEN_MISSING'
        });
    }
    
    const decoded = verificarToken(token);
    
    if (!decoded) {
        return res.status(401).json({
            error: 'Token inválido o expirado',
            code: 'TOKEN_INVALID'
        });
    }
    
    // Agregar información del usuario al request
    req.usuario = decoded;
    next();
}

// ========================================
// RUTAS DE AUTENTICACIÓN
// ========================================

// REGISTRO DE USUARIOS
app.post('/register', async (req, res) => {
    try {
        const { nickname, nombre, apellido, email, password } = req.body;
        
        console.log('Intento de registro:', { nickname, nombre, apellido, email });
        
        // Validaciones
        if (!nickname || !nombre || !apellido || !email || !password) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Verificar duplicados
        const emailExiste = usuarios.find(u => u.email === email);
        if (emailExiste) {
            return res.status(409).json({
                error: 'El email ya está registrado'
            });
        }
        
        const nicknameExiste = usuarios.find(u => u.nickname === nickname);
        if (nicknameExiste) {
            return res.status(409).json({
                error: 'El nickname ya está registrado'
            });
        }
        
        // Encriptar contraseña
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Crear usuario
        const nuevoUsuario = {
            id: Date.now().toString(), // En producción usar UUID
            nickname: nickname.trim(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.toLowerCase().trim(),
            password: passwordHash,
            fechaCreacion: new Date().toISOString(),
            activo: true
        };
        
        usuarios.push(nuevoUsuario);
        
        // GENERAR TOKEN JWT
        const token = generarToken(nuevoUsuario);
        
        // Respuesta (sin contraseña)
        const { password: _, ...usuarioSeguro } = nuevoUsuario;
        
        console.log('Usuario registrado exitosamente:', usuarioSeguro.email);
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: usuarioSeguro,
            token: token,
            expiresIn: JWT_EXPIRES_IN
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// LOGIN DE USUARIOS
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Intento de login:', email);
        
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son obligatorios'
            });
        }
        
        // Buscar usuario
        const usuario = usuarios.find(u => u.email === email.toLowerCase().trim());
        
        if (!usuario) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }
        
        if (!usuario.activo) {
            return res.status(401).json({
                error: 'Cuenta desactivada'
            });
        }
        
        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);
        
        if (!passwordValida) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }
        
        // GENERAR NUEVO TOKEN JWT
        const token = generarToken(usuario);
        
        // Respuesta exitosa (sin contraseña)
        const { password: _, ...usuarioSeguro } = usuario;
        
        console.log('Login exitoso:', usuario.email);
        
        res.status(200).json({
            message: 'Login exitoso',
            user: usuarioSeguro,
            token: token,
            expiresIn: JWT_EXPIRES_IN
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// ========================================
// RUTAS PROTEGIDAS (EJEMPLOS)
// ========================================

// Ruta para obtener perfil del usuario (requiere token)
app.get('/profile', autenticacionRequerida, (req, res) => {
    // req.usuario contiene la información del token decodificado
    res.json({
        message: 'Perfil obtenido exitosamente',
        user: req.usuario
    });
});

// Ruta para actualizar perfil (requiere token)
app.put('/profile', autenticacionRequerida, (req, res) => {
    const { nombre, apellido } = req.body;
    
    // Buscar y actualizar usuario
    const usuarioIndex = usuarios.findIndex(u => u.id === req.usuario.id);
    
    if (usuarioIndex === -1) {
        return res.status(404).json({
            error: 'Usuario no encontrado'
        });
    }
    
    if (nombre) usuarios[usuarioIndex].nombre = nombre.trim();
    if (apellido) usuarios[usuarioIndex].apellido = apellido.trim();
    
    const { password, ...usuarioActualizado } = usuarios[usuarioIndex];
    
    res.json({
        message: 'Perfil actualizado exitosamente',
        user: usuarioActualizado
    });
});

// Ruta para verificar si el token es válido
app.post('/verify-token', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({
            error: 'Token requerido',
            valid: false
        });
    }
    
    const decoded = verificarToken(token);
    
    if (decoded) {
        res.json({
            message: 'Token válido',
            valid: true,
            user: decoded,
            expiresAt: new Date(decoded.exp * 1000)
        });
    } else {
        res.status(401).json({
            error: 'Token inválido o expirado',
            valid: false
        });
    }
});

// Ruta para refrescar token (generar nuevo token)
app.post('/refresh-token', autenticacionRequerida, (req, res) => {
    const usuario = usuarios.find(u => u.id === req.usuario.id);
    
    if (!usuario || !usuario.activo) {
        return res.status(401).json({
            error: 'Usuario no válido'
        });
    }
    
    const nuevoToken = generarToken(usuario);
    
    res.json({
        message: 'Token renovado exitosamente',
        token: nuevoToken,
        expiresIn: JWT_EXPIRES_IN
    });
});

// ========================================
// RUTAS DE INFORMACIÓN
// ========================================

// Ruta de salud del servidor
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        users: usuarios.length
    });
});

// Listar usuarios (solo para desarrollo)
app.get('/users', (req, res) => {
    const usuariosSegurosencode = usuarios.map(({ password, ...usuario }) => usuario);
    res.json({
        users: usuariosSegurosencode,
        total: usuarios.length
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔐 JWT Secret configurado: ${JWT_SECRET.substring(0, 10)}...`);
    console.log(`⏰ Tokens expiran en: ${JWT_EXPIRES_IN}`);
    console.log(`\n📋 Rutas disponibles:`);
    console.log(`   POST /register - Registrar usuario`);
    console.log(`   POST /login - Iniciar sesión`);
    console.log(`   GET  /profile - Obtener perfil (requiere token)`);
    console.log(`   PUT  /profile - Actualizar perfil (requiere token)`);
    console.log(`   POST /verify-token - Verificar token`);
    console.log(`   POST /refresh-token - Renovar token (requiere token)`);
    console.log(`   GET  /health - Estado del servidor`);
    console.log(`   GET  /users - Listar usuarios (desarrollo)`);
});

// ========================================
// MANEJO DE ERRORES NO CAPTURADOS
// ========================================
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
    process.exit(1);
});