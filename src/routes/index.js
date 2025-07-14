const express = require('express');
const fundRouter = require('./fundRouter');
const recordRouter = require('./recordRouter');
const userRouter = require('./userRouter');
const { checkJWT, checkScopes, setDemoData } = require('../middleware/checkAuthorization.js');

const router = express.Router();

router.use('/api/fund', checkJWT, checkScopes, fundRouter);
router.use('/api/record', checkJWT, checkScopes, recordRouter);
router.use('/api/user', checkJWT, checkScopes, userRouter);
router.use('/api/public/fund', setDemoData, fundRouter);
router.use('/api/public/record', setDemoData, recordRouter);
router.use('/*', (req, res) => res.sendStatus(404));

module.exports = { router };
