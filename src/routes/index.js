const express = require('express');
const passport = require('passport');
const { fundRouter } = require('./fundRouter');
const { recordRouter } = require('./recordRouter');
const { userRouter } = require('./userRouter');
const sessionRouter = require('./sessionRouter');

function routerAPI(app) {
  const router = express.Router();
  app.use('/api', router)
  router.use('/funds', passport.authenticate('jwt', { session: false }), fundRouter)
  router.use('/records', passport.authenticate('jwt', { session: false }), recordRouter)
  router.use('/users', userRouter)
  router.use('/session', sessionRouter)
}

module.exports = routerAPI;
