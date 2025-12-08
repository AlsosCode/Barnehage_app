const express = require('express');
const router = express.Router();
const db = require('../utils/db');

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
    const { name, email, phone, childrenIds } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newParent = await db.createParent({
      name,
      email,
      phone,
      childrenIds: childrenIds || []
    });

    res.status(201).json(newParent);
  } catch (error) {
    console.error("Create parent error:", error);
    res.status(500).json({ error: "Failed to create parent" });
  }
});

// PUT /api/parents/:id - Oppdater forelder info
router.put('/:id', async (req, res) => {
  try {
    const parent = await db.updateParent(req.params.id, req.body);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    res.json(parent);
  } catch (error) {
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
