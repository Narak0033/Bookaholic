const mongoose = require('mongoose');

const shelfSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  bookSnapshot: {
    title: { type: String, default: '' },
    authors: { type: [String], default: [] },
    genres: { type: [String], default: [] },
    tropes: { type: [String], default: [] },
    pageCount: { type: Number, default: 0 },
    coverImage: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['want_to_read', 'reading', 'finished'],
    default: 'want_to_read'
  },
  currentPage: { type: Number, default: 0 },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
}, { timestamps: true });

shelfSchema.index({ userId: 1, bookId: 1 }, { unique: true });
shelfSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Shelf', shelfSchema);