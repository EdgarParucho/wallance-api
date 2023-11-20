const express = require('express');
const response = require('../middleware/responseHandler.js');
const payloadValidator = require('../middleware/payloadValidator');
const recordController = require('../controllers/recordController');
const { createRecordSchema, updateRecordSchema, alterRecordSchema } = require('../thirdParty/joi/recordSchema');
const { onRecordCreated, onRecordsFound, onNoRecordsFound, onRecordUpdated, onRecordDeleted } = require('../utils/responseMessages.js');

const router = express.Router();

router.post('/',
payloadValidator({ schema: createRecordSchema, key: 'body' }),
createRecordHandler,
);

router.get('/', getRecordsHandler);

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
    .then((data) => response.success(res, { data, message: onRecordCreated, statusCode: 201 }))
    .catch((error) => next(error))
}

function getRecordsHandler(req, res, next) {
  const payload = { ...req.query, userID: req.user.sub };
  recordController.getRecords(payload)
    .then((data) => response.success(res, { data, message: (data.length > 0) ? onRecordsFound : onNoRecordsFound }))
    .catch((error) => next(error))
}

function patchRecordHandler(req, res, next) {
  const payload = { id: req.params.id, updateEntries: req.body, userID: req.user.sub };
  recordController.patchRecord(payload)
    .then((data) => response.success(res, { data, message: onRecordUpdated }))
    .catch((error) => next(error))
}

function deleteRecordHandler(req, res, next) {
  const payload = { id: req.params.id, userID: req.user.sub };
  recordController.deleteRecord(payload)
    .then((data) => response.success(res, { data, message: onRecordDeleted }))
    .catch((error) => next(error))
}

module.exports = router;
