const AuthService = require('../services/authService');
const authService = new AuthService();

async function sendOTP(payload) {
  const data = await authService.sendOTP(payload);
  return data;
}

async function validateOTP(payload) {
  const data = await authService.validateOTP(payload);
  return data;
}

async function login(payload) {
  const data = authService.login(payload);
  return data;
}

module.exports = { sendOTP, validateOTP, login };
