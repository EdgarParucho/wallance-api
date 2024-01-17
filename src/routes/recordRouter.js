const express = require('express');
const payloadValidator = require('../middleware/payloadValidator');
const recordController = require('../controllers/recordController');
const { createRecordSchema, updateRecordSchema, alterRecordSchema } = require('../thirdParty/joi/recordSchema');

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
  const [provider, userID] = req.auth.payload.sub.split("|");
  const payload = { ...req.body, userID };
  recordController.createRecord(payload)
    .then((data) => res.status(201).json({
      data,
      message: "Record saved.",
    }))
    .catch((error) => next(error))
}

function getRecordsHandler(req, res, next) {
  const [provider, userID] = req.auth.payload.sub.split("|");
  const payload = { ...req.query, userID };
  recordController.getRecords(payload)
    .then((data) => res.status(200).json({
      data,
      message: data.length > 0 ? "Your records were loaded." : "No record matches your query.",
    }))
    .catch((error) => next(error))
}

function patchRecordHandler(req, res, next) {
  const [provider, userID] = req.auth.payload.sub.split("|");
  const payload = { id: req.params.id, updateEntries: req.body, userID };
  recordController.patchRecord(payload)
    .then((data) => res.status(200).json({
      data,
      message: "Record updated.",
    }))
    .catch((error) => next(error))
}

function deleteRecordHandler(req, res, next) {
  const [provider, userID] = req.auth.payload.sub.split("|");
  const payload = { id: req.params.id, userID };
  recordController.deleteRecord(payload)
    .then((data) => res.status(200).json({
      data,
      message: "Record deleted",
    }))
    .catch((error) => next(error))
}

module.exports = router;
