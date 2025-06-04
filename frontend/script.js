// URL base del backend
const BASE_URL = 'http://localhost:9000';

// Función para mostrar mensajes
function mostrarMensaje(elementoId, mensaje, esError = false) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.innerHTML = esError ? 
            '<p style="color: red;"><strong>Error:</strong> ' + mensaje + '</p>' : 
            '<p style="color: green;"><strong>Éxito:</strong> ' + mensaje + '</p>';
    }
}

// Función para limpiar mensajes
function limpiarMensajes() {
    const mensaje = document.getElementById('mensaje');
    const mensajeLogin = document.getElementById('mensajeLogin');
    if (mensaje) mensaje.innerHTML = '';
    if (mensajeLogin) mensajeLogin.innerHTML = '';
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
    password: password
};

    
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosUsuario)
        });
        
        const resultado = await response.text();
        
        if (response.ok) {
            mostrarMensaje('mensaje', resultado || 'Usuario registrado exitosamente. Ya puedes iniciar sesión.');
            document.getElementById('registroForm').reset();
        } else {
            mostrarMensaje('mensaje', resultado || 'Error en el registro. Intenta nuevamente.', true);
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
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosLogin)
        });
        
        const resultado = await response.text();
        console.log('Resultado de la petición', resultado);
        
        if (response.ok) {
            mostrarMensaje('mensajeLogin', resultado || 'Inicio de sesión exitoso');
            document.getElementById('loginForm').reset();
        } else {
            mostrarMensaje('mensajeLogin', resultado || 'Email o contraseña incorrectos', true);
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
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', registrarUsuario);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', iniciarSesion);
    }
    
    console.log('Script cargado correctamente');
    console.log('Backend URL configurado:', BASE_URL);
});
