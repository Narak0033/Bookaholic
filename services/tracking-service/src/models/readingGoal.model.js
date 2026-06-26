const mongoose = require('mongoose');

const readingGoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  year: { type: Number, required: true },
  targetBooks: { type: Number, required: true, min: 1 },
}, { timestamps: true });

readingGoalSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('ReadingGoal', readingGoalSchema);