const express = require('express');
const fundController = require('../controllers/fundController');
const validatorHandler = require('../middleware/validatorHandler');
const {
  createFundSchema,
  updateFundSchema,
  fundIDSchema,
} = require('../middleware/schemaValidation/fundSchema');

const router = express.Router();

router.post('/', validatorHandler(createFundSchema, 'body'), createFundHandler);
router.patch('/:id',
  validatorHandler(fundIDSchema, 'params'),
  validatorHandler(updateFundSchema, 'body'),
  patchFundHandler,
)
router.delete('/:id', validatorHandler(fundIDSchema, 'params'), deleteFundHandler, );

function createFundHandler(req, res, next) {
  const payload = { ...req.body, userID: req.user.sub };
  fundController.createFund(payload)
    .then((data) => res.status(201).json(data))
    .catch((error) => next(error))
}

function patchFundHandler(req, res, next) {
  const payload = { updateEntries: req.body, id: req.params.id, userID: req.user.sub };
  fundController.patchFund(payload)
    .then((data) => res.json(data))
    .catch((error) => next(error))
}

function deleteFundHandler(req, res, next) {
  const payload = { id: req.params.id, userID: req.user.sub }
  fundController.deleteFund(payload)
    .then((data) => res.json(data))
    .catch((error) => next(error))
}

module.exports = router;
