const UserService = require('../services/userService');
const userService = new UserService();

async function getUser(payload) {
  const data = userService.getUser(payload);
  return data;
}

async function updateUser(payload) {
  const data = await userService.update(payload);
  return data;
}

async function deleteUser(payload) {
  const data = await userService.delete(payload);
  return data;
}

module.exports = { getUser, updateUser, deleteUser };
