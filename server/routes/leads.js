const express = require('express');
const prisma = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const { status, active, assign, source, search, page = 1, limit = 50 } = req.query;
  const where = {};

  if (status) where.status = status;
  if (active !== undefined) where.active = active === 'true';
  if (assign) where.assign = assign;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
      { vehicle: { contains: search } },
      { stock: { contains: search } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where }),
  ]);

  res.json({ leads, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

router.get('/:id', async (req, res) => {
  const lead = await prisma.lead.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { messages: { orderBy: { createdAt: 'asc' } }, notes: { orderBy: { createdAt: 'desc' } } },
  });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

router.post('/', async (req, res) => {
  const lead = await prisma.lead.create({ data: req.body });
  res.status(201).json(lead);
});

router.put('/:id', async (req, res) => {
  const lead = await prisma.lead.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(lead);
});

router.delete('/:id', async (req, res) => {
  await prisma.lead.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

module.exports = router;
