const Book = require('../models/book.model');
const googleBooksService = require('../services/googleBooks.service');

// Search Google Books API and cache results in our DB
exports.searchBooks = async (req, res) => {
  try {
    const { q, maxResults = 10, startIndex = 0 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query q is required' });
    }

    const { totalItems, books } = await googleBooksService.searchBooks(
      q,
      parseInt(maxResults),
      parseInt(startIndex)
    );

    // Cache each book in our DB — only insert if it doesn't exist yet
    const saved = await Promise.all(
      books.map(book =>
        Book.findOneAndUpdate(
          { googleBooksId: book.googleBooksId },
          { $setOnInsert: book },
          { upsert: true, new: true }
        )
      )
    );

    res.json({ totalItems, books: saved });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a book from our DB by MongoDB ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ book });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Fetch one specific book from Google Books and save it
exports.getOrSaveGoogleBook = async (req, res) => {
  try {
    const { googleBooksId } = req.params;

    let book = await Book.findOne({ googleBooksId });

    if (!book) {
      const bookData = await googleBooksService.getBookById(googleBooksId);
      book = await Book.create(bookData);
    }

    res.json({ book });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'Book not found on Google Books' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Manual entry — for books not found on Google Books
exports.createManualBook = async (req, res) => {
  try {
    const {
      title, authors, description, coverImage,
      genres, tropes, pageCount, publishedDate, publisher, isbn
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const book = await Book.create({
      title,
      authors: authors || [],
      description: description || '',
      coverImage: coverImage || '',
      genres: genres || [],
      tropes: tropes || [],
      pageCount: pageCount || 0,
      publishedDate: publishedDate || '',
      publisher: publisher || '',
      isbn: isbn || '',
      isManualEntry: true,
      addedBy: req.userId,
    });

    res.status(201).json({ book });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add tropes to any book — key feature for romance readers
exports.updateTropes = async (req, res) => {
  try {
    const { tropes } = req.body;

    if (!Array.isArray(tropes)) {
      return res.status(400).json({ message: 'Tropes must be an array' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { tropes },
      { new: true }
    );

    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ book });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};