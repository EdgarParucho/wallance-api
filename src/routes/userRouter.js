const express = require('express');
const payloadValidator = require('../middleware/payloadValidator.js');
const userController = require('../controllers/userController.js');
const { updateUserSchema } = require('../thirdParty/joi/userSchema.js');

const router = express.Router();

router.patch('/',
  payloadValidator({ schema: updateUserSchema, key: 'body' }),
  patchUserHandler,
);

router.delete('/',
  deleteUserHandler,
);

function patchUserHandler(req, res, next) {
  const [provider, userID] = req.auth.payload.sub.split("|");
  const payload = { updateEntries: req.body, id: userID };
  userController.patchUser(payload)
    .then((data) => res.status(200).json({
      data,
      message: "Your data has been updated.",
    }))
    .catch((error) => next(error))
}

function deleteUserHandler(req, res, next) {
  const [provider, userID] = req.auth.payload.sub.split("|");
  userController.deleteUser(userID)
    .then((data) => res.status(200).json({
      data,
      message: "Your account and data has been deleted.",
    }))
    .catch((error) => next(error))
}

module.exports = router;
