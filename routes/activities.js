const express = require('express');
const router = express.Router();
const db = require('../utils/dbDriver');
const { validateActivityPayload } = require('../utils/validators');

function clean(value) {
  if (value === undefined) return undefined;
  return String(value || '').trim().replace(/[<>]/g, '');
}

function errorResponse(res, error, fallback = 'Internal error') {
  if (error && error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  return res.status(500).json({ error: fallback });
}

// GET /api/activities - Hent alle aktiviteter
router.get('/', async (req, res) => {
  try {
    const group = clean(req.query.group);
    const limit = Math.max(0, parseInt(req.query.limit, 10) || 0);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const date = clean(req.query.date); // YYYY-MM-DD (valgfritt)

    let activities = group
      ? await db.getActivitiesByGroup(group)
      : await db.getActivities();

    if (date) {
      activities = activities.filter(
        (a) => new Date(a.createdAt).toISOString().slice(0, 10) === date
      );
    }

    if (limit > 0) {
      const total = activities.length;
      const items = activities.slice(offset, offset + limit);
      return res.json({ items, total, limit, offset });
    }

    res.json(activities);
  } catch (error) {
    errorResponse(res, error, 'Failed to fetch activities');
  }
});

// POST /api/activities - Legg til ny aktivitet
router.post('/', async (req, res) => {
  try {
    const { title, description, imageUrl, videoUrl, group, media } =
      validateActivityPayload(req.body);

    const newActivity = await db.addActivity({
      title,
      description,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      media: media && media.length ? media : undefined,
      createdBy: 'staff',
      group: group || undefined,
    });

    res.status(201).json(newActivity);
  } catch (error) {
    errorResponse(res, error, 'Failed to create activity');
  }
});

module.exports = router;
