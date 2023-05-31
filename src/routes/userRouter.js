const express = require('express');
const UserService = require('../services/userService.js');
const validatorHandler = require('../middlewares/validatorHandler');
const {
  preValidationSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  alterUserAuthSchema
} = require('../schemas/userSchema');

const router = express.Router();
const service = new UserService();

router.post('/pre-validate',
  validatorHandler(preValidationSchema, 'body'),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const mustBeNew = (req.query.mustBeNew === 'true');
      const feedback = await service.preValidation(email, mustBeNew);
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
//       const mustBeNew = true;
//       const feedback = await service.preValidation(email, mustBeNew);
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

router.patch('/:_id',
  validatorHandler(alterUserAuthSchema, 'params'),
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { _id } = req.params;
      const { body } = req;
      const OTP = Number(req.header('OTP'))
      const data = await service.update({ _id, OTP, body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
)

  router.delete('/:_id',
  validatorHandler(deleteUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { _id } = req.params;
      const OTP = Number(req.header('OTP'));
      const data = await service.delete({ OTP, _id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
)

module.exports = { userRouter: router, users: service.users };
