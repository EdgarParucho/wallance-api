const Joi = require('joi');

const _id = Joi.string().uuid();
const amount = Joi.number().min(0.1);
const date = Joi.date();
const note = Joi.string();
const sourceID = _id;
const targetID = _id;
const type = Joi.number();
const userID = _id;

const createRecordSchema = Joi.object({
  amount: amount.required(),
  date: date.required(),
  note: note.required(),
  sourceID: sourceID.required(),
  targetID: targetID.required(),
  type: type.required(),
  userID: userID.required()
});

const getRecordsSchema = Joi.object({
  userFunds: Joi.array().min(1).required()
});

const updateRecordSchema = Joi.object({
  amount,
  date,
  note,
  sourceID,
  targetID,
  type
});

const alterRecordSchema = Joi.object({
  _id: _id.required(),
  userID: userID.required()
});

module.exports = { createRecordSchema, getRecordsSchema, updateRecordSchema, alterRecordSchema };
