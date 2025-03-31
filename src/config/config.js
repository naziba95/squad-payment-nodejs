// require('dotenv').config();
// In index.js (at the very top, before any other requires)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log(__dirname)

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'payment_service',
    port: process.env.DB_PORT || 5432,
  },
  fees: {
    cardFeePercentage: parseFloat(process.env.CARD_FEE_PERCENTAGE || '3'),
    virtualAccountFeePercentage: parseFloat(process.env.VIRTUAL_ACCOUNT_FEE_PERCENTAGE || '5'),
  },
};