const RecordService = require('../services/recordService');
const recordService = new RecordService();

async function createRecord(payload) {
  const data = await recordService.create(payload);
  return data;
}

async function getRecords(payload) {
  const data = await recordService.find(payload);
  return data;
}

async function patchRecord(payload) {
  const data = await recordService.update(payload);
  return data;
}

async function deleteRecord(payload) {
  const data = await recordService.delete(payload);
  return data;
}

module.exports = { createRecord, getRecords, patchRecord, deleteRecord };
