// tests/transaction.service.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const transactionService = require('../src/services/transaction.service');
const transactionRepository = require('../src/repositories/transaction.repository');
const payoutRepository = require('../src/repositories/payout.repository');

describe('Transaction Service', () => {
  beforeEach(() => {
    // Reset all stubs before each test
    sinon.restore();
  });

  describe('processCardTransaction', () => {
    it('should process a card transaction successfully', async () => {
      // Stub repository method
      const createStub = sinon.stub(transactionRepository, 'createTransaction').resolves({
        reference: 'CARD-123',
        value: '5000',
        description: 'Test transaction',
        paymentMethod: 'card',
        cardLastFour: '4444',
        cardHolderName: 'John Doe',
        currency: 'NGN',
        status: 'pending',
        fee: 150,
        netAmount: 4850,
        createdAt: new Date(),
      });

      const transactionData = {
        value: '5000',
        description: 'Test transaction',
        cardNumber: '5555 5555 5555 4444',
        cardHolderName: 'John Doe',
        expirationDate: '06/23',
        cvv: '123',
        currency: 'NGN',
      };

      const result = await transactionService.processCardTransaction(transactionData);

      expect(result).to.have.property('reference').that.includes('CARD-');
      expect(result).to.have.property('status', 'pending');
      expect(result).to.have.property('cardLastFour', '4444');
      expect(createStub.calledOnce).to.be.true;
    });
  });

  describe('processVirtualAccountTransaction', () => {
    it('should process a virtual account transaction successfully', async () => {
      // Stub repository method
      const createStub = sinon.stub(transactionRepository, 'createTransaction').resolves({
        reference: 'VA-123',
        value: '5000',
        description: 'Test transaction',
        paymentMethod: 'virtualAccount',
        accountName: 'John Doe',
        accountNumber: '1234567890',
        bankCode: '058',
        currency: 'NGN',
        status: 'success',
        fee: 250,
        netAmount: 4750,
        createdAt: new Date(),
      });

      const transactionData = {
        value: '5000',
        description: 'Test transaction',
        accountName: 'John Doe',
        accountNumber: '1234567890',
        bankCode: '058',
        currency: 'NGN',
      };

      const result = await transactionService.processVirtualAccountTransaction(transactionData);

      expect(result).to.have.property('reference').that.includes('VA-');
      expect(result).to.have.property('status', 'success');
      expect(result).to.have.property('accountName', 'John Doe');
      expect(createStub.calledOnce).to.be.true;
    });
  });

  describe('processCardSettlement', () => {
    it('should settle a card transaction successfully', async () => {
      // Stub findByReference to return a pending transaction
      const findStub = sinon.stub(transactionRepository, 'findByReference').resolves({
        reference: 'CARD-123',
        value: '5000',
        paymentMethod: 'card',
        cardLastFour: '4444',
        currency: 'NGN',
        status: 'pending',
      });

      // Stub updateTransactionStatus to return updated transaction
      const updateStub = sinon.stub(transactionRepository, 'updateTransactionStatus').resolves([
        1,
        [
          {
            reference: 'CARD-123',
            value: '5000',
            paymentMethod: 'card',
            cardLastFour: '4444',
            currency: 'NGN',
            status: 'success',
            updatedAt: new Date(),
          }
        ]
      ]);

      const settlementData = {
        amount: '5000',
        reference: 'CARD-123',
        cardNumber: '5555 5555 5555 4444',
        currency: 'NGN',
      };

      const result = await transactionService.processCardSettlement(settlementData);

      expect(result).to.have.property('reference', 'CARD-123');
      expect(result).to.have.property('status', 'success');
      expect(findStub.calledOnce).to.be.true;
      expect(updateStub.calledOnce).to.be.true;
    });

    it('should throw an error if transaction is not found', async () => {
      // Stub findByReference to return null
      sinon.stub(transactionRepository, 'findByReference').resolves(null);

      const settlementData = {
        amount: '5000',
        reference: 'CARD-123',
        cardNumber: '5555 5555 5555 4444',
        currency: 'NGN',
      };

      try {
        await transactionService.processCardSettlement(settlementData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Transaction not found');
      }
    });
  });

  describe('getMerchantBalance', () => {
    it('should return correct merchant balance', async () => {
      // Stub repository methods
      sinon.stub(transactionRepository, 'getTotalAvailableBalance').resolves('10000');
      sinon.stub(payoutRepository, 'getTotalPayouts').resolves('3000');
      sinon.stub(transactionRepository, 'getTotalPendingBalance').resolves('5000');

      const result = await transactionService.getMerchantBalance();

      expect(result).to.have.property('available', 7000); // 10000 - 3000
      expect(result).to.have.property('pending_settlement', 5000);
    });
  });
});

// tests/transaction.controller.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const transactionController = require('../src/controllers/transaction.controller');
const transactionService = require('../src/services/transaction.service');

describe('Transaction Controller', () => {
  beforeEach(() => {
    // Reset all stubs before each test
    sinon.restore();
  });

  describe('processCardTransaction', () => {
    it('should return 201 with transaction data on success', async () => {
      // Mock request and response
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          value: '5000',
          description: 'Test transaction',
          cardNumber: '5555 5555 5555 4444',
          cardHolderName: 'John Doe',
          expirationDate: '06/23',
          cvv: '123',
          currency: 'NGN',
        },
      });
      const res = httpMocks.createResponse();

      // Stub service method
      sinon.stub(transactionService, 'processCardTransaction').resolves({
        reference: 'CARD-123',
        value: '5000',
        description: 'Test transaction',
        cardLastFour: '4444',
        cardHolderName: 'John Doe',
        currency: 'NGN',
        status: 'pending',
        fee: 150,
        netAmount: 4850,
        createdAt: new Date(),
      });

      await transactionController.processCardTransaction(req, res);

      const data = res._getJSONData();
      expect(res._getStatusCode()).to.equal(201);
      expect(data).to.have.property('success', true);
      expect(data.data).to.have.property('reference', 'CARD-123');
      expect(data.data).to.have.property('status', 'pending');
    });

    it('should return 400 if required fields are missing', async () => {
      // Mock request and response with missing fields
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          value: '5000',
          // Missing other required fields
        },
      });
      const res = httpMocks.createResponse();

      await transactionController.processCardTransaction(req, res);

      const data = res._getJSONData();
      expect(res._getStatusCode()).to.equal(400);
      expect(data).to.have.property('success', false);
      expect(data).to.have.property('message', 'Missing required fields');
    });
  });

  describe('getMerchantBalance', () => {
    it('should return 200 with balance data on success', async () => {
      // Mock request and response
      const req = httpMocks.createRequest({
        method: 'GET',
      });
      const res = httpMocks.createResponse();

      // Stub service method
      sinon.stub(transactionService, 'getMerchantBalance').resolves({
        available: 7000,
        pending_settlement: 5000,
      });

      await transactionController.getMerchantBalance(req, res);

      const data = res._getJSONData();
      expect(res._getStatusCode()).to.equal(200);
      expect(data).to.have.property('success', true);
      expect(data.data).to.have.property('available', 7000);
      expect(data.data).to.have.property('pending_settlement', 5000);
    });
  });

  describe('createPayout', () => {
    it('should return 201 with payout data on success', async () => {
      // Mock request and response
      const req = httpMocks.createRequest({
        method: 'POST',
      });
      const res = httpMocks.createResponse();

      // Stub service method
      sinon.stub(transactionService, 'createPayout').resolves({
        reference: 'PO-123',
        amount: 7000,
        currency: 'NGN',
        status: 'processed',
        createdAt: new Date(),
      });

      await transactionController.createPayout(req, res);

      const data = res._getJSONData();
      expect(res._getStatusCode()).to.equal(201);
      expect(data).to.have.property('success', true);
      expect(data.data).to.have.property('reference', 'PO-123');
      expect(data.data).to.have.property('amount', 7000);
      expect(data.data).to.have.property('status', 'processed');
    });

    it('should return 400 if no funds are available for payout', async () => {
      // Mock request and response
      const req = httpMocks.createRequest({
        method: 'POST',
      });
      const res = httpMocks.createResponse();

      // Stub service method to throw error
      sinon.stub(transactionService, 'createPayout').rejects(new Error('No funds available for payout'));

      await transactionController.createPayout(req, res);

      const data = res._getJSONData();
      expect(res._getStatusCode()).to.equal(400);
      expect(data).to.have.property('success', false);
      expect(data).to.have.property('message', 'Failed to create payout');
      expect(data).to.have.property('error', 'No funds available for payout');
    });
  });
});