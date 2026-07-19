const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  discussionId: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true, maxlength: 2000 },
  likes: { type: [String], default: [] },
  parentMessageId: { type: String, default: null },
}, { timestamps: true });

messageSchema.index({ discussionId: 1, createdAt: 1 });
messageSchema.index({ parentMessageId: 1 });

module.exports = mongoose.model('Message', messageSchema);