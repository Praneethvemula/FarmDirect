const express = require('express');
const router = express.Router();
const { User, Product, Order, Complaint, Payment } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const sequelize = require('../config/database');

// All routes here are protected and restricted to Admin
router.use(protect);
router.use(authorize('Admin'));

// --- User Management ---

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// --- Complaint Management ---

// Get all complaints
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Resolve complaint
router.post('/complaints/:id/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    complaint.status = 'Resolved';
    complaint.resolution = resolution;
    await complaint.save();
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving complaint' });
  }
});

// --- System & Stats ---

// Get system overview
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.count();
    const productCount = await Product.count();
    const orderCount = await Order.count();
    const pendingComplaints = await Complaint.count({ where: { status: 'Pending' } });
    
    // Revenue from successfully completed payments
    const totalRevenue = await Payment.sum('amount', { where: { paymentStatus: 'Completed' } });
    
    // Get daily sales for reports
    const dailySales = await Payment.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('sum', sequelize.col('amount')), 'total']
      ],
      where: { paymentStatus: 'Completed' },
      group: [sequelize.fn('date', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date', sequelize.col('createdAt')), 'ASC']],
      limit: 30
    });
    
    res.json({
      users: userCount,
      products: productCount,
      orders: orderCount,
      revenue: totalRevenue || 0,
      pendingComplaints,
      dailySales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Check database connection
router.get('/status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'Online', database: 'Connected', uptime: process.uptime() });
  } catch (error) {
    res.status(500).json({ status: 'Degraded', database: 'Disconnected' });
  }
});

module.exports = router;
