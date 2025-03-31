const { Transaction, Sequelize } = require('../models');
const { Op } = Sequelize;

class TransactionRepository {
  async createTransaction(transactionData) {
    return Transaction.create(transactionData);
  }

  async findByReference(reference) {
    return Transaction.findOne({
      where: { reference },
    });
  }

  async updateTransactionStatus(reference, status) {
    return Transaction.update(
      { status },
      {
        where: { reference },
        returning: true,
      }
    );
  }

  async getAllTransactions() {
    return Transaction.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllTransactionsByMerchantCode(merchantCode) {
    return Transaction.findAll({
        where: { merchantCode },
      order: [['createdAt', 'DESC']],
    });
  }


  async getTotalAvailableBalance() {
    const result = await Transaction.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('netAmount')), 'total'],
      ],
      where: {
        status: 'success',
      },
    });
    
    return result.getDataValue('total') || 0;
  }


  async getTotalAvailableBalanceByMerchantCode(merchantCode) {
    const result = await Transaction.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('netAmount')), 'total'],
      ],
      where: {
        status: 'success',
        merchantCode:merchantCode
      },
    });
    
    return result.getDataValue('total') || 0;
  }

  async getTotalPendingBalance() {
    const result = await Transaction.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('value')), 'total'],
      ],
      where: {
        status: 'pending',
      },
    });
    
    return result.getDataValue('total') || 0;
  }


  async getTotalPendingBalanceByMerchantCode(merchantCode) {
    const result = await Transaction.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('value')), 'total'],
      ],
      where: {
        status: 'pending',
        merchantCode:merchantCode
      },
    });
    
    return result.getDataValue('total') || 0;
  }

}




module.exports = new TransactionRepository();