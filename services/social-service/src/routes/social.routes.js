const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const followController = require('../controllers/follow.controller');
const bookClubController = require('../controllers/bookClub.controller');
const discussionController = require('../controllers/discussion.controller');
const activityController = require('../controllers/activity.controller');

// Follow
router.post('/follow/:userId', auth, followController.follow);
router.delete('/unfollow/:userId', auth, followController.unfollow);
router.get('/follow/check/:userId', auth, followController.checkFollowing);
router.get('/followers/:userId', followController.getFollowers);
router.get('/following/:userId', followController.getFollowing);

// Book clubs
router.get('/clubs', bookClubController.getClubs);
router.get('/clubs/mine', auth, bookClubController.getMyClubs);
router.post('/clubs', auth, bookClubController.createClub);
router.get('/clubs/:id', bookClubController.getClubById);
router.post('/clubs/:id/join', auth, bookClubController.joinClub);
router.delete('/clubs/:id/leave', auth, bookClubController.leaveClub);

// Discussions
router.get('/clubs/:clubId/discussions', discussionController.getDiscussions);
router.post('/clubs/:clubId/discussions', auth, discussionController.createDiscussion);
router.get('/discussions/:discussionId/messages', discussionController.getMessages);
router.post('/discussions/:discussionId/messages', auth, discussionController.addMessage);
router.post('/messages/:messageId/like', auth, discussionController.likeMessage);

// Activity feed
router.get('/feed', auth, activityController.getFeed);
router.post('/activity', activityController.createActivity);
router.get('/activity/:userId', activityController.getUserActivity);
router.put('/messages/:messageId', auth, discussionController.updateMessage);
router.delete('/messages/:messageId', auth, discussionController.deleteMessage);

module.exports = router;