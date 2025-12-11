const express = require("express");
const router = express.Router();
const FeedPost = require("../models/Feedpost");

// Lag nytt innlegg
router.post("/create", async (req, res) => {
  const { authorId, text, imageUrl } = req.body;

  try {
    const post = new FeedPost({ authorId, text, imageUrl });
    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunne ikke lage innlegg" });
  }
});

// Henter feed
router.get("/", async (req, res) => {
  try {
    const posts = await FeedPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunne ikke hente innlegg" });
  }
});

module.exports = router;
