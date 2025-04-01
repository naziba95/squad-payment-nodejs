const transactionService = require('../services/transaction.service');
const logger = require('../utils/logger');

class TransactionController {
  async processCardTransaction(req, res) {
    try {
      const { 
        value, 
        description, 
        cardNumber, 
        cardHolderName, 
        expirationDate, 
        cvv, 
        currency, 
        merchantCode 
      } = req.body;
      
      logger.info(`processCardTransaction request received - ${JSON.stringify(req.body)}`)

      // Validate required fields
      if (!value || !description || !cardNumber || !cardHolderName || !expirationDate || !cvv || !currency || !merchantCode) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }
      
      const transaction = await transactionService.processCardTransaction(req.body);

      logger.info(`processCardTransaction response received - ${JSON.stringify(transaction)}`)

      
      return res.status(201).json({
        success: true,
        message: 'Card transaction processed successfully',
        data: {
          reference: transaction.reference,
          merchantCode: transaction.merchantCode,
          value: transaction.value,
          description: transaction.description,
          cardLastFour: transaction.cardLastFour,
          cardHolderName: transaction.cardHolderName,
          currency: transaction.currency,
          status: transaction.status,
          fee: transaction.fee,
          netAmount: transaction.netAmount,
          createdAt: transaction.createdAt,
        },
      });
    } catch (error) {
      logger.error(error)
      return res.status(500).json({
        success: false,
        message: 'Failed to process card transaction',
        error: error.message,
      });
    }
  }
  
  async processVirtualAccountTransaction(req, res) {
    try {
      const { 
        value, 
        description, 
        accountName, 
        accountNumber, 
        bankCode, 
        currency, 
        merchantCode 
      } = req.body;
      
      logger.info(`processVirtualAccountTransaction - ${JSON.stringify(req.body)}`);

      // Validate required fields
      if (!value || !description || !accountName || !accountNumber || !bankCode || !currency || !merchantCode) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }
      
      const transaction = await transactionService.processVirtualAccountTransaction(req.body);

      logger.info(`processVirtualAccountTransaction response received - ${JSON.stringify(transaction)}`)

      
      return res.status(201).json({
        success: true,
        message: 'Virtual account transaction processed successfully',
        data: {
          reference: transaction.reference,
          merchantCode: transaction.merchantCode,
          value: transaction.value,
          description: transaction.description,
          accountName: transaction.accountName,
          accountNumber: transaction.accountNumber,
          bankCode: transaction.bankCode,
          currency: transaction.currency,
          status: transaction.status,
          fee: transaction.fee,
          netAmount: transaction.netAmount,
          createdAt: transaction.createdAt,
        },
      });
    } catch (error) {
      logger.error(error)
      return res.status(500).json({
        success: false,
        message: 'Failed to process virtual account transaction',
        error: error.message,
      });
    }
  }
  
  async processCardSettlement(req, res) {
    try {
      const { amount, reference, cardNumber, currency, merchantCode } = req.body;
      logger.info(`process settlement request received - ${JSON.stringify(req.body)}`)
      // Validate required fields
      if (!amount || !reference || !cardNumber || !currency || !merchantCode) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }
      
      const transaction = await transactionService.processCardSettlement(req.body);
      logger.info(`process settlement response received - ${JSON.stringify(transaction)}`)

      return res.status(200).json({
        success: true,
        message: 'Card settlement processed successfully',
        data: {
          reference: transaction.reference,
          merchantCode: transaction.merchantCode,
          status: transaction.status,
          updatedAt: transaction.updatedAt,
        },
      });
    } catch (error) {
      logger.error(error)
      return res.status(400).json({
        success: false,
        message: 'Failed to process card settlement',
        error: error.message,
      });
    }
  }
  
  async getAllTransactions(req, res) {
    try {
      const transactions = await transactionService.getAllTransactions();
      
      return res.status(200).json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions.map(transaction => ({
          reference: transaction.reference,
          merchantCode: transaction.merchantCode,
          value: transaction.value,
          description: transaction.description,
          paymentMethod: transaction.paymentMethod,
          cardLastFour: transaction.cardLastFour,
          cardHolderName: transaction.cardHolderName,
          accountName: transaction.accountName,
          accountNumber: transaction.accountNumber,
          bankCode: transaction.bankCode,
          currency: transaction.currency,
          status: transaction.status,
          fee: transaction.fee,
          netAmount: transaction.netAmount,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        })),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve transactions',
        error: error.message,
      });
    }
  }
  
  async getMerchantTransactions(req, res) {
    try {
      const { merchantCode } = req.params;
      
      if (!merchantCode) {
        return res.status(400).json({
          success: false,
          message: 'Merchant code is required',
        });
      }
      
      const transactions = await transactionService.getAllMerchantTransactions(merchantCode);
      
      return res.status(200).json({
        success: true,
        message: 'Merchant transactions retrieved successfully',
        data: transactions.map(transaction => ({
          reference: transaction.reference,
          merchantCode: transaction.merchantCode,
          value: transaction.value,
          description: transaction.description,
          paymentMethod: transaction.paymentMethod,
          cardLastFour: transaction.cardLastFour,
          cardHolderName: transaction.cardHolderName,
          accountName: transaction.accountName,
          accountNumber: transaction.accountNumber,
          bankCode: transaction.bankCode,
          currency: transaction.currency,
          status: transaction.status,
          fee: transaction.fee,
          netAmount: transaction.netAmount,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        })),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve merchant transactions',
        error: error.message,
      });
    }
  }
  
  async createPayout(req, res) {
    try {
      const { merchantCode } = req.body;
      
      if (!merchantCode) {
        return res.status(400).json({
          success: false,
          message: 'Merchant code is required',
        });
      }
      
      const payout = await transactionService.createPayout(merchantCode);
      
      return res.status(201).json({
        success: true,
        message: 'Payout created successfully',
        data: {
          reference: payout.reference,
          merchantCode: payout.merchantCode,
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          createdAt: payout.createdAt,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create payout',
        error: error.message,
      });
    }
  }
  
  async getMerchantBalance(req, res) {
    try {
      const { merchantCode } = req.params;
      
      if (!merchantCode) {
        return res.status(400).json({
          success: false,
          message: 'Merchant code is required',
        });
      }
      
      const balance = await transactionService.getMerchantBalance(merchantCode);
      
      return res.status(200).json({
        success: true,
        message: 'Merchant balance retrieved successfully',
        data: balance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve merchant balance',
        error: error.message,
      });
    }
  }
}

module.exports = new TransactionController();