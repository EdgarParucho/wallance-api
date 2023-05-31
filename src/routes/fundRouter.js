const express = require('express');
const FundService = require('../services/fundService');
const validatorHandler = require('../middlewares/validatorHandler');
const {
  createFundSchema,
  updateFundSchema,
  fundIDSchema,
  deleteFundSchema
} = require('../schemas/fundSchema');

const router = express.Router();
const service = new FundService();

router.post('/',
validatorHandler(createFundSchema, 'body'),
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
validatorHandler(fundIDSchema, 'params'),
validatorHandler(updateFundSchema, 'body'),
async (req, res, next) => {
  try {
    const { userID, _id } = req.params;
    const { body } = req;
    const data = await service.update(userID, _id, body);
    res.json(data);
  } catch (error) {
    next(error);
  }
})

router.delete('/:userID/:_id',
validatorHandler(fundIDSchema, 'params'),
validatorHandler(deleteFundSchema, 'body'),
async (req, res, next) => {
  try {
    const { userID, _id } = req.params;
    const { defaultFundID } = req.body;
    const data = await service.delete({ userID, fundID: _id, defaultFundID });
    res.json(data);
  } catch (error) {
    next(error)
  }
})

module.exports = { fundRouter: router, funds: service.funds, fundService: service };
