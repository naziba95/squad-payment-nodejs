const transactionService = require('../src/services/transaction.service');
const transactionRepository = require('../src/repositories/transaction.repository');
const merchantWalletRepository = require('../src/repositories/merchant-wallet.repository');
const payoutRepository = require('../src/repositories/payout.repository');
const config = require('../src/config/config');

jest.mock('../src/repositories/transaction.repository');
jest.mock('../src/repositories/merchant-wallet.repository');
jest.mock('../src/repositories/payout.repository');
jest.mock('../src/config/config');

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



  describe('TransactionService - createPayout', () => {
    const merchantCode = 'MERCHANT123';
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should create a payout successfully', async () => {
      // Mock wallet balance (merchant has available funds)
      merchantWalletRepository.getWalletBalance.mockResolvedValue({
        available: 1000,
        currency: 'USD',
      });
  
      // Mock payout repository
      payoutRepository.createPayout.mockResolvedValue({
        reference: 'PO-123456',
        amount: 1000,
        currency: 'USD',
        status: 'processed',
        merchantCode,
      });
  
      // Mock wallet update
      merchantWalletRepository.updateAvailableBalance.mockResolvedValue(true);
  
      // Call the function
      const result = await transactionService.createPayout(merchantCode);
  
      // Assertions
      expect(result).toHaveProperty('reference');
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('processed');
  
      // Verify mocks were called correctly
      expect(merchantWalletRepository.getWalletBalance).toHaveBeenCalledWith(merchantCode);
      expect(payoutRepository.createPayout).toHaveBeenCalled();
      expect(merchantWalletRepository.updateAvailableBalance).toHaveBeenCalledWith(merchantCode, 1000, false);
    });
  
    it('should throw an error if merchantCode is missing', async () => {
      await expect(transactionService.createPayout()).rejects.toThrow('Merchant code is required');
    });
  
    it('should throw an error if no funds are available', async () => {
      // Mock wallet balance (no funds available)
      merchantWalletRepository.getWalletBalance.mockResolvedValue({
        available: 0,
        currency: 'USD',
      });
  
      await expect(transactionService.createPayout(merchantCode)).rejects.toThrow('No funds available for payout');
  
      expect(merchantWalletRepository.getWalletBalance).toHaveBeenCalledWith(merchantCode);
      expect(payoutRepository.createPayout).not.toHaveBeenCalled();
      expect(merchantWalletRepository.updateAvailableBalance).not.toHaveBeenCalled();
    });

});
});
