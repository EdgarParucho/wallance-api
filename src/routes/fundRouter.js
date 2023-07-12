const express = require('express');
const FundService = require('../services/fundService');
const validatorHandler = require('../middlewares/validatorHandler');
const { createFundSchema, updateFundSchema, fundIDSchema, deleteFundSchema } = require('../schemas/fundSchema');

const router = express.Router();
const service = new FundService();

router.post('/',
  validatorHandler(createFundSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      const { sub: userID } = req.user;
      const data = await service.create({ ...body, userID });
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
validatorHandler(fundIDSchema, 'params'),
validatorHandler(updateFundSchema, 'body'),
async (req, res, next) => {
  try {
    const userID = req.user.sub;
    const { id } = req.params;
    const { body } = req;
    const data = await service.update(userID, id, body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id',
validatorHandler(fundIDSchema, 'params'),
async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sub: userID } = req.user;
    const data = await service.delete({ userID, id });
    res.json(data);
  } catch (error) {
    next(error)
  }
});

module.exports = router;
