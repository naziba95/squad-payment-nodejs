const express = require('express');
const transactionRoutes = require('./transaction.routes');
const authenticateRequest = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateRequest);

router.use('/transactions', transactionRoutes);

router.route('/').get((req, res) => {
  return res.status(200).send({
    success: true,
    message: "Payment Service API is running",
    data: {},
  });
});

module.exports = router;