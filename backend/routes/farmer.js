const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Product, Order, OrderItem, User } = require('../models');

// Add a product
router.post('/products', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    const { name, category, description, price, unit, stock, images } = req.body;
    
    const product = await Product.create({
      farmerId: req.user.id,
      name,
      category,
      description,
      price,
      unit,
      stock,
      images
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a product
router.put('/products/:id', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.farmerId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a product
router.delete('/products/:id', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.farmerId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.destroy();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get farmer's own products
router.get('/products', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    const products = await Product.findAll({ where: { farmerId: req.user.id } });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get incoming orders for this farmer
router.get('/orders', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { farmerId: req.user.id },
      include: [
        { model: User, as: 'consumer', attributes: ['name', 'email', 'phone', 'location'] },
        { 
          model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'images'] }]
        }
      ]
    });
    // Format response to match expected frontend structure if needed
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

// Update order status
router.put('/orders/:id/status', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.farmerId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
