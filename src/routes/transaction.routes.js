const express = require('express');
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

// Process card transaction
router.post('/card', transactionController.processCardTransaction);

// Process virtual account transaction
router.post('/virtual-account', transactionController.processVirtualAccountTransaction);

// Process card settlement
router.post('/settlement', transactionController.processCardSettlement);

// Get all transactions
router.get('/:merchantCode', transactionController.getMerchantTransactions);

// Create payout
router.post('/payout', transactionController.createPayout);

// Get merchant balance
router.get('/balance/:merchantCode', transactionController.getMerchantBalance);

module.exports = router;