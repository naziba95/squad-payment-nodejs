const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const v1Routes = require('./routes/index');

// Import middleware
const requestLogger = require('./middleware/logger.middleware');
const apiLimiter = require('./middleware/rate-limit.middleware');
const { userValidationRules, validate } = require('./middleware/rate-limit.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler.middleware');
const logger = require('./utils/logger');
const cors = require('cors');

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '5mb' }));

app.use(cors());
app.use(requestLogger);
app.use(apiLimiter);

// sanitize request data
app.use(xss());

// enable CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type');
  next();
});

// mount API routes
app.use(`/v1/`, v1Routes);



app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;