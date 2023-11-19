const Joi = require('joi');

const id = Joi.string().uuid();
const amount = Joi.number();
const date = Joi.date();
const note = Joi.string().allow("");
const tag = Joi.string().allow("");
const fundID = id;
const otherFundID = id.allow(null, "");
const type = Joi.number();

const createRecordSchema = Joi.object({
  amount: amount.required(),
  date: date.required(),
  note,
  tag,
  fundID: fundID.required(),
  type: type.required(),
  otherFundID
});

const updateRecordSchema = Joi.object({
  amount,
  date,
  note,
  tag,
  fundID,
  otherFundID,
  type,
});

const alterRecordSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  alterRecordSchema,
};
