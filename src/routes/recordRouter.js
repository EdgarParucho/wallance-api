const express = require('express');
const RecordService = require('../services/recordService');
const validatorHandler = require('../middlewares/validatorHandler');
const {
  createRecordSchema,
  updateRecordSchema,
  getRecordsSchema,
  alterRecordSchema,
  createAssignmentSchema,
  updateAssignmentSchema
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
  }
);

router.post('/assignment',
  validatorHandler(createAssignmentSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      const data = await service.assign(body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/assignment/:id',
  validatorHandler(updateAssignmentSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { body } = req;
      const data = await service.updateAssignment(id, body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:userID/:id',
  validatorHandler(alterRecordSchema, 'params'),
  validatorHandler(updateRecordSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const data = await service.update({ id, body });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(alterRecordSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await service.delete({ id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/assignment/:id',
  validatorHandler(alterRecordSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await service.deleteAssignment({ id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { recordRouter: router };
