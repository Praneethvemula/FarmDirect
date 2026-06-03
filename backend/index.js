const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
require('./models'); // Import models and associations

dotenv.config();

const app = express();

// Explicit CORS: allow requests from the Vite dev server and production frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];
// Add production frontend URL if set (e.g. https://farm-direct.vercel.app)
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// cors() middleware above already handles OPTIONS preflight automatically.
// Note: app.options('*', ...) is intentionally omitted — it breaks Express 5
// because path-to-regexp no longer supports bare '*' wildcards.
app.use(express.json());

// Serve uploaded images statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes

const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const consumerRoutes = require('./routes/consumer');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Farmer-Consumer API is running with MySQL...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }) // Sync models with database
  .then(() => {
    console.log('Connected to MySQL via Sequelize');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MySQL connection error:', err));
