const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Product, Order, OrderItem, User, Payment } = require('../models');
const { Op } = require('sequelize');

// Get all products (public with search/filter)
router.get('/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    let where = {};
    
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    
    if (category && category !== 'All') {
      where.category = category;
    }

    const products = await Product.findAll({
      where,
      include: [{ model: User, as: 'farmer', attributes: ['name', 'location'] }]
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Place an order
router.post('/orders', protect, authorize('Consumer'), async (req, res) => {
  try {
    const { farmerId, products, totalAmount, paymentMethod, deliveryAddress, transactionId } = req.body;
    
    // 1. Create Order
    const order = await Order.create({
      consumerId: req.user.id,
      farmerId,
      totalAmount,
      deliveryAddress,
      status: 'Pending'
    });

    // 2. Create Payment Record (New Table)
    await Payment.create({
      orderId: order.id,
      amount: totalAmount,
      paymentMethod,
      transactionId: transactionId || null,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed'
    });

    // 3. Handle order items
    if (products && products.length > 0) {
      const orderItems = products.map(p => ({
        orderId: order.id,
        productId: p.productId,
        quantity: p.quantity,
        priceAtPurchase: p.priceAtPurchase
      }));
      await OrderItem.bulkCreate(orderItems);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get user's orders
router.get('/orders', protect, authorize('Consumer'), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { consumerId: req.user.id },
      include: [
        { model: User, as: 'farmer', attributes: ['name', 'phone'] },
        { 
          model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'images'] }]
        }
      ]
    });
    // Format response to match expected frontend structure if needed (products instead of items)
    const formattedOrders = orders.map(ord => {
      const ordJson = ord.toJSON();
      ordJson.products = ordJson.items;
      return ordJson;
    });
    res.json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
