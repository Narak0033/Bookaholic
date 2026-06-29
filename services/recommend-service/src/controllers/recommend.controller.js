const axios = require('axios');
const UserPreference = require('../models/userPreference.model');
const trackingClient = require('../services/trackingClient');
const booksClient = require('../services/booksClient');

// Step 1: Build a preference profile from the user's finished books
const buildProfile = (finishedBooks) => {
  const genreScores = {};
  const tropeScores = {};
  const authorScores = {};
  const readBookIds = new Set();

  finishedBooks.forEach(entry => {
    readBookIds.add(entry.bookId);
    const snap = entry.bookSnapshot || {};

    (snap.genres || []).forEach(g => {
      genreScores[g] = (genreScores[g] || 0) + 1;
    });

    (snap.tropes || []).forEach(t => {
      tropeScores[t] = (tropeScores[t] || 0) + 1;
    });

    (snap.authors || []).forEach(a => {
      authorScores[a] = (authorScores[a] || 0) + 1;
    });
  });

  return { genreScores, tropeScores, authorScores, readBookIds };
};

// Step 2: Score a single candidate book against the user's profile
const scoreBook = (book, genreScores, tropeScores, authorScores) => {
  let score = 0;
  const reasons = [];

  const genres = book.genres || [];
  const tropes = book.tropes || [];
  const authors = book.authors || [];

  // Genres — base signal
  genres.forEach(g => {
    if (genreScores[g]) {
      score += genreScores[g];
      if (!reasons.some(r => r.includes(g))) {
        reasons.push(`Matches your love of ${g}`);
      }
    }
  });

  // Tropes — weighted 2x because trope matching is stronger intent signal
  tropes.forEach(t => {
    if (tropeScores[t]) {
      score += tropeScores[t] * 2;
      if (!reasons.some(r => r.includes(t))) {
        reasons.push(`Features ${t}, a trope you enjoy`);
      }
    }
  });

  // Authors — weighted 3x because reading the same author is the strongest signal
  authors.forEach(a => {
    if (authorScores[a]) {
      score += authorScores[a] * 3;
      reasons.push(`More from ${a}, an author you have already read`);
    }
  });

  return { score, reasons: reasons.slice(0, 3) };
};

// Get top N keys from a score object
const topKeys = (scoreObj, n = 3) => {
  return Object.entries(scoreObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
};

exports.getRecommendations = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Fetch user's reading history from Tracking service
    const finishedBooks = await trackingClient.getFinishedShelf(authHeader);

    // New user — no reading history yet
    if (finishedBooks.length === 0) {
      const popular = await booksClient.searchByQuery('bestselling romance novels', 10);
      return res.json({
        recommendations: popular.map(book => ({
          book,
          score: 0,
          reasons: ['Popular with readers like you'],
        })),
        message: 'Start reading to get personalised picks',
        basedOn: 0,
      });
    }

    // Build preference profile
    const { genreScores, tropeScores, authorScores, readBookIds } = buildProfile(finishedBooks);

    // Save preferences
    await UserPreference.findOneAndUpdate(
      { userId: req.userId },
      {
        genreScores: Object.fromEntries(Object.entries(genreScores)),
        tropeScores: Object.fromEntries(Object.entries(tropeScores)),
        authorScores: Object.fromEntries(Object.entries(authorScores)),
        readBookIds: [...readBookIds],
        totalBooksRead: finishedBooks.length,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    // Build search queries from top genres and authors
    const topGenres = topKeys(genreScores, 3);
    const topAuthors = topKeys(authorScores, 2);

    const queries = [
      ...topGenres,
      ...topAuthors.map(a => `books like ${a}`),
    ];

    if (queries.length === 0) queries.push('romance novels');

    // Search Books service for candidates
    const searchResults = await Promise.all(
      queries.map(q => booksClient.searchByQuery(q, 15).catch(() => []))
    );

    // Flatten, deduplicate by _id
    const seen = new Set();
    const candidates = searchResults
      .flat()
      .filter(book => {
        const id = book._id?.toString();
        if (!id || seen.has(id)) return false;
        if (readBookIds.has(id)) return false;
        seen.add(id);
        return true;
      });

    // Score all candidates
    const scored = candidates.map(book => {
      const { score, reasons } = scoreBook(book, genreScores, tropeScores, authorScores);
      return { book, score, reasons };
    });

    // Sort by score and take top 20
    const recommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({
      recommendations,
      basedOn: finishedBooks.length,
      topGenres,
      topTropes: topKeys(tropeScores, 3),
      topAuthors: topKeys(authorScores, 3),
    });
  } catch (err) {
    // If Tracking service is down, return graceful fallback
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'Tracking service unavailable',
        error: err.message
      });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const prefs = await UserPreference.findOne({ userId: req.userId });

    if (!prefs) {
      return res.json({
        message: 'No preferences yet — start reading to build your profile',
        totalBooksRead: 0
      });
    }

    res.json({
      totalBooksRead: prefs.totalBooksRead,
      topGenres: topKeys(Object.fromEntries(prefs.genreScores), 5),
      topTropes: topKeys(Object.fromEntries(prefs.tropeScores), 5),
      topAuthors: topKeys(Object.fromEntries(prefs.authorScores), 5),
      lastUpdated: prefs.lastUpdated,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// "Because you read X" — recommendations similar to a specific book
exports.getSimilarBooks = async (req, res) => {
  try {
    const { title, authors = [], genres = [], tropes = [] } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    // Build a mini preference profile just for this book
    const genreScores = {};
    const tropeScores = {};
    const authorScores = {};

    genres.forEach(g => { genreScores[g] = 2; });
    tropes.forEach(t => { tropeScores[t] = 2; });
    authors.forEach(a => { authorScores[a] = 2; });

    const queries = [
      ...genres.slice(0, 2),
      ...authors.map(a => `books like ${a}`),
      `similar to ${title}`,
    ];

    const searchResults = await Promise.all(
      queries.map(q => booksClient.searchByQuery(q, 10).catch(() => []))
    );

    const seen = new Set();
    const candidates = searchResults.flat().filter(book => {
      const id = book._id?.toString();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const scored = candidates
      .map(book => {
        const { score, reasons } = scoreBook(book, genreScores, tropeScores, authorScores);
        return { book, score, reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({
      basedOn: title,
      recommendations: scored
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};