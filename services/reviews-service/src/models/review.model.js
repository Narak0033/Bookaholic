const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  bookSnapshot: {
    title: { type: String, default: '' },
    authors: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    default: '',
    maxlength: 5000
  },
  containsSpoilers: {
    type: Boolean,
    default: false
  },
  likes: {
    type: [String],
    default: []
  },
}, { timestamps: true });

// One review per user per book
reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });
reviewSchema.index({ bookId: 1 });

module.exports = mongoose.model('Review', reviewSchema);