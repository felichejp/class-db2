document.addEventListener('DOMContentLoaded', () => {
    // Para login.html
    const loginForm = document.querySelector('form[action="#"]');
    if (loginForm && window.location.pathname.includes('index.html')) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="text"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const res = await fetch('http:localhost:9000/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            alert(data.message || JSON.stringify(data));
        });
    }

    // Para registro.html
    const registerForm = document.querySelector('form[action="#"]');
    if (registerForm && window.location.pathname.includes('registro.html')) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = registerForm.querySelectorAll('input');
            const nombre = inputs[0].value;
            const apellido = inputs[1].value;
            const email = inputs[2].value;
            const password = inputs[3].value;
            try {
                const res = await fetch('http://localhost:9000/register', { // Cambiar URL al backend
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password, name: nombre, lastname: apellido, rol: 'user' })
                });
                const data = await res.json();
                alert(data.message || JSON.stringify(data));
            } catch (error) {
                console.error('Error en registro:', error);
                alert('Error al registrarse');
            }
        });
    }
});