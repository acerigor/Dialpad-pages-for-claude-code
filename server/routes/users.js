const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const router = express.Router();

const DEFAULT_PASSWORD = 'core123';

function sanitize(user) {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
}

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
  res.json(users.map(sanitize));
});

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(sanitize(user));
});

router.post('/', async (req, res) => {
  const { password, ...data } = req.body;
  const hash = await bcrypt.hash(password || DEFAULT_PASSWORD, 10);
  const user = await prisma.user.create({ data: { ...data, passwordHash: hash } });
  res.status(201).json(sanitize(user));
});

router.put('/:id', async (req, res) => {
  const { password, ...data } = req.body;
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data,
  });
  res.json(sanitize(user));
});

router.delete('/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ ok: true });
});

module.exports = router;
