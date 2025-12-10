const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Enkel funksjon som rengjør teksten
function clean(value) {
  if (!value) return "";
  return String(value).trim().replace(/[<>]/g, "");
}

// GET /api/parents - Hent alle foreldre
router.get('/', async (req, res) => {
  try {
    const parents = await db.getParents();
    res.json(parents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parents' });
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
    res.status(500).json({ error: 'Failed to fetch parent' });
  }
});

// POST /api/parents - Opprett ny forelder
router.post('/', async (req, res) => {
  try {
    const safeParent = {
      name: clean(req.body.name),
      email: clean(req.body.email),
      phone: clean(req.body.phone),
      childrenIds: req.body.childrenIds || [] 
     };

    if (!safeParent.name || !safeParent.email || !safeParent.phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newParent = await db.createParent(safeParent);
    res.status(201).json(newParent);
  } catch (error) {
    console.error("Create parent error:", error);
    res.status(500).json({ error: "Failed to create parent" });
  }
});

// PUT /api/parents/:id - Oppdater forelder info
router.put('/:id', async (req, res) => {
  try {

    // GDPR: renser input før oppdatering

    const safeBody = {
      name: clean(req.body.name),
      email: clean(req.body.email),
      phone: clean(req.body.phone),
    };
    
    const parent = await db.updateParent(req.params.id, safeBody);
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json(parent);
  } catch {
    res.status(500).json({ error: 'Failed to update parent' });
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
    const parentChildren = children.filter(child =>
      parent.childrenIds.includes(child.id)
    );

    res.json(parentChildren);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parent children' });
  }
});

module.exports = router;
