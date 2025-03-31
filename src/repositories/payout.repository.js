const { Payout, Sequelize } = require('../models');
const { Op } = Sequelize;

class PayoutRepository {
    async createPayout(payoutData) {
      return Payout.create(payoutData);
    }
  
    async getAllPayouts() {
      return Payout.findAll({
        order: [['createdAt', 'DESC']],
      });
    }
  
    async getTotalPayouts() {
      const result = await Payout.findOne({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
        ],
        where: {
          status: 'processed',
        },
      });
  
      return result?.getDataValue('total') || 0;
    }
  
    async getPayoutsByMerchantCode(merchantCode) {
      return Payout.findAll({
        where: { merchantCode },
        order: [['createdAt', 'DESC']],
      });
    }
  }
  
  module.exports = new PayoutRepository();
  