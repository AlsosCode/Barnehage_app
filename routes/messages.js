const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Send melding
router.post("/send", async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  try {
    const message = new Message({ senderId, receiverId, text });
    await message.save();
    res.json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunne ikke sende melding" });
  }
});

// Meldinger mellom 2 brukere
router.get("/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunne ikke hente meldinger" });
  }
});

module.exports = router;
