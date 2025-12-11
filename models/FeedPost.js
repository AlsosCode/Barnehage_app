const mongoose = require("mongoose");

const FeedPostSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  text: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FeedPost", FeedPostSchema);
