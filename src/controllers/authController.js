const AuthService = require('../services/authService');
const authService = new AuthService();

async function sendOTP(payload, options) {
  const data = await authService.sendOTP(payload, options);
  return data;
}

async function validateOTP(payload) {
  const data = await authService.validateOTP(payload);
  return data;
}

module.exports = { sendOTP, validateOTP };
