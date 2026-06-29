const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'new_follower',
      'review_comment',
      'review_like',
      'message_like',
      'club_joined',
      'discussion_created',
      'goal_reminder',
      'friend_finished_book',
    ]
  },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);