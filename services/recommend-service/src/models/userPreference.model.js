const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  genreScores: { type: Map, of: Number, default: {} },
  tropeScores: { type: Map, of: Number, default: {} },
  authorScores: { type: Map, of: Number, default: {} },
  readBookIds: { type: [String], default: [] },
  totalBooksRead: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);