const express = require('express');
const prisma = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 2000;
  const records = await prisma.smsRecord.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  res.json(records);
});

router.post('/', async (req, res) => {
  const record = await prisma.smsRecord.create({ data: req.body });
  res.status(201).json(record);
});

module.exports = router;
