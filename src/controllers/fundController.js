const FundService = require('../services/fundService');
const fundService = new FundService();

async function get(payload) {
  const data = await fundService.get(payload);
  return data;
}

async function create(payload) {
  const data = await fundService.create(payload);
  return data;
}

async function patch(payload) {
  const data = await fundService.update(payload);
  return data;
}

async function deleteFund(payload) {
  const data = await fundService.delete(payload);
  return data;
}

module.exports = { get, create, patch, delete: deleteFund };
