const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Enkel funksjon som rengjør teksten
function clean(value) {
  if (!value) return "";
  return String(value).trim().replace(/[<>]/g, "");
}

// GET /api/activities - Hent alle aktiviteter
router.get('/', async (req, res) => {
  try {
    const group = clean(req.query.group)

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
    // GDPR-tillegg: renser alle felter
    const title = clean(req.body.title);
    const description = clean(req.body.description);
    const imageUrl = clean(req.body.imageUrl);
    const group = clean(req.body. group);

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
