const express = require('express');
const prisma = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 2000;
  const records = await prisma.callRecord.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  res.json(records);
});

router.get('/lead/:leadId', async (req, res) => {
  const records = await prisma.callRecord.findMany({
    where: { leadId: parseInt(req.params.leadId) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(records);
});

router.post('/', async (req, res) => {
  const record = await prisma.callRecord.create({ data: req.body });
  res.status(201).json(record);
});

module.exports = router;
