const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.post('/session/start', analyticsController.startSession);
router.post('/session/end', analyticsController.endSession);
router.post('/task/step', analyticsController.trackStep);
router.post('/pageview', analyticsController.trackPageView);
router.post('/task/complete', analyticsController.trackComplete);

module.exports = router;
