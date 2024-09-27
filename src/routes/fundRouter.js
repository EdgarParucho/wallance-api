const express = require('express');
const fundController = require('../controllers/fundController');
const payloadValidator = require('../middleware/payloadValidator');
const { createFundSchema, updateFundSchema, alterFundSchema } = require('../thirdParty/joi/fundSchema');

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
  const userID = req.auth.payload.sub;
  console.log(userID);
  
  const payload = { ...req.body, userID };
  fundController.createFund(payload)
    .then((data) => res.status(201).json({
      data,
      message: "Your new fund is ready.",
    }))
    .catch((error) => next(error))
}

function patchFundHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  const payload = { updateEntries: req.body, id: req.params.id, userID };
  fundController.patchFund(payload)
    .then((data) => res.status(200).json({
      data,
      message: "The fund was updated.",
    }))
    .catch((error) => next(error))
}

function deleteFundHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  const payload = { id: req.params.id, userID }
  fundController.deleteFund(payload)
    .then((data) => res.status(200).json({
      data,
      message: "The fund was deleted."
    }))
    .catch((error) => next(error))
}

module.exports = router;
