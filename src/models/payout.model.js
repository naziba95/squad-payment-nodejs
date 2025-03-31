// src/models/payout.model.js
module.exports = (sequelize, DataTypes) => {
    const Payout = sequelize.define('Payout', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reference: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'processed'),
        allowNull: false,
        defaultValue: 'pending',
      },

      merchantCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    return Payout;
  };