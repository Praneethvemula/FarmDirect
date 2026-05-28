const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Complaint = require('./Complaint');
const Payment = require('./Payment');

// User <-> Product
User.hasMany(Product, { foreignKey: 'farmerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// User <-> Order (Consumer)
User.hasMany(Order, { foreignKey: 'consumerId', as: 'ordersPlaced' });
Order.belongsTo(User, { foreignKey: 'consumerId', as: 'consumer' });

// User <-> Order (Farmer)
User.hasMany(Order, { foreignKey: 'farmerId', as: 'ordersReceived' });
Order.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// Order <-> OrderItem <-> Product
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order <-> Payment
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// User <-> Complaint
User.hasMany(Complaint, { foreignKey: 'userId', as: 'complaints' });
Complaint.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
  Complaint,
  Payment,
};
