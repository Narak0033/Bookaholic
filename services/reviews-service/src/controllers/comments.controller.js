const Comment = require('../models/comment.model');
const Review = require('../models/review.model');

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const comment = await Comment.create({
      reviewId: req.params.reviewId,
      userId: req.userId,
      content,
    });

    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ reviewId: req.params.reviewId })
      .sort({ createdAt: 1 });
    res.json({ comments, total: comments.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      userId: req.userId
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};