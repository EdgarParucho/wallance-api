const express = require('express');
const recordController = require('../controllers/recordController');
const payloadValidator = require('../middleware/payloadValidator');
const {
  createRecordSchema,
  updateRecordSchema,
  alterRecordSchema
} = require('../middleware/payloadSchemas/recordSchema');

const router = express.Router();

router.post('/',
payloadValidator({ schema: createRecordSchema, key: 'body' }),
createRecordHandler,
);

router.get('/',
// TODO: Payload validation
getRecordsHandler,
);

router.patch('/:id',
payloadValidator({ schema: alterRecordSchema, key: 'params' }),
payloadValidator({ schema: updateRecordSchema, key: 'body' }),
patchRecordHandler,
);

router.delete('/:id',
payloadValidator({ schema: alterRecordSchema, key: 'params' }),
deleteRecordHandler
);

function createRecordHandler(req, res, next) {
  const body = { ...req.body, userID: req.user.sub };
  recordController.createRecord(body)
    .then((data) => res.status(201).json(data))
    .catch((error) => next(error))
}

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

function deleteRecordHandler(req, res, next) {
  const payload = { id: req.params.id, userID: req.user.sub };
  recordController.deleteRecord(payload)
    .then((data) => res.json(data))
    .catch((error) => next(error))
}

module.exports = router;
