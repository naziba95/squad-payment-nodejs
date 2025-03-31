module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
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
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      merchantCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.ENUM('card', 'virtualAccount'),
        allowNull: false,
      },
      cardLastFour: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      expirationDate: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      cardHolderName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      netAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    });
  
    return Transaction;
  };