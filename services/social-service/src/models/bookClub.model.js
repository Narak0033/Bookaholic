const mongoose = require('mongoose');

const bookClubSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', maxlength: 1000 },
  createdBy: { type: String, required: true },
  members: { type: [String], default: [] },
  coverImage: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
}, { timestamps: true });

bookClubSchema.index({ name: 'text', tags: 'text' });

module.exports = mongoose.model('BookClub', bookClubSchema);