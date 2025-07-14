const express = require('express');
const fundController = require('../controllers/fundController');
const payloadValidator = require('../middleware/payloadValidator');
const { create, update, alter } = require('../thirdParty/joi/fundSchema');

const router = express.Router();

router.get('/', getHandler);

router.post('/', payloadValidator({ schema: create, key: 'body' }), createHandler);

router.patch('/:id',
payloadValidator({ schema: alter, key: 'params' }),
payloadValidator({ schema: update, key: 'body' }),
patchHandler
);

router.delete('/:id', payloadValidator({ schema: alter, key: 'params' }), deleteHandler);

function getHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  fundController.get(userID)
    .then((data) => res.status(200).json({
      data,
      message: "It's great that you're here.",
    }))
    .catch((error) => next(error));
}

function createHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  const payload = { ...req.body, userID };
  fundController.create(payload)
    .then((data) => res.status(201).json({
      data,
      message: "Your new fund is ready.",
    }))
    .catch((error) => next(error))
}

function patchHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  const payload = { updateEntries: req.body, id: req.params.id, userID };
  fundController.patch(payload)
    .then((data) => res.status(200).json({
      data,
      message: "The fund was updated.",
    }))
    .catch((error) => next(error))
}

function deleteHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  const payload = { id: req.params.id, userID }
  fundController.delete(payload)
    .then((data) => res.status(200).json({
      data,
      message: "The fund was deleted."
    }))
    .catch((error) => next(error))
}

module.exports = router;
