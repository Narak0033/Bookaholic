const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  reviewId: { type: String, required: true },
  userId: { type: String, required: true },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
}, { timestamps: true });

commentSchema.index({ reviewId: 1 });

module.exports = mongoose.model('Comment', commentSchema);