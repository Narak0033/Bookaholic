const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  bookClubId: { type: String, required: true },
  bookId: { type: String, default: null },
  bookSnapshot: {
    title: { type: String, default: '' },
    authors: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
  },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  createdBy: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  messageCount: { type: Number, default: 0 },
}, { timestamps: true });

discussionSchema.index({ bookClubId: 1, createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);