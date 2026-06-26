const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  googleBooksId: {
    type: String,
    unique: true,
    sparse: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  authors: { type: [String], default: [] },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  genres: { type: [String], default: [] },
  tropes: { type: [String], default: [] },
  pageCount: { type: Number, default: 0 },
  publishedDate: { type: String, default: '' },
  publisher: { type: String, default: '' },
  isbn: { type: String, default: '' },
  language: { type: String, default: 'en' },
  isManualEntry: { type: Boolean, default: false },
  googleRating: { type: Number, default: 0 },
  googleRatingsCount: { type: Number, default: 0 },
  addedBy: { type: String, default: null },
}, { timestamps: true });

bookSchema.index({ title: 'text', authors: 'text' });

module.exports = mongoose.model('Book', bookSchema);