const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Farmer', 'Consumer'),
    defaultValue: 'Consumer',
  },
  phone: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING, // Can be coordinates or address string
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = User;
