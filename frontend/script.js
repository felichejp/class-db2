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
        password: password,
        rol: '1'
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
            body: JSON.stringify(datosLogin),
            credentials: 'include' // Asegura que la cookie se incluya
        });
        
        const resultado = await response.json();
        console.log('Resultado de la petición', resultado);
        
        if (response.ok) {
            const mensaje = resultado.user ? 
                `Bienvenido ${resultado.user.nombre} ${resultado.user.apellido} (${resultado.user.username})` :
                'Inicio de sesión exitoso';
            
            mostrarMensaje('mensajeLogin', mensaje);
            document.getElementById('loginForm').reset();
            
            if (resultado.token) {
                localStorage.setItem('authToken', resultado.token);
                console.log('Token guardado:', resultado.token);
            }

            // Redirige al usuario a la página protegida
            window.location.href = 'protegida.html';

        } else {
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
    
    console.log('Script cargado correctamente');
    console.log('Backend URL configurado:', BASE_URL);
});


// Función para verificar acceso a la ruta protegida
async function verificarRutaProtegida() {
    try {
        const response = await fetch(`${BASE_URL}/protected`, {
            method: 'GET',
            credentials: 'include'  // Esto es CLAVE para que se envíen las cookies
        });

        const resultado = await response.json();
        console.log('Respuesta de ruta protegida:', resultado);

        if (response.ok) {
            alert(`Acceso autorizado: ${JSON.stringify(resultado.user)}`);
        } else {
            alert(`Acceso denegado: ${resultado.error}`);
        }

    } catch (error) {
        console.error('Error al acceder a ruta protegida:', error);
        alert(' Error al conectar con el servidor');
    }
}
//accion al dar click
async function cerrarSesion() {
    try {
      const response = await fetch('http://localhost:9000/logout', {
        method: 'POST',
        credentials: 'include'
      });
  
      const data = await response.json();
      document.getElementById('resultadoProtegido').innerText = data.message || data.error;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
}

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