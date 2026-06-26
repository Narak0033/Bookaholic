const ReadingLog = require('../models/readingLog.model');
const Shelf = require('../models/shelf.model');

exports.addLog = async (req, res) => {
  try {
    const { bookId, pagesRead, hoursSpent, notes, date } = req.body;

    if (!bookId || !pagesRead) {
      return res.status(400).json({ message: 'bookId and pagesRead are required' });
    }

    const log = await ReadingLog.create({
      userId: req.userId,
      bookId,
      pagesRead,
      hoursSpent: hoursSpent || 0,
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
    });

    // Auto-update currentPage on the shelf entry
    const shelf = await Shelf.findOne({ userId: req.userId, bookId });
    if (shelf) {
      shelf.currentPage = (shelf.currentPage || 0) + pagesRead;
      if (shelf.status === 'want_to_read') {
        shelf.status = 'reading';
        shelf.startDate = new Date();
      }
      await shelf.save();
    }

    res.status(201).json({ log });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { bookId } = req.query;
    const filter = { userId: req.userId };
    if (bookId) filter.bookId = bookId;

    const logs = await ReadingLog.find(filter).sort({ date: -1 });

    // Summary stats
    const totalPages = logs.reduce((sum, l) => sum + l.pagesRead, 0);
    const totalHours = logs.reduce((sum, l) => sum + l.hoursSpent, 0);

    res.json({ logs, totalPages, totalHours });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};