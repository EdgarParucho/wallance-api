const Joi = require('joi');

const id = Joi.string().uuid();
const amount = Joi.number();
const date = Joi.date();
const note = Joi.string();
const tag = Joi.string();
const fundID = id;
const type = Joi.number();
const userID = id;

const createRecordSchema = Joi.object({
  amount: amount.required(),
  date: date.required(),
  note,
  tag,
  fundID: fundID.required(),
  type: type.required(),
  userID: userID.required()
});

const createAssignmentSchema = Joi.object({
  amount: amount.required(),
  date: date.required(),
  note,
  tag,
  sourceID: fundID.required(),
  targetID: fundID.required(),
  type: type.required().equal(0),
  userID: userID.required()
});

const updateAssignmentSchema = Joi.object({
  amount: amount.required(),
  date: date.required(),
  note,
  tag,
  sourceID: fundID.required(),
  targetID: fundID.required(),
  type: type.required().equal(0),
  userID: userID.required()
});

const getRecordsSchema = Joi.object({
  userFunds: Joi.array().min(1).required()
});

const updateRecordSchema = Joi.object({
  amount,
  date,
  note,
  tag,
  fundID,
  type
});

const alterRecordSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createRecordSchema,
  createAssignmentSchema,
  getRecordsSchema,
  updateRecordSchema,
  updateAssignmentSchema,
  alterRecordSchema,
};
