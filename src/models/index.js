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

// debugging
console.log('Attempting to connect to database with:');
console.log('  Host:', config.db.host);
console.log('  Port:', config.db.port || 5432); // Default PostgreSQL port is 5432
console.log('  Database:', config.db.database);
console.log('  Username:', config.db.username);

const db = {
  sequelize,
  Sequelize,
  Transaction: require('./transaction.model')(sequelize, Sequelize),
  Payout: require('./payout.model')(sequelize, Sequelize),
  MerchantWallet: require('./merchant-Wallet.model')(sequelize, Sequelize),
};

module.exports = db;