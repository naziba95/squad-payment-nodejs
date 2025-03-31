const { v4: uuidv4 } = require('uuid');
const transactionRepository = require('../repositories/transaction.repository');
const payoutRepository = require('../repositories/payout.repository');
const merchantWalletRepository = require('../repositories/merchant-wallet.repository');
const config = require('../config/config');

class TransactionService {
  async processCardTransaction(transactionData) {
    const { merchantCode, value, description, cardNumber, cardHolderName, expirationDate, cvv, currency } = transactionData;
    
    if (!merchantCode) {
      throw new Error('Merchant code is required');
    }
    
    // Ensure merchant wallet exists
    await merchantWalletRepository.ensureWalletExists(merchantCode, currency);
    
    // Generate unique reference
    const reference = `CARD-${uuidv4()}`;
    
    // Calculate fee (3% for card transactions)
    const feePercentage = config.fees.cardFeePercentage / 100;
    const fee = parseFloat(value) * feePercentage;
    const netAmount = parseFloat(value) - fee;
    
    // Store only last 4 digits of card number
    const cardLastFour = cardNumber.replace(/\s/g, '').slice(-4);
    
    const transactionToCreate = {
      merchantCode,
      reference,
      value,
      description,
      paymentMethod: 'card',
      cardLastFour,
      cardHolderName,
      currency,
      status: 'pending', // Card transactions start as pending
      fee,
      netAmount,
      expirationDate
    };
    
    // Create transaction in database
    const result = await transactionRepository.createTransaction(transactionToCreate);
    
    // Update merchant wallet pending balance
    await merchantWalletRepository.updatePendingBalance(merchantCode, value, true);
    
    return result;
  }
  
  async processVirtualAccountTransaction(transactionData) {
    const { merchantCode, value, description, accountName, accountNumber, bankCode, currency } = transactionData;
    
    if (!merchantCode) {
      throw new Error('Merchant code is required');
    }
    
    // Ensure merchant wallet exists
    await merchantWalletRepository.ensureWalletExists(merchantCode, currency);
    
    // Generate unique reference
    const reference = `VA-${uuidv4()}`;
    
    // Calculate fee (5% for virtual account transactions)
    const feePercentage = config.fees.virtualAccountFeePercentage / 100;
    const fee = parseFloat(value) * feePercentage;
    const netAmount = parseFloat(value) - fee;
    
    const transactionToCreate = {
      merchantCode,
      reference,
      value,
      description,
      paymentMethod: 'virtualAccount',
      accountName,
      accountNumber,
      bankCode,
      currency,
      status: 'success', // Virtual account transactions are immediately successful
      fee,
      netAmount,
    };
    
    // Create transaction in database
    const result = await transactionRepository.createTransaction(transactionToCreate);
    
    // Update merchant wallet available balance since virtual account transactions are immediately successful
    await merchantWalletRepository.updateAvailableBalance(merchantCode, netAmount, true);
    
    return result;
  }
  
  async processCardSettlement(settlementData) {
    const { amount, reference, cardNumber, currency, merchantCode } = settlementData;
    
    // Find transaction by reference
    const transaction = await transactionRepository.findByReference(reference);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // Verify transaction details
    if (
      transaction.paymentMethod !== 'card' ||
      transaction.status !== 'pending' ||
      parseFloat(transaction.value) !== parseFloat(amount) ||
      transaction.currency !== currency ||
      transaction.cardLastFour !== cardNumber.replace(/\s/g, '').slice(-4) ||
      transaction.merchantCode !== merchantCode
    ) {
      throw new Error('Settlement details do not match transaction');
    }
    
    // Update transaction status to success
    const [updatedCount, updatedTransactions] = await transactionRepository.updateTransactionStatus(reference, 'success');
    
    if (updatedCount === 0) {
      throw new Error('Failed to update transaction status');
    }
    
    // Update merchant wallet: subtract from pending and add to available
    await merchantWalletRepository.updatePendingBalance(merchantCode, transaction.value, false);
    await merchantWalletRepository.updateAvailableBalance(merchantCode, transaction.netAmount, true);
    
    return updatedTransactions[0];
  }
  
  async getAllTransactions() {
    return transactionRepository.getAllTransactions();
  }

  async getAllMerchantTransactions(merchantCode) {
    if (!merchantCode) {
      throw new Error('Merchant code is required');
    }
    return transactionRepository.getAllTransactionsByMerchantCode(merchantCode);
  }

  async createPayout(merchantCode) {
    if (!merchantCode) {
      throw new Error('Merchant code is required');
    }
    
    // Get merchant wallet balance
    const walletBalance = await merchantWalletRepository.getWalletBalance(merchantCode);

    console.log(walletBalance)
    
    if (walletBalance.available <= 0) {
      throw new Error('No funds available for payout');
    }
    
    // Create payout
    const payoutData = {
      reference: `PO-${uuidv4()}`,
      amount: walletBalance.available,
      currency: walletBalance.currency,
      status: 'processed',
      merchantCode
    };
    
    // Create payout record
    const payout = await payoutRepository.createPayout(payoutData);
    
    // Deduct the amount from merchant wallet
    await merchantWalletRepository.updateAvailableBalance(merchantCode, payoutData.amount, false);
    
    return payout;
  }
  
  async getMerchantBalance(merchantCode) {
    if (!merchantCode) {
      throw new Error('Merchant code is required');
    }
    
    return merchantWalletRepository.getWalletBalance(merchantCode);
  }
}

module.exports = new TransactionService();