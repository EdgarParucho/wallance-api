const express = require('express');
const RecordService = require('../services/recordService');
const validatorHandler = require('../middlewares/validatorHandler');
const {
  createRecordSchema,
  updateRecordSchema,
  getRecordsSchema,
  alterRecordSchema
} = require('../schemas/recordSchema');

const router = express.Router();
const service = new RecordService();

router.get('/:userFunds',
  (req, res, next) => {
    req.params = { userFunds: req.params.userFunds.split(',') };
    next();
  },
  validatorHandler(getRecordsSchema, 'params'),
  async (req, res, next) => {
    try {
      const userID = req.user.sub;
      const data = await service.find(userID);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
)

router.post('/',
  validatorHandler(createRecordSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      const data = await service.create(body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  })

router.patch('/:userID/:_id',
  validatorHandler(alterRecordSchema, 'params'),
  validatorHandler(updateRecordSchema, 'body'),
  async (req, res, next) => {
    try {
      const { userID, _id } = req.params;
      const { body } = req;
      const data = await service.update({ userID, _id, body });
      res.json(data);
    } catch (error) {
      next(error);
    }
  })

router.delete('/:userID/:_id',
  validatorHandler(alterRecordSchema, 'params'),
  async (req, res, next) => {
    try {
      const { userID, _id } = req.params;
      const data = await service.delete({ userID, _id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
)

module.exports = { recordRouter: router, records: service.records };
