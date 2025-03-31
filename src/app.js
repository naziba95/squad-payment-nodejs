const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const v1Routes = require('./routes/index');

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '5mb' }));

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

module.exports = app;