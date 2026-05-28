const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user exists
    let user = await User.findOne({ where: { email: normalizedEmail } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'Consumer',
      phone,
      location
    });

    // Create JWT
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[AUTH DEBUG] Login attempt for email: ${normalizedEmail}`);
    console.log(`[AUTH DEBUG] Request body:`, { email: normalizedEmail, passwordLength: password?.length });
    
    // Check if user exists
    const user = await User.findOne({ where: { email: normalizedEmail } });
    console.log(`[AUTH DEBUG] Database query result. User found:`, user ? `Yes (ID: ${user.id}, Role: ${user.role})` : 'No');

    if (!user) {
      console.log(`[AUTH DEBUG] Failed: User with email ${email} not found.`);
      return res.status(400).json({ message: 'Invalid credentials: User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH DEBUG] Password check result:`, isMatch ? 'Match' : 'Mismatch');

    if (!isMatch) {
      console.log(`[AUTH DEBUG] Failed: Password mismatch for ${email}.`);
      return res.status(400).json({ message: 'Invalid credentials: Password incorrect' });
    }

    // Create JWT
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log(`[AUTH DEBUG] Success: JWT generated for ${email}.`);

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error(`[AUTH DEBUG] Server Error during login:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
