const crypto = require('crypto');

// Función para generar un token seguro
function generateToken() {
  const token = crypto.randomBytes(32).toString('hex'); // 64 caracteres hexadecimales
  return token;
}

// Función para validar el token
async function validateToken(receivedToken) {
    const tokenRecord = await findTokenInDB(receivedToken);
    
    if (!tokenRecord) {
      return { valid: false, message: 'Token no encontrado' };
    }
    
    if (tokenRecord.revoked) {
      return { valid: false, message: 'Token revocado' };
    }
    
    // Verificar expiración si tienes 'expires_at'
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    if (expiresAt < now) {
      return { valid: false, message: 'Token expirado' };
    }
    
    return { valid: true, user_id: tokenRecord.user_id };
}

// Ejemplo de uso
const token = generateToken();
console.log('Token generado:', token);

// Exportar la función para uso en otros archivos
module.exports = { generateToken };

