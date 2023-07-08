const express = require('express');
const passport = require('passport');
const fundRouter = require('./fundRouter');
const recordRouter = require('./recordRouter');
const accountRouter = require('./accountRouter');
const { credentialsRouter } = require('./credentialsRouter');

function routerAPI(app) {
  const router = express.Router();
  app.use('/api', router)
  router.use('/credentials', credentialsRouter)
  router.use('/account', passport.authenticate('jwt', { session: false }), accountRouter)
  router.use('/funds', passport.authenticate('jwt', { session: false }), fundRouter)
  router.use('/records', passport.authenticate('jwt', { session: false }), recordRouter)
}

module.exports = routerAPI;
