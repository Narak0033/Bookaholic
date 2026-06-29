const Discussion = require('../models/discussion.model');
const Message = require('../models/message.model');
const BookClub = require('../models/bookClub.model');

exports.createDiscussion = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { title, bookId, bookSnapshot } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const club = await BookClub.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (!club.members.includes(req.userId)) {
      return res.status(403).json({ message: 'You must be a member to post' });
    }

    const discussion = await Discussion.create({
      bookClubId: clubId,
      bookId: bookId || null,
      bookSnapshot: bookSnapshot || {},
      title,
      createdBy: req.userId,
    });

    res.status(201).json({ discussion });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDiscussions = async (req, res) => {
  try {
    const { clubId } = req.params;
    const discussions = await Discussion.find({ bookClubId: clubId })
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ discussions, total: discussions.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const message = await Message.create({
      discussionId,
      userId: req.userId,
      content,
    });

    discussion.messageCount += 1;
    await discussion.save();

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const messages = await Message.find({ discussionId })
      .sort({ createdAt: 1 });
    res.json({ messages, total: messages.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.likeMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const alreadyLiked = message.likes.includes(req.userId);
    if (alreadyLiked) {
      message.likes = message.likes.filter(id => id !== req.userId);
    } else {
      message.likes.push(req.userId);
    }

    await message.save();
    res.json({ liked: !alreadyLiked, totalLikes: message.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};