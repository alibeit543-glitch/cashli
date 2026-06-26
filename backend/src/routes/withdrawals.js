const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { protect } = require('../middleware/auth');

router.get('/methods', protect, withdrawalController.getWithdrawalMethods);
router.get('/', protect, withdrawalController.getUserWithdrawals);
router.post('/', protect, withdrawalController.requestWithdrawal);

module.exports = router;
