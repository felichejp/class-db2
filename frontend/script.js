// URL base del backend
const BASE_URL = 'http://localhost:9000';

// Función para mostrar mensajes
function mostrarMensaje(elementoId, mensaje, esError = false) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.style.display = 'block'; // <-- Asegura que se muestre
        elemento.innerHTML = esError ? 
            '<p style="color: red;"><strong>Error:</strong> ' + mensaje + '</p>' : 
            '<p style="color: green;"><strong>Éxito:</strong> ' + mensaje + '</p>';
    }
}

// Función para limpiar mensajes
function limpiarMensajes() {
    const mensaje = document.getElementById('mensaje');
    const mensajeLogin = document.getElementById('mensajeLogin');
    if (mensaje) {
        mensaje.innerHTML = '';
        mensaje.style.display = 'none';
    }
    if (mensajeLogin) {
        mensajeLogin.innerHTML = '';
        mensajeLogin.style.display = 'none';
    }
}

// Función para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para mostrar loading
function mostrarLoading(elementoId, mostrar = true) {
    const elemento = document.getElementById(elementoId);
    if (elemento && mostrar) {
        elemento.innerHTML = '<p>Procesando...</p>';
    }
}

// Función para registrar usuario
async function registrarUsuario(event) {
    event.preventDefault();
    limpiarMensajes();
    
    // Obtener valores del formulario
    const username = document.getElementById('username').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const repetirPassword = document.getElementById('repetirPassword').value;
    
    // Validaciones del lado del cliente
    if (!username || !nombre || !apellido || !email || !password || !repetirPassword) {
        mostrarMensaje('mensaje', 'Todos los campos son obligatorios', true);
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarMensaje('mensaje', 'El formato del email no es válido', true);
        return;
    }
    
    if (password !== repetirPassword) {
        mostrarMensaje('mensaje', 'Las contraseñas no coinciden', true);
        return;
    }
    
    if (password.length < 6) {
        mostrarMensaje('mensaje', 'La contraseña debe tener al menos 6 caracteres', true);
        return;
    }
    
    // Mostrar loading
    mostrarLoading('mensaje');
    
    // Preparar datos para enviar al backend
    const datosUsuario = {
        username: username,
        name: nombre,
        lastname: apellido,
        email: email,
        password: password,
        rol: 1
    };
    
    try {
        // Realizar llamada POST al backend
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosUsuario)
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            // Registro exitoso
            mostrarMensaje('mensaje', resultado.message || 'Usuario registrado exitosamente. Ya puedes iniciar sesión.');
            document.getElementById('registroForm').reset();
        } else {
            // Error del servidor
            mostrarMensaje('mensaje', resultado.error || 'Error en el registro. Intenta nuevamente.', true);
        }
        
    } catch (error) {
        console.error('Error en la petición:', error);
        mostrarMensaje('mensaje', 'Error de conexión con el servidor. Verifica que el backend esté funcionando.', true);
    }
}

// Función para iniciar sesión
async function iniciarSesion(event) {
    event.preventDefault();
    limpiarMensajes();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        mostrarMensaje('mensajeLogin', 'Email y contraseña son obligatorios', true);
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarMensaje('mensajeLogin', 'El formato del email no es válido', true);
        return;
    }
    
    // Mostrar loading
    mostrarLoading('mensajeLogin');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Preparar datos para enviar al backend
    const datosLogin = {
        email: email,
        password: password
    };
    
    try {
        console.log('Iniciando sesión', datosLogin);
        // Realizar llamada POST al backend
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosLogin)
        });
        
        const resultado = await response.json();
        console.log('Resultado de la petición', resultado);
        
        if (response.ok) {
            // Login exitoso
            const mensaje = resultado.user ? 
                `Bienvenido ${resultado.user.nombre} ${resultado.user.apellido} (${resultado.user.username})` :
                'Inicio de sesión exitoso';
            
            mostrarMensaje('mensajeLogin', mensaje);
            document.getElementById('loginForm').reset();
            
            // Guarda el token y los datos del usuario
            if (resultado.token) {
                localStorage.setItem('authToken', resultado.token);
                localStorage.setItem('userData', JSON.stringify(resultado.user));
                console.log('Token guardado:', resultado.token);
                // Redirigir a la página privada
                window.location.href = 'private.html';
            }
            
        } else {
            // Error de autenticación
            mostrarMensaje('mensajeLogin', resultado.error || 'Email o contraseña incorrectos', true);
        }
        
    } catch (error) {
        console.error('Error en la petición:', error);
        mostrarMensaje('mensajeLogin', 'Error de conexión con el servidor. Verifica que el backend esté funcionando.', true);
    }
}

