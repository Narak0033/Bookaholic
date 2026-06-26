const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const reviewsController = require('../controllers/reviews.controller');
const commentsController = require('../controllers/comments.controller');

// Public
router.get('/book/:bookId', reviewsController.getBookReviews);
router.get('/user/:userId', reviewsController.getUserReviews);
router.get('/:reviewId/comments', commentsController.getComments);

// Protected
router.post('/', auth, reviewsController.createReview);
router.put('/:id', auth, reviewsController.updateReview);
router.delete('/:id', auth, reviewsController.deleteReview);
router.post('/:id/like', auth, reviewsController.likeReview);
router.post('/:reviewId/comments', auth, commentsController.addComment);
router.delete('/:reviewId/comments/:commentId', auth, commentsController.deleteComment);

module.exports = router;