const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

function signAccessToken(userId) {
  return jwt.sign({ sub: userId, type: 'access' }, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: 'refresh' }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, jwtConfig.refreshSecret);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateSecureToken,
};
