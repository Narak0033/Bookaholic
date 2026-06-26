const mongoose = require('mongoose');

const readingLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  pagesRead: { type: Number, required: true, min: 1 },
  hoursSpent: { type: Number, default: 0, min: 0 },
  notes: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

readingLogSchema.index({ userId: 1, bookId: 1 });
readingLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('ReadingLog', readingLogSchema);