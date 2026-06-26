const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');
const { protect } = require('../middleware/auth');

router.get('/progress', protect, levelController.getLevelProgress);
router.get('/leaderboard', protect, levelController.getLeaderboard);
router.get('/achievements', protect, levelController.getAchievements);

module.exports = router;
