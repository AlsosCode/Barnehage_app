const express = require('express');
const router = express.Router();
const db = require('../utils/dbDriver');

function clean(value) {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

function errorResponse(res, error, fallback = 'Internal error') {
  if (error && error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  return res.status(500).json({ error: fallback });
}

// GET /api/messages?parentId=1 - hent meldinger
router.get('/', async (req, res) => {
  try {
    const parentIdRaw = clean(req.query.parentId);
    let messages;
    if (parentIdRaw) {
      messages = await db.getMessagesForParent(parentIdRaw);
    } else {
      messages = await db.getMessages();
    }
    res.json(messages);
  } catch (error) {
    errorResponse(res, error, 'Failed to fetch messages');
  }
});

// POST /api/messages - opprett ny melding
router.post('/', async (req, res) => {
  try {
    const parentId = req.body.parentId;
    const sender = req.body.sender === 'staff' ? 'staff' : 'parent';
    const content = clean(req.body.content);

    if (!parentId || !content) {
      const err = new Error('parentId and content are required');
      err.status = 400;
      throw err;
    }

    const message = await db.addMessage({
      parentId,
      sender,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    errorResponse(res, error, 'Failed to create message');
  }
});

// POST /api/messages/:id/read - marker som lest
router.post('/:id/read', async (req, res) => {
  try {
    const updated = await db.markMessageRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(updated);
  } catch (error) {
    errorResponse(res, error, 'Failed to mark message as read');
  }
});

module.exports = router;

