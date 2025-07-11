const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { environment, port } = require('./src/config/server');
const { router } = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(errorHandler);

app.listen(port, () => environment === 'production' ? {} : console.log(`Running on port ${port}`));

module.exports = app;