const request = require('supertest');
const app = require('../src/app'); // Your Express app
const transactionService = require('../src/services/transaction.service');

jest.mock('../src/services/transaction.service'); // Mock the transaction service

describe('TransactionController', () => {
  describe('POST /v1/transactions/card', () => {
    it('should return a success response when the transaction is processed successfully', async () => {
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

      transactionService.processCardTransaction.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .post('/v1/transactions/card')
        .send({
          value: 1000,
          description: 'Test Transaction',
          cardNumber: '1234567812341234',
          cardHolderName: 'John Doe',
          expirationDate: '12/25',
          cvv: '123',
          currency: 'NGN',
          merchantCode: 'M001',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Card transaction processed successfully');
      expect(response.body.data.reference).toBe(mockTransaction.reference);
    });

    it('should return an error response if required fields are missing', async () => {
      const response = await request(app)
        .post('/v1/transactions/card')
        .send({}); // Sending empty body

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    it('should return an error response if transaction processing fails', async () => {
      const errorMessage = 'Transaction processing failed';
      transactionService.processCardTransaction.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/v1/transactions/card')
        .send({
          value: 1000,
          description: 'Test Transaction',
          cardNumber: '1234567812341234',
          cardHolderName: 'John Doe',
          expirationDate: '12/25',
          cvv: '123',
          currency: 'NGN',
          merchantCode: 'M001',
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to process card transaction');
      expect(response.body.error).toBe(errorMessage);
    });
  });

  
});
