if (process.env.NODE_ENV == 'development') require('dotenv').config()

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routerAPI = require('./src/routes');
const config = require('./src/config')
const db = require('./src/dataAccess/sequelize');
const { logError, errorHandler, boomErrorHandler, ORMErrorHandler } = require('./src/middleware/errorHandler')

db.authenticate()

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./src/thirdParty/passport');
routerAPI(app);

if (config.env === 'dev') app.use(logError);
app.use(boomErrorHandler);
app.use(ORMErrorHandler);
app.use(errorHandler);

app.listen(port, () => console.log(`Running on port ${port}`));
