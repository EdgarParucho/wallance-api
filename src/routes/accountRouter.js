const express = require('express');
const AccountService = require('../services/accountService.js');
const validatorHandler = require('../middlewares/validatorHandler.js');
const { updateUserSchema } = require('../schemas/accountSchema.js');

const router = express.Router();
const service = new AccountService();

router.patch('/',
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body: updateEntries } = req;
      const { sub: id } = req.user;
      const OTP = req.header('OTP');
      const data = await service.update({ id, OTP, updateEntries });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/',
  async (req, res, next) => {
    try {
      const { sub: id } = req.user;
      const OTP = req.header('OTP');
      const data = await service.delete({ OTP, id });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
