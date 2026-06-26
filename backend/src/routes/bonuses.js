const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonusController');
const { protect } = require('../middleware/auth');

router.get('/check', protect, bonusController.checkDailyBonus);
router.post('/daily', protect, bonusController.claimDailyBonus);
router.get('/history', protect, bonusController.getBonusHistory);

module.exports = router;
