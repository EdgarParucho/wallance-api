const UserService = require('../services/userService');
const userService = new UserService();

async function update(payload) {
  const data = await userService.update(payload);
  return data;
}

async function deleteUser(payload) {
  const data = await userService.delete(payload);
  return data;
}

module.exports = { update, delete: deleteUser };
