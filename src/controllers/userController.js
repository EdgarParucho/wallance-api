const UserService = require('../services/userService');
const userService = new UserService();

async function createUser(payload) {
  const data = await userService.create(payload);
  return data;
}

async function patchUser(payload) {
  const data = await userService.update(payload);
  return data;
}

async function deleteUser(payload) {
  const data = await userService.delete(payload);
  return data;
}

async function resetPassword(payload) {
  const data = await userService.resetPassword(payload);
  return data;
}

module.exports = { createUser, patchUser, deleteUser, resetPassword };
