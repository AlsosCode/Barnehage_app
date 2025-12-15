const express = require('express');
const router = express.Router();
const db = require('../utils/dbDriver');
const { validateChildPayload } = require('../utils/validators');

// Helpers
function clean(value) {
  if (value === undefined) return undefined;
  return String(value || '').trim().replace(/[<>]/g, '');
}

const VALID_STATUSES = new Set(['checked_in', 'checked_out', 'home']);

function errorResponse(res, error, fallback = 'Internal error') {
  if (error && error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  return res.status(500).json({ error: fallback });
}

// GET /api/children - Hent alle barn
router.get('/', async (_req, res) => {
  try {
    const children = await db.getChildren();
    res.json(children);
  } catch (error) {
    errorResponse(res, error, 'Failed to fetch children');
  }
});

// POST /api/children - Opprett nytt barn og knytt til forelder
router.post('/', async (req, res) => {
  try {
    const payload = validateChildPayload(req.body);

    if (payload.status && !VALID_STATUSES.has(payload.status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }

    const child = await db.addChild(payload);
    res.status(201).json(child);
  } catch (error) {
    errorResponse(res, error, 'Failed to create child');
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
    errorResponse(res, error, 'Failed to fetch child');
  }
});

// PUT /api/children/:id - Oppdaterer barn (ignorerer felter som ikke er sendt)
router.put('/:id', async (req, res) => {
  try {
    const safeBody = {};
    const name = clean(req.body.name);
    const age = clean(req.body.age);
    const group = clean(req.body.group);
    const status = req.body.status;

    if (name !== undefined) safeBody.name = name;
    if (age !== undefined) safeBody.age = age;
    if (group !== undefined) safeBody.group = group;
    if (Array.isArray(req.body.allergies)) {
      safeBody.allergies = req.body.allergies
        .map((a) => clean(a))
        .filter((a) => a);
    }
    if (status !== undefined) {
      if (!VALID_STATUSES.has(status)) {
        const err = new Error('Invalid status');
        err.status = 400;
        throw err;
      }
      safeBody.status = status;
    }

    const child = await db.updateChild(req.params.id, safeBody);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(child);
  } catch (error) {
    errorResponse(res, error, 'Failed to update child');
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
    errorResponse(res, error, 'Failed to check in child');
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
    errorResponse(res, error, 'Failed to check out child');
  }
});

module.exports = router;
