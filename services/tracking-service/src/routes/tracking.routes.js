const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const shelfController = require('../controllers/shelf.controller');
const logController = require('../controllers/readingLog.controller');
const goalController = require('../controllers/goal.controller');
const wrappedController = require('../controllers/wrapped.controller');

// All tracking routes require login
router.use(auth);

// Shelf
router.get('/shelf', shelfController.getShelf);
router.post('/shelf', shelfController.addToShelf);
router.patch('/shelf/:bookId', shelfController.updateShelfEntry);
router.delete('/shelf/:bookId', shelfController.removeFromShelf);

// Reading logs
router.get('/logs', logController.getLogs);
router.post('/logs', logController.addLog);

// Goals
router.post('/goals', goalController.setGoal);
router.get('/goals/:year', goalController.getGoalProgress);

// Wrapped
router.get('/wrapped/:year', wrappedController.getWrapped);

module.exports = router;