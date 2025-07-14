const express = require('express');
const payloadValidator = require('../middleware/payloadValidator.js');
const userController = require('../controllers/userController');
const { updateUserSchema } = require('../thirdParty/joi/userSchema.js');

const router = express.Router();

router.patch('/', payloadValidator({ schema: updateUserSchema, key: 'body' }), updateUserHandler);
router.delete('/', deleteUserHandler);

function updateUserHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  const { body } = req;
  userController.update({ userID, body })
    .then(() => res.status(204).json({
      data: null,
      message: "Your data has been updated.",
    }))
    .catch((error) => next(error))
}

function deleteUserHandler(req, res, next) {
  const userID = req.auth.payload.sub;
  userController.delete({ userID })
    .then(() => res.status(204).json({
      data: null,
      message: "Your account and data has been deleted.",
    }))
    .catch((error) => next(error))
}

module.exports = router;
