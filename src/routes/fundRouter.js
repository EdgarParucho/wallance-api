const express = require('express');
const fundController = require('../controllers/fundController');
const response = require('../middleware/responseHandler.js');
const payloadValidator = require('../middleware/payloadValidator');
const { createFundSchema, updateFundSchema, alterFundSchema } = require('../thirdParty/joi/fundSchema');
const { onFundCreated, onFundUpdated, onFundDeleted } = require('../utils/responseMessages.js');

const router = express.Router();

router.post('/',
payloadValidator({ schema: createFundSchema, key: 'body' }),
createFundHandler
);

router.patch('/:id',
  payloadValidator({ schema: alterFundSchema, key: 'params' }),
  payloadValidator({ schema: updateFundSchema, key: 'body' }),
  patchFundHandler,
)

router.delete('/:id',
payloadValidator({ schema: alterFundSchema, key: 'params'}),
deleteFundHandler,
);

function createFundHandler(req, res, next) {
  const payload = { ...req.body, userID: req.user.sub };
  fundController.createFund(payload)
    .then((data) => response.success(res, { data, message: onFundCreated, statusCode: 201 }))
    .catch((error) => next(error))
}

function patchFundHandler(req, res, next) {
  const payload = { updateEntries: req.body, id: req.params.id, userID: req.user.sub };
  fundController.patchFund(payload)
    .then((data) => response.success(res, { data, message: onFundUpdated }))
    .catch((error) => next(error))
}

function deleteFundHandler(req, res, next) {
  const payload = { id: req.params.id, userID: req.user.sub }
  fundController.deleteFund(payload)
    .then((data) => response.success(res, { data, message: onFundDeleted }))
    .catch((error) => next(error))
}

module.exports = router;
