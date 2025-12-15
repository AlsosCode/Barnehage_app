const express = require('express');
const router = express.Router();
const db = require('../utils/dbDriver');
const { validateParentPayload } = require('../utils/validators');

// Helpers
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

// GET /api/parents - Hent alle foreldre
router.get('/', async (_req, res) => {
  try {
    const parents = await db.getParents();
    res.json(parents);
  } catch (error) {
    errorResponse(res, error, 'Failed to fetch parents');
  }
});

// GET /api/parents/:id - Hent én forelder
router.get('/:id', async (req, res) => {
  try {
    const parent = await db.getParentById(req.params.id);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    res.json(parent);
  } catch (error) {
    errorResponse(res, error, 'Failed to fetch parent');
  }
});

// POST /api/parents - Opprett ny forelder
router.post('/', async (req, res) => {
  try {
    const safeParent = validateParentPayload(req.body);
    const newParent = await db.createParent(safeParent);
    res.status(201).json(newParent);
  } catch (error) {
    errorResponse(res, error, 'Failed to create parent');
  }
});

// PUT /api/parents/:id - Oppdater forelder info
router.put('/:id', async (req, res) => {
  try {
    const safeBody = {};
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const phone = clean(req.body.phone);
    const address = clean(req.body.address);
    const verified = req.body.verified;

    if (name !== undefined) safeBody.name = name;
    if (email !== undefined) safeBody.email = email;
    if (phone !== undefined) safeBody.phone = phone;
    if (address !== undefined) safeBody.address = address;
    if (verified !== undefined) safeBody.verified = !!verified;
    if (Array.isArray(req.body.childrenIds)) safeBody.childrenIds = req.body.childrenIds;

    const parent = await db.updateParent(req.params.id, safeBody);
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch (error) {
    errorResponse(res, error, 'Failed to update parent');
  }
});

// POST /api/parents/:id/verify - marker/verifiser/avverifiser
router.post('/:id/verify', async (req, res) => {
  try {
    const verified = req.body.verified === false ? false : true;
    const parent = await db.updateParent(req.params.id, { verified });
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch (error) {
    errorResponse(res, error, 'Failed to verify parent');
  }
});

// GET /api/parents/:id/children - Hent barn for forelder
router.get('/:id/children', async (req, res) => {
  try {
    const parent = await db.getParentById(req.params.id);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const children = await db.getChildren();
    const parentChildren = children.filter((child) =>
      parent.childrenIds.includes(child.id)
    );

    res.json(parentChildren);
  } catch (error) {
    errorResponse(res, error, 'Failed to fetch parent children');
  }
});

module.exports = router;
