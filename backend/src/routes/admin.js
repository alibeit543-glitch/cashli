const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, try again after 15 minutes' },
});

// Admin login (no auth required, rate limited)
router.post('/login', loginLimiter, adminController.adminLogin);
router.post('/logout', adminController.adminLogout);
router.get('/me', protect, adminOnly, adminController.getMe);

router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/platform-stats', adminController.getPlatformStats);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.post('/users/:id/hold', adminController.holdUser);
router.post('/users/:id/trust-level', adminController.setTrustLevel);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.post('/users/:id/adjust-balance', adminController.adjustUserBalance);
router.put('/users/:id/adjust-xp', adminController.adjustUserXp);

// Offers
router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

// Withdrawals
router.get('/withdrawals', adminController.getWithdrawals);
router.get('/withdrawals/:id', adminController.getWithdrawalById);
router.put('/withdrawals/:id/process', adminController.processWithdrawal);
router.post('/withdrawals/:id/rescan', adminController.rescanWithdrawal);

// Transactions
router.get('/transactions', adminController.getTransactions);

// Completions
router.get('/completions', adminController.getCompletions);
router.put('/completions/:id/process', adminController.processCompletion);

// Fraud & Security
router.get('/fraud-alerts', adminController.getFraudAlerts);
router.put('/fraud-alerts/:id', adminController.updateFraudAlert);
router.get('/fraud-flags', adminController.getFraudFlags);
router.put('/fraud-flags/:id/resolve', adminController.resolveFraudFlag);
router.get('/flagged-users', adminController.getFlaggedUsers);
router.get('/security/overview', adminController.getSecurityOverview);
router.get('/security/ip-management', adminController.getIpManagement);
router.post('/block-ip', adminController.blockIp);
router.delete('/block-ip/:ip', adminController.unblockIp);
router.get('/audit-log', adminController.getAuditLog);

// Analytics
router.get('/analytics/user/:userId', adminController.getUserAnalytics);
router.get('/analytics', adminController.getAnalytics);
router.get('/live-feed', adminController.getLiveFeed);
router.get('/protection-fund', adminController.getProtectionFund);
router.get('/referral-monitor', adminController.getReferralMonitor);
router.get('/referral-monitor/:id', adminController.getReferralById);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
