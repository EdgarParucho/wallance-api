const FundService = require('../services/fundService');
const fundService = new FundService();

async function createFund(payload) {
  const data = await fundService.create(payload);
  return data;
}

async function patchFund(payload) {
  const data = await fundService.update(payload);
  return data;
}

async function deleteFund(payload) {
  const data = await fundService.delete(payload);
  return data;
}

module.exports = { createFund, patchFund, deleteFund };
