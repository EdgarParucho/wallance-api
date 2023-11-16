const express = require('express');
const recordController = require('../controllers/recordController');
const validatorHandler = require('../middleware/validatorHandler');
const {
  createRecordSchema,
  updateRecordSchema,
  alterRecordSchema
} = require('../middleware/schemaValidation/recordSchema');

const router = express.Router();

router.post('/', validatorHandler(createRecordSchema, 'body'), createRecordHandler);
router.get('/', getRecordsHandler);

router.patch('/:id',
  validatorHandler(alterRecordSchema, 'params'),
  validatorHandler(updateRecordSchema, 'body'),
  patchRecordHandler
);

function createRecordHandler(req, res, next) {
  const body = { ...req.body, userID: req.user.sub };
  recordController.createRecord(body)
    .then((data) => res.status(201).json(data))
    .catch((error) => next(error))
}

// filters must be validated with Joi
function getRecordsHandler(req, res, next) {
  const payload = { ...req.query, userID: req.user.sub };
  recordController.getRecords(payload)
    .then((data) => res.status(200).json(data))
    .catch((error) => next(error))
}

function patchRecordHandler(req, res, next) {
  const payload = { id: req.params.id, updateEntries: req.body, userID: req.user.sub };
  recordController.patchRecord(payload)
    .then((data) => res.json(data))
    .catch((error) => next(error))
}

router.delete('/:id', validatorHandler(alterRecordSchema, 'params'), deleteRecordHandler);
function deleteRecordHandler(req, res, next) {
  const payload = { id: req.params.id, userID: req.user.sub };
  recordController.deleteRecord(payload)
    .then((data) => res.json(data))
    .catch((error) => next(error))
}

module.exports = router;
