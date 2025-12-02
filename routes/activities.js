const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// GET /api/activities - Hent alle aktiviteter
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;

    if (group) {
      const activities = await db.getActivitiesByGroup(group);
      return res.json(activities);
    }

    const activities = await db.getActivities();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// POST /api/activities - Legg til ny aktivitet
router.post('/', async (req, res) => {
  try {
    const { title, description, imageUrl, group } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const newActivity = await db.addActivity({
      title,
      description,
      imageUrl: imageUrl || null,
      createdBy: 'staff',
      group: group || 'Blå gruppe'
    });

    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

module.exports = router;
