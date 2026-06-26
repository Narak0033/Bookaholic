const Review = require('../models/review.model');

exports.createReview = async (req, res) => {
  try {
    const { bookId, bookSnapshot, rating, content, containsSpoilers } = req.body;

    if (!bookId || !rating) {
      return res.status(400).json({ message: 'bookId and rating are required' });
    }

    const existing = await Review.findOne({ userId: req.userId, bookId });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this book' });
    }

    const review = await Review.create({
      userId: req.userId,
      bookId,
      bookSnapshot: bookSnapshot || {},
      rating,
      content: content || '',
      containsSpoilers: containsSpoilers || false,
    });

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { sort = 'recent', spoilers = 'true' } = req.query;

    const filter = { bookId };
    if (spoilers === 'false') filter.containsSpoilers = false;

    const sortOptions = {
      recent: { createdAt: -1 },
      top: { likes: -1, createdAt: -1 },
      rating_high: { rating: -1 },
      rating_low: { rating: 1 },
    };

    const reviews = await Review.find(filter)
      .sort(sortOptions[sort] || sortOptions.recent);

    // Average rating
    const avgRating = reviews.length
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

    // Rating breakdown
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { ratingBreakdown[r.rating]++; });

    res.json({ reviews, total: reviews.length, avgRating, ratingBreakdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({ reviews, total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, content, containsSpoilers } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (rating) review.rating = rating;
    if (content !== undefined) review.content = content;
    if (containsSpoilers !== undefined) review.containsSpoilers = containsSpoilers;

    await review.save();
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const alreadyLiked = review.likes.includes(req.userId);

    if (alreadyLiked) {
      review.likes = review.likes.filter(id => id !== req.userId);
    } else {
      review.likes.push(req.userId);
    }

    await review.save();
    res.json({
      liked: !alreadyLiked,
      totalLikes: review.likes.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};