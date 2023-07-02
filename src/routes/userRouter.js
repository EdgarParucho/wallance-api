const express = require('express');
const UserService = require('../services/userService.js');
const validatorHandler = require('../middlewares/validatorHandler');
const { preValidationSchema, createUserSchema, updateUserSchema, deleteUserSchema } = require('../schemas/userSchema');

const router = express.Router();
const service = new UserService();

router.post('/pre-validate',
  validatorHandler(preValidationSchema, 'body'),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const action = req.query.action;
      const emailIsNew = (req.query.emailIsNew === 'true');
      const feedback = await service.preValidation({ email, emailIsNew, action });
      res.send(feedback);
    } catch (error) {
      next(error);
    }
  }
);

// router.post('/recovery',
//   validatorHandler(preValidationSchema, 'body'),
//   async (req, res, next) => {
//     try {
//       const emailIsNew = true;
//       const feedback = await service.preValidation(email, emailIsNew);
//       res.send(feedback);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

router.post('/',
  validatorHandler(createUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      const feedback = await service.create(body);
      res.status(201).send(feedback);
    } catch (error) {
      next(error);
    }
  }
)

router.patch('/',
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { sub: id } = req.user;
      const { body } = req;
      const OTP = Number(req.header('OTP'))
      const data = await service.update({ id, OTP, body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
)

  router.delete('/',
  validatorHandler(deleteUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { sub: id } = req.user;
      const OTP = Number(req.header('OTP'));
      const data = await service.delete({ OTP, id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
)

module.exports = router;
