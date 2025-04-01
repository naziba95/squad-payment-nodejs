const express = require('express');
const { body, param, validationResult } = require('express-validator');
const transactionController = require('../controllers/transaction.controller');
const authenticateRequest = require('../middleware/auth.middleware');

const router = express.Router();

// Card Transaction Validation Rules
const cardTransactionValidation = [
  body('value').isNumeric().withMessage('Value must be a number'),
  body('description').isString().withMessage('Description must be a string'),
  body('cardNumber').isLength({ min: 13, max: 19 }).withMessage('Card number must be between 13 and 19 digits'),
  body('cardHolderName').isString().withMessage('Card holder name must be a string'),
  body('expirationDate').matches(/^([0][1-9]|1[0-2])\/([0-9]{2})$/)
  .withMessage('Date must be in MM/YY format'),
  body('cvv').isLength({ min: 3, max: 4 }).withMessage('CVV must be 3 or 4 digits'),
  body('currency').isString().withMessage('Currency must be a string'),
  body('merchantCode').isString().withMessage('Merchant code must be a string')
];

// Virtual Account Transaction Validation Rules
const virtualAccountTransactionValidation = [
  body('value').isNumeric().withMessage('Value must be a number'),
  body('description').isString().withMessage('Description must be a string'),
  body('accountName').isString().withMessage('Account name must be a string'),
  body('accountNumber').isLength({ min: 10, max: 12 }).withMessage('Account number must be between 10 and 12 digits'),
  body('bankCode').isString().withMessage('Bank code must be a string'),
  body('currency').isString().withMessage('Currency must be a string'),
  body('merchantCode').isString().withMessage('Merchant code must be a string')
];

// Validation Middleware to handle the validation result
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Process card transaction
router.post('/card', authenticateRequest, cardTransactionValidation, validate, transactionController.processCardTransaction);

// Process virtual account transaction
router.post('/virtual-account', authenticateRequest, virtualAccountTransactionValidation, validate, transactionController.processVirtualAccountTransaction);

// Process card settlement
router.post('/settlement', authenticateRequest, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('reference').isString().withMessage('Reference must be a string'),
  body('cardNumber').isLength({ min: 13, max: 19 }).withMessage('Card number must be between 13 and 19 digits'),
  body('currency').isString().withMessage('Currency must be a string'),
  body('merchantCode').isString().withMessage('Merchant code must be a string')
], validate, transactionController.processCardSettlement);

// Get all transactions
router.get('/:merchantCode', authenticateRequest, [
  param('merchantCode').isString().withMessage('Merchant code must be a string')
], validate, transactionController.getMerchantTransactions);

// Create payout
router.post('/payout', authenticateRequest, [
  body('merchantCode').isString().withMessage('Merchant code must be a string')
], validate, transactionController.createPayout);

// Get merchant balance
router.get('/balance/:merchantCode', authenticateRequest, [
  param('merchantCode').isString().withMessage('Merchant code must be a string')
], validate, transactionController.getMerchantBalance);

module.exports = router;
