const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routerAPI = require('./src/routes');
const config = require('./src/config')
const { logError, errorHandler, boomErrorHandler, ORMErrorHandler } = require('./src/middlewares/errorHandler')

if (process.env.NODE_ENV == 'development') require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./src/utils/auth');
routerAPI(app);

if (config.env === 'dev') app.use(logError);
app.use(boomErrorHandler);
app.use(ORMErrorHandler);
app.use(errorHandler);

app.listen(port, () => console.log(`Running on port ${port}`));
