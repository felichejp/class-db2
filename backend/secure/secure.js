const crypto = require('crypto');
const { findTokenInDB } = require('../database/database');

function generateToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

async function validateToken(receivedToken) {
  const tokenRecord = await findTokenInDB(receivedToken);

  if (!tokenRecord) {
    return { valid: false, message: 'Token no encontrado' };
  }

  if (tokenRecord.revoked) {
    return { valid: false, message: 'Token revocado' };
  }

  const now = new Date();
  const expiresAt = new Date(tokenRecord.expires);
  if (expiresAt < now) {
    return { valid: false, message: 'Token expirado' };
  }

  return { valid: true, user_id: tokenRecord.iduser };
}

module.exports = { generateToken, validateToken };
