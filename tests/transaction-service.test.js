const transactionService = require('../services/transaction.service');
const transactionRepository = require('../repositories/transaction.repository');
const merchantWalletRepository = require('../repositories/merchant-wallet.repository');
const config = require('../config/config');

jest.mock('../repositories/transaction.repository');
jest.mock('../repositories/merchant-wallet.repository');
jest.mock('../config/config');

describe('TransactionService', () => {
  describe('processCardTransaction', () => {
    it('should create a new card transaction and update merchant wallet', async () => {
      const mockTransactionData = {
        merchantCode: 'M001',
        value: 1000,
        description: 'Test Transaction',
        cardNumber: '1234567812341234',
        cardHolderName: 'John Doe',
        expirationDate: '12/25',
        cvv: '123',
        currency: 'NGN',
      };

      const mockTransaction = {
        reference: 'CARD-12345',
        merchantCode: 'M001',
        value: 1000,
        description: 'Test Transaction',
        paymentMethod: 'card',
        cardLastFour: '1234',
        cardHolderName: 'John Doe',
        currency: 'NGN',
        status: 'pending',
        fee: 30,
        netAmount: 970,
        expirationDate: '12/25',
      };

      transactionRepository.createTransaction.mockResolvedValue(mockTransaction);
      merchantWalletRepository.ensureWalletExists.mockResolvedValue({});
      merchantWalletRepository.updatePendingBalance.mockResolvedValue({});

      const result = await transactionService.processCardTransaction(mockTransactionData);

      expect(transactionRepository.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        merchantCode: 'M001',
        value: 1000,
        description: 'Test Transaction',
      }));

      expect(merchantWalletRepository.updatePendingBalance).toHaveBeenCalledWith('M001', 1000, true);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw an error if merchant code is missing', async () => {
      const mockTransactionData = {
        value: 1000,
        description: 'Test Transaction',
        cardNumber: '1234567812341234',
        cardHolderName: 'John Doe',
        expirationDate: '12/25',
        cvv: '123',
        currency: 'NGN',
      };

      await expect(transactionService.processCardTransaction(mockTransactionData)).rejects.toThrow('Merchant code is required');
    });

    it('should throw an error if transaction creation fails', async () => {
      const mockTransactionData = {
        merchantCode: 'M001',
        value: 1000,
        description: 'Test Transaction',
        cardNumber: '1234567812341234',
        cardHolderName: 'John Doe',
        expirationDate: '12/25',
        cvv: '123',
        currency: 'NGN',
      };

      transactionRepository.createTransaction.mockRejectedValue(new Error('Transaction creation failed'));

      await expect(transactionService.processCardTransaction(mockTransactionData)).rejects.toThrow('Transaction creation failed');
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status successfully', async () => {
      const mockTransaction = {
        reference: 'CARD-12345',
        merchantCode: 'M001',
        value: 1000,
        description: 'Test Transaction',
        status: 'pending',
      };

      transactionRepository.updateTransactionStatus.mockResolvedValue(mockTransaction);

      const result = await transactionService.updateTransactionStatus('CARD-12345', 'completed');

      expect(transactionRepository.updateTransactionStatus).toHaveBeenCalledWith('CARD-12345', 'completed');
      expect(result.status).toBe('completed');
    });

    it('should throw an error if transaction is not found', async () => {
      transactionRepository.updateTransactionStatus.mockResolvedValue(null);

      await expect(transactionService.updateTransactionStatus('INVALID-123', 'completed')).rejects.toThrow('Transaction not found');
    });
  });
});
