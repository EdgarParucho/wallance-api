const express = require('express');
const fundRouter = require('./fundRouter');
const userRouter = require('./userRouter');
const recordRouter = require('./recordRouter');
const { checkJWT, checkScopes } = require('../middleware/checkAuthorization.js');
const { demoUser } = require('../config/index.js');

function setRouter(app) {
  const router = express.Router();
  app.use('/', router);
  router.use('/api/user', checkJWT, checkScopes, userRouter);
  router.use('/api/funds', checkJWT, checkScopes, fundRouter);
  router.use('/api/records', checkJWT, checkScopes, recordRouter);
  router.use('/api/public', setDemoData);
  router.use('/api/public/user', userRouter);
  router.use('/api/public/funds', fundRouter);
  router.use('/api/public/records', recordRouter);
}

function setDemoData(req, res, next) {
  req.auth = { payload: { sub: demoUser } };
  next();
}

module.exports = setRouter;
