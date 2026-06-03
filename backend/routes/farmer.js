const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const { Product, Order, OrderItem, User } = require('../models');

// ── Multer setup — save to backend/uploads/ ──────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
              allowed.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ── POST /api/farmer/upload-image ────────────────────────────
router.post(
  '/upload-image',
  protect,
  authorize('Farmer', 'Admin'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  }
);

// ── Add a product ────────────────────────────────────────────
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
      images,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── Update a product ─────────────────────────────────────────
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

// ── Delete a product ─────────────────────────────────────────
router.delete('/products/:id', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.farmerId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated image files from disk
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(imgUrl => {
        const filename = path.basename(imgUrl);
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await product.destroy();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── Get farmer's own products ────────────────────────────────
router.get('/products', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    const products = await Product.findAll({ where: { farmerId: req.user.id } });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ── Get incoming orders for this farmer ──────────────────────
router.get('/orders', protect, authorize('Farmer', 'Admin'), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { farmerId: req.user.id },
      include: [
        { model: User, as: 'consumer', attributes: ['name', 'email', 'phone', 'location'] },
        {
          model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'images'] }],
        },
      ],
    });
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

// ── Update order status ───────────────────────────────────────
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
