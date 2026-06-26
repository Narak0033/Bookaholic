const ReadingGoal = require('../models/readingGoal.model');
const Shelf = require('../models/shelf.model');

exports.setGoal = async (req, res) => {
  try {
    const { year, targetBooks } = req.body;

    if (!year || !targetBooks) {
      return res.status(400).json({ message: 'year and targetBooks are required' });
    }

    const goal = await ReadingGoal.findOneAndUpdate(
      { userId: req.userId, year },
      { targetBooks },
      { upsert: true, new: true }
    );

    res.json({ goal });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getGoalProgress = async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const goal = await ReadingGoal.findOne({ userId: req.userId, year });

    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31T23:59:59`);

    const booksFinished = await Shelf.countDocuments({
      userId: req.userId,
      status: 'finished',
      endDate: { $gte: startOfYear, $lte: endOfYear }
    });

    res.json({
      year,
      targetBooks: goal ? goal.targetBooks : null,
      booksFinished,
      percentage: goal
        ? Math.round((booksFinished / goal.targetBooks) * 100)
        : null,
      onTrack: goal ? booksFinished >= goal.targetBooks : null
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};