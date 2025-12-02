const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// GET /api/stats - Hent statistikk
router.get('/', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/groups - Hent alle grupper
router.get('/groups', async (req, res) => {
  try {
    const groups = await db.getGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

module.exports = router;
