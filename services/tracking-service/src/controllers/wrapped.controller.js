const Shelf = require('../models/shelf.model');
const ReadingLog = require('../models/readingLog.model');
const ReadingGoal = require('../models/readingGoal.model');

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

exports.getWrapped = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31T23:59:59`);

    // All books finished this year
    const finishedBooks = await Shelf.find({
      userId: req.userId,
      status: 'finished',
      endDate: { $gte: startOfYear, $lte: endOfYear }
    }).sort({ endDate: 1 });

    // Reading logs this year — total pages and hours
    const logStats = await ReadingLog.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: null,
          totalPages: { $sum: '$pagesRead' },
          totalHours: { $sum: '$hoursSpent' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);

    const stats = logStats[0] || {
      totalPages: 0,
      totalHours: 0,
      totalSessions: 0
    };

    // Books per month
    const monthCounts = Array(12).fill(0);
    finishedBooks.forEach(book => {
      const month = new Date(book.endDate).getMonth();
      monthCounts[month]++;
    });

    const booksPerMonth = MONTHS.map((month, i) => ({
      month,
      count: monthCounts[i]
    }));

    // Top genres
    const genreCount = {};
    finishedBooks.forEach(book => {
      (book.bookSnapshot.genres || []).forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Top authors
    const authorCount = {};
    finishedBooks.forEach(book => {
      (book.bookSnapshot.authors || []).forEach(author => {
        authorCount[author] = (authorCount[author] || 0) + 1;
      });
    });
    const topAuthors = Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([author, count]) => ({ author, count }));

    // Top tropes
    const tropeCount = {};
    finishedBooks.forEach(book => {
      (book.bookSnapshot.tropes || []).forEach(trope => {
        tropeCount[trope] = (tropeCount[trope] || 0) + 1;
      });
    });
    const topTropes = Object.entries(tropeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trope, count]) => ({ trope, count }));

    // Longest and shortest book
    const booksWithPages = finishedBooks.filter(
      b => b.bookSnapshot.pageCount > 0
    );
    const longestBook = booksWithPages.length
      ? booksWithPages.reduce((a, b) =>
          a.bookSnapshot.pageCount > b.bookSnapshot.pageCount ? a : b
        )
      : null;
    const shortestBook = booksWithPages.length
      ? booksWithPages.reduce((a, b) =>
          a.bookSnapshot.pageCount < b.bookSnapshot.pageCount ? a : b
        )
      : null;

    // Best reading month
    const bestMonthIndex = monthCounts.indexOf(Math.max(...monthCounts));
    const bestMonth = monthCounts[bestMonthIndex] > 0
      ? { month: MONTHS[bestMonthIndex], count: monthCounts[bestMonthIndex] }
      : null;

    // Reading goal
    const goal = await ReadingGoal.findOne({ userId: req.userId, year });

    res.json({
      year,
      summary: {
        totalBooksRead: finishedBooks.length,
        totalPagesRead: stats.totalPages,
        totalHoursSpent: Math.round(stats.totalHours * 10) / 10,
        totalReadingSessions: stats.totalSessions,
        averagePagesPerSession: stats.totalSessions > 0
          ? Math.round(stats.totalPages / stats.totalSessions)
          : 0,
      },
      goal: goal ? {
        target: goal.targetBooks,
        achieved: finishedBooks.length,
        percentage: Math.round((finishedBooks.length / goal.targetBooks) * 100),
        completed: finishedBooks.length >= goal.targetBooks
      } : null,
      booksPerMonth,
      bestMonth,
      topGenres,
      topAuthors,
      topTropes,
      longestBook: longestBook ? {
        title: longestBook.bookSnapshot.title,
        pageCount: longestBook.bookSnapshot.pageCount,
        authors: longestBook.bookSnapshot.authors,
      } : null,
      shortestBook: shortestBook ? {
        title: shortestBook.bookSnapshot.title,
        pageCount: shortestBook.bookSnapshot.pageCount,
        authors: shortestBook.bookSnapshot.authors,
      } : null,
      finishedBooks: finishedBooks.map(b => ({
        bookId: b.bookId,
        title: b.bookSnapshot.title,
        authors: b.bookSnapshot.authors,
        coverImage: b.bookSnapshot.coverImage,
        pageCount: b.bookSnapshot.pageCount,
        finishedOn: b.endDate,
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};