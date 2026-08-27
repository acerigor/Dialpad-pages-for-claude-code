const express = require('express');
const prisma = require('../db');
const router = express.Router();

router.get('/lead/:leadId', async (req, res) => {
  const { type } = req.query;
  const where = { leadId: parseInt(req.params.leadId) };
  if (type) where.type = type;

  const messages = await prisma.message.findMany({ where, orderBy: { createdAt: 'asc' } });
  res.json(messages);
});

router.post('/', async (req, res) => {
  const message = await prisma.message.create({ data: req.body });
  res.status(201).json(message);
});

module.exports = router;
