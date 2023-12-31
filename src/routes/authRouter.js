const express = require('express');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.post('/login', loginHandler);

function loginHandler(req, res, next) {
  const [provider, id] = req.auth.payload.sub.split("|");
  authController.login(id)
    .then((data) => res.status(200).json({
      data,
      message: "It's great that you're here.",
    }))
    .catch((error) => next(error));
}

module.exports = router;
