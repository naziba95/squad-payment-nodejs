const { MerchantWallet, Sequelize, sequelize } = require('../models');
const { Op } = Sequelize;

class MerchantWalletRepository {
  async findByMerchantCode(merchantCode) {
    console.log(merchantCode)
    return MerchantWallet.findOne({
      where: { merchantCode },
    });
  }

  async createWallet(merchantCode, currency = 'NGN') {
    return MerchantWallet.create({
      merchantCode,
      availableBalance: 0.00,
      pendingBalance: 0.00,
      currency,
    });
  }

  async updateAvailableBalance(merchantCode, amount, increment = true) {
    const wallet = await this.findByMerchantCode(merchantCode);
    
    if (!wallet) {
      throw new Error(`Wallet not found for merchant: ${merchantCode}`);
    }

    return sequelize.transaction(async (t) => {
      return wallet.update({
        availableBalance: increment 
          ? Sequelize.literal(`"availableBalance" + ${parseFloat(amount)}`)
          : Sequelize.literal(`"availableBalance" - ${parseFloat(amount)}`),
        lastUpdated: new Date()
      }, { transaction: t });
    });
  }

  async updatePendingBalance(merchantCode, amount, increment = true) {
    const wallet = await this.findByMerchantCode(merchantCode);
    
    if (!wallet) {
      throw new Error(`Wallet not found for merchant: ${merchantCode}`);
    }

    return sequelize.transaction(async (t) => {
      return wallet.update({
        pendingBalance: increment 
          ? Sequelize.literal(`"pendingBalance" + ${parseFloat(amount)}`)
          : Sequelize.literal(`"pendingBalance" - ${parseFloat(amount)}`),
        lastUpdated: new Date()
      }, { transaction: t });
    });
  }

  async getWalletBalance(merchantCode) {
    const wallet = await this.findByMerchantCode(merchantCode);
    
    if (!wallet) {
      throw new Error(`Wallet not found for merchant: ${merchantCode}`);
    }

    return {
      available: parseFloat(wallet.availableBalance) || 0,
      pending: parseFloat(wallet.pendingBalance) || 0,
      currency: wallet.currency
    };
  }

  async ensureWalletExists(merchantCode, currency = 'NGN') {
    let wallet = await this.findByMerchantCode(merchantCode);
    
    if (!wallet) {
      wallet = await this.createWallet(merchantCode, currency);
    }
    
    return wallet;
  }
}

module.exports = new MerchantWalletRepository();