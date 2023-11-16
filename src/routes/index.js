const express = require('express');
const passport = require('passport');
const fundRouter = require('./fundRouter');
const userRouter = require('./userRouter');
const recordRouter = require('./recordRouter');
const authRouter = require('./authRouter');

function routerAPI(app) {
  const router = express.Router();
  app.use('/api', router);
  router.use('/auth', authRouter);
  router.use('/user', userRouter);
  router.use('/funds', passport.authenticate('jwt', { session: false }), fundRouter);
  router.use('/records', passport.authenticate('jwt', { session: false }), recordRouter);
}

module.exports = routerAPI;
