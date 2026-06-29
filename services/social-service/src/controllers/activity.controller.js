const Activity = require('../models/activity.model');
const Follow = require('../models/follow.model');

// Called by other services to record an activity
exports.createActivity = async (req, res) => {
  try {
    const { userId, type, data } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ message: 'userId and type are required' });
    }

    const activity = await Activity.create({ userId, type, data: data || {} });
    res.status(201).json({ activity });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get the activity feed for the logged-in user
exports.getFeed = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    // Get all users this person follows
    const following = await Follow.find({ followerId: req.userId });
    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return res.json({ activities: [], total: 0, message: 'Follow readers to see their activity' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find({ userId: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ userId: { $in: followingIds } });

    res.json({ activities, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a specific user's public activity
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ activities, total: activities.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};