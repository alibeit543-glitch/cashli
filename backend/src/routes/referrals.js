const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { protect } = require('../middleware/auth');

router.get('/', protect, referralController.getReferralStats);
router.get('/leaderboard', protect, referralController.getReferralLeaderboard);

module.exports = router;
