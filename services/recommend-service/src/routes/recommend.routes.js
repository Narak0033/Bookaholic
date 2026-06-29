const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const recommendController = require('../controllers/recommend.controller');

// All recommend routes require login
router.use(auth);

router.get('/', recommendController.getRecommendations);
router.get('/preferences', recommendController.getPreferences);
router.post('/similar', recommendController.getSimilarBooks);

module.exports = router;