const express = require('express');
const fundRouter = require('./fundRouter');
const userRouter = require('./userRouter');
const recordRouter = require('./recordRouter');
const { checkJWT, checkScopes } = require('../middleware/checkAuthorization.js');

function routerAPI(app) {
  const router = express.Router();
  app.use('/api', router);
  router.use('/user', checkJWT, checkScopes, userRouter);
  router.use('/funds', checkJWT, checkScopes, fundRouter);
  router.use('/records', checkJWT, checkScopes, recordRouter);
}

module.exports = routerAPI;