// Función para limpiar formulario de registro
function limpiarFormulario() {
    document.getElementById('registroForm').reset();
    limpiarMensajes();
}

// Función para limpiar formulario de login
function limpiarLogin() {
    document.getElementById('loginForm').reset();
    limpiarMensajes();
}

// Event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Para la página de registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', registrarUsuario);
    }
    
    // Para la página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', iniciarSesion);
    }

    // Para la página privada
    const contenidoPrivado = document.getElementById('contenidoPrivado');
    if (contenidoPrivado) {
        verificarSesion();
        mostrarDatosUsuario();
    }
    
    console.log('Script cargado correctamente');
    console.log('Backend URL configurado:', BASE_URL);
});

function mostrarDatosUsuario() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        const nameSpan = document.getElementById('userNameSpan');
        const emailSpan = document.getElementById('userEmailSpan');
        const idSpan = document.getElementById('userIdSpan');
        const tokenSpan = document.getElementById('userTokenSpan');
        if (nameSpan) nameSpan.textContent = user.nombre + ' ' + (user.apellido || '');
        if (emailSpan) emailSpan.textContent = user.email;
        if (idSpan) idSpan.textContent = user.username || user.id || '';
        if (tokenSpan) tokenSpan.textContent = localStorage.getItem('authToken');
    }
}

// Función para verificar si hay sesión activa
function verificarSesion() {
    const token = readToken();
    if (!token) {
        window.location.href = 'login.html';
    } else {
        const contenido = document.getElementById('contenidoPrivado');
        if (contenido) {
            contenido.style.display = 'block';
        }
    }
}

function readToken(){
    const token = localStorage.getItem('authToken');
    if (token) {
        console.log('Token encontrado:', token);
    } else {
        console.log('No se encontró token');
    }
    return token;
}

function revoke() {
    const token = localStorage.getItem('authToken');
    if (token) {
        fetch(`${BASE_URL}/revoke-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        })
        .then(response => response.json())
        .then(data => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            console.log('Token revocado y eliminado del almacenamiento local');
            window.location.href = 'login.html';
        })
        .catch(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        });
    } else {
        window.location.href = 'login.html';
    }
}
window.revoke = revoke; // Exponer la función revoke para uso en el HTML
/*
NOTAS PARA EL BACKEND:

1. RUTA DE REGISTRO (POST /register):
   - Debe recibir: { username, nombre, apellido, email, password }
   - Debe validar: email único, username único, datos requeridos
   - Respuesta exitosa: { message: "Usuario registrado exitosamente" }
   - Respuesta de error: { error: "Mensaje de error específico" }

2. RUTA DE LOGIN (POST /login):
   - Debe recibir: { email, password }
   - Debe validar: credenciales contra base de datos
   - Respuesta exitosa: { 
       message: "Login exitoso", 
       user: { username, nombre, apellido, email },
       token: "jwt_token_aqui" (opcional)
     }
   - Respuesta de error: { error: "Email o contraseña incorrectos" }

3. CÓDIGOS DE RESPUESTA HTTP:
   - 200: Éxito
   - 400: Error de validación
   - 401: No autorizado (login fallido)
   - 409: Conflicto (email/username ya existe)
   - 500: Error del servidor

4. CORS:
   - Configurar CORS para permitir peticiones desde el frontend
   - Permitir headers: Content-Type, Authorization
   - Permitir métodos: POST, GET, OPTIONS
*/