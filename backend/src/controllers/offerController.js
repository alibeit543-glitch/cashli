const Offer = require('../models/Offer');
const OfferCompletion = require('../models/OfferCompletion');
const RewardService = require('../services/rewardService');
const ReferralService = require('../services/referralService');

exports.getOffers = async (req, res) => {
  try {
    const { category, device, sort, page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };

    if (category) query.category = category;
    if (device && device !== 'all') {
      query.device = { $in: ['all', device] };
    }

    let sortOption = { isFeatured: -1, createdAt: -1 };
    if (sort === 'reward') sortOption = { reward: -1 };
    if (sort === 'popular') sortOption = { completedSlots: -1 };

    const total = await Offer.countDocuments(query);
    const offers = await Offer.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    let completion = null;
    if (req.user) {
      completion = await OfferCompletion.findOne({
        user: req.user._id,
        offer: offer._id,
      });
    }

    res.json({ offer, completion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.status !== 'active') {
      return res.status(400).json({ message: 'Offer is not active' });
    }

    if (offer.completedSlots >= offer.totalSlots) {
      return res.status(400).json({ message: 'Offer has reached maximum completions' });
    }

    const existing = await OfferCompletion.findOne({
      user: req.user._id,
      offer: offer._id,
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already started this offer' });
    }

    const completion = await OfferCompletion.create({
      user: req.user._id,
      offer: offer._id,
      reward: offer.reward,
      xpReward: offer.xpReward,
      status: 'pending',
    });

    res.status(201).json({ completion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitProof = async (req, res) => {
  try {
    const { proof } = req.body;

    const completion = await OfferCompletion.findOneAndUpdate(
      {
        _id: req.params.completionId,
        user: req.user._id,
      },
      { proof, status: 'pending' },
      { new: true }
    );

    if (!completion) {
      return res.status(404).json({ message: 'Completion not found' });
    }

    res.json({ completion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserCompletions = async (req, res) => {
  try {
    const completions = await OfferCompletion.find({ user: req.user._id })
      .populate('offer', 'title category reward image')
      .sort({ createdAt: -1 });

    res.json({ completions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
