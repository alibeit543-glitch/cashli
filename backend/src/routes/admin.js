const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/platform-stats', adminController.getPlatformStats);

router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.post('/users/:id/adjust-balance', adminController.adjustUserBalance);

router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);

router.get('/withdrawals', adminController.getWithdrawals);
router.put('/withdrawals/:id/process', adminController.processWithdrawal);

router.get('/completions', adminController.getCompletions);
router.put('/completions/:id/process', adminController.processCompletion);

router.get('/fraud-alerts', adminController.getFraudAlerts);
router.put('/fraud-alerts/:id', adminController.updateFraudAlert);
router.get('/flagged-users', adminController.getFlaggedUsers);
router.get('/analytics/user/:userId', adminController.getUserAnalytics);
router.get('/analytics', adminController.getAnalytics);
router.get('/live-feed', adminController.getLiveFeed);
router.get('/protection-fund', adminController.getProtectionFund);
router.get('/referral-monitor', adminController.getReferralMonitor);
router.get('/referral-monitor/:id', adminController.getReferralById);
router.put('/users/:id/adjust-xp', adminController.adjustUserXp);

module.exports = router;
