const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: 'postgres',
    logging: false,
    port: config.db.port, 
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Use this only for development; set to true in production
        }
  }
}
);

const db = {
  sequelize,
  Sequelize,
  Transaction: require('./transaction.model')(sequelize, Sequelize),
  Payout: require('./payout.model')(sequelize, Sequelize),
  MerchantWallet: require('./merchant-Wallet.model')(sequelize, Sequelize),
};

module.exports = db;