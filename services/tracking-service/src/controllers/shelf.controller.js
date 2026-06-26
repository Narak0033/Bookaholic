const Shelf = require('../models/shelf.model');

exports.addToShelf = async (req, res) => {
  try {
    const { bookId, bookSnapshot, status } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' });
    }

    const existing = await Shelf.findOne({ userId: req.userId, bookId });
    if (existing) {
      return res.status(409).json({ message: 'Book already on your shelf' });
    }

    const entry = await Shelf.create({
      userId: req.userId,
      bookId,
      bookSnapshot: bookSnapshot || {},
      status: status || 'want_to_read',
      startDate: status === 'reading' ? new Date() : null,
      endDate: status === 'finished' ? new Date() : null,
    });

    res.status(201).json({ entry });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateShelfEntry = async (req, res) => {
  try {
    const { status, currentPage } = req.body;

    const entry = await Shelf.findOne({
      userId: req.userId,
      bookId: req.params.bookId
    });

    if (!entry) {
      return res.status(404).json({ message: 'Book not found on your shelf' });
    }

    if (status) {
      // Auto-set dates based on status change
      if (status === 'reading' && entry.status === 'want_to_read') {
        entry.startDate = new Date();
      }
      if (status === 'finished') {
        entry.endDate = new Date();
        if (!entry.startDate) entry.startDate = new Date();
      }
      entry.status = status;
    }

    if (currentPage !== undefined) {
      entry.currentPage = currentPage;
    }

    await entry.save();
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getShelf = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.userId };
    if (status) filter.status = status;

    const shelf = await Shelf.find(filter).sort({ updatedAt: -1 });
    res.json({ shelf, total: shelf.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeFromShelf = async (req, res) => {
  try {
    const entry = await Shelf.findOneAndDelete({
      userId: req.userId,
      bookId: req.params.bookId
    });

    if (!entry) {
      return res.status(404).json({ message: 'Book not found on your shelf' });
    }

    res.json({ message: 'Book removed from shelf' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};