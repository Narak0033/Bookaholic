const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'started_reading',
      'finished_book',
      'wrote_review',
      'joined_club',
      'created_club',
      'want_to_read',
    ]
  },
  data: { type: Object, default: {} },
}, { timestamps: true });

activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);