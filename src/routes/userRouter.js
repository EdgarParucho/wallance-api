const express = require('express');
const payloadValidator = require('../middleware/payloadValidator.js');
const userController = require('../controllers/userController.js');
const { updateUserSchema } = require('../thirdParty/joi/userSchema.js');

const router = express.Router();

router.get('/', getUser);
router.patch('/', payloadValidator({ schema: updateUserSchema, key: 'body' }), updateUser);
router.delete('/', deleteUser);

function getUser(req, res, next) {
  const userID = req.auth.payload.sub;
  userController.getUser(userID)
    .then((data) => res.status(200).json({
      data,
      message: "It's great that you're here.",
    }))
    .catch((error) => next(error));
}

function updateUser(req, res, next) {
  const userID = req.auth.payload.sub;
  const { body } = req;
  userController.updateUser({ userID, body })
    .then(() => res.status(204).json({
      data: null,
      message: "Your data has been updated.",
    }))
    .catch((error) => next(error))
}

function deleteUser(req, res, next) {
  const userID = req.auth.payload.sub;
  userController.deleteUser(userID)
    .then(() => res.status(204).json({
      data: null,
      message: "Your account and data has been deleted.",
    }))
    .catch((error) => next(error))
}

module.exports = router;
