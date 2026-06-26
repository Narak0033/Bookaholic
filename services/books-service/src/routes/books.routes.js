const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public — no login needed to search or view books
router.get('/search', booksController.searchBooks);
router.get('/google/:googleBooksId', booksController.getOrSaveGoogleBook);
router.get('/:id', booksController.getBookById);

// Protected — login required
router.post('/', authMiddleware, booksController.createManualBook);
router.patch('/:id/tropes', authMiddleware, booksController.updateTropes);

module.exports = router;