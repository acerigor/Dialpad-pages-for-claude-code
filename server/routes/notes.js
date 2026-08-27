const express = require('express');
const prisma = require('../db');
const router = express.Router();

router.get('/lead/:leadId', async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { leadId: parseInt(req.params.leadId) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notes);
});

router.post('/', async (req, res) => {
  const note = await prisma.note.create({ data: req.body });
  res.status(201).json(note);
});

module.exports = router;
