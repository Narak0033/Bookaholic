const Follow = require('../models/follow.model');
const axios = require('axios');
const NOTIFY_URL = process.env.NOTIFY_SERVICE_URL || 'http://localhost:5007';

exports.follow = async (req, res) => {
  try {
    const { userId: targetId } = req.params;

    if (targetId === req.userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const existing = await Follow.findOne({
      followerId: req.userId,
      followingId: targetId
    });

    if (existing) {
      return res.status(409).json({ message: 'Already following this user' });
    }

    await Follow.create({ followerId: req.userId, followingId: targetId });

    // Fire and forget — don't block the response if notify is slow
    axios.post(`${NOTIFY_URL}/notify`, {
      userId: targetId,
      type: 'new_follower',
      data: { followerId: req.userId }
    }).catch((err) => console.error('Failed to send follow notification', err.message));

    res.status(201).json({ message: 'Now following user' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const { userId: targetId } = req.params;

    const result = await Follow.findOneAndDelete({
      followerId: req.userId,
      followingId: targetId
    });

    if (!result) {
      return res.status(404).json({ message: 'You are not following this user' });
    }

    res.json({ message: 'Unfollowed user' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await Follow.find({ followingId: userId });
    res.json({
      followers: followers.map(f => f.followerId),
      total: followers.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await Follow.find({ followerId: userId });
    res.json({
      following: following.map(f => f.followingId),
      total: following.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.checkFollowing = async (req, res) => {
  try {
    const { userId: targetId } = req.params;
    const exists = await Follow.findOne({
      followerId: req.userId,
      followingId: targetId
    });
    res.json({ isFollowing: !!exists });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};