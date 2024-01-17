if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routerAPI = require('./src/routes');
const {
  errorLogger,
  connectionErrorHandler,
  ORMErrorHandler,
  errorResponseHandler
} = require('./src/middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routerAPI(app);

app.use(errorLogger);
app.use(connectionErrorHandler);
app.use(ORMErrorHandler);
app.use(errorResponseHandler);

app.listen(port, () => console.log(`Running on port ${port}`));
module.exports = app;