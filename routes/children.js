const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// GET /api/children - Hent alle barn
router.get('/', async (req, res) => {
  try {
    const children = await db.getChildren();
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// GET /api/children/:id - Hent ett barn
router.get('/:id', async (req, res) => {
  try {
    const child = await db.getChildById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

// PUT /api/children/:id - Oppdater barn
router.put('/:id', async (req, res) => {
  try {
    const child = await db.updateChild(req.params.id, req.body);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// POST /api/children/:id/checkin - Sjekk inn barn
router.post('/:id/checkin', async (req, res) => {
  try {
    const child = await db.checkInChild(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json({ message: 'Child checked in successfully', child });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in child' });
  }
});

// POST /api/children/:id/checkout - Sjekk ut barn
router.post('/:id/checkout', async (req, res) => {
  try {
    const child = await db.checkOutChild(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json({ message: 'Child checked out successfully', child });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check out child' });
  }
});

module.exports = router;
