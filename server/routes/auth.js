const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const { authMiddleware, signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { initials, password } = req.body;
  if (!initials || !password) {
    return res.status(400).json({ error: 'Initials and password required' });
  }
  const user = await prisma.user.findUnique({ where: { initials: initials.toUpperCase() } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, initials: user.initials, name: user.name, role: user.role }
  });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, initials: user.initials, name: user.name, role: user.role, email: user.email });
});

module.exports = router;
