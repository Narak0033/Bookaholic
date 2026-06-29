const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const notifyController = require('../controllers/notify.controller');

// Internal — called by other services, no user auth
router.post('/', notifyController.createNotification);

// Protected — user-facing routes
router.get('/', auth, notifyController.getNotifications);
router.get('/unread-count', auth, notifyController.getUnreadCount);
router.patch('/read-all', auth, notifyController.markAllAsRead);
router.patch('/:id/read', auth, notifyController.markAsRead);
router.delete('/clear-all', auth, notifyController.clearAll);
router.delete('/:id', auth, notifyController.deleteNotification);

module.exports = router;