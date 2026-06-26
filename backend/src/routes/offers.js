const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, offerController.getOffers);
router.get('/completions', protect, offerController.getUserCompletions);
router.get('/:id', optionalAuth, offerController.getOfferById);
router.post('/:id/start', protect, offerController.startOffer);
router.put('/:completionId/proof', protect, offerController.submitProof);

module.exports = router;
