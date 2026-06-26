const User = require('../models/User');
const Referral = require('../models/Referral');
const RewardService = require('./rewardService');

class ReferralService {
  async processReferral(referralCode, newUserId) {
    if (!referralCode) return;

    const referrer = await User.findOne({ referralCode });
    if (!referrer || referrer._id.toString() === newUserId) return;

    const newUser = await User.findById(newUserId);
    if (!newUser) return;

    newUser.referredBy = referrer._id;
    await newUser.save();

    await Referral.create({
      referrer: referrer._id,
      referred: newUser._id,
      status: 'pending',
    });
  }

  async creditReferralReward(referredUserId) {
    const referral = await Referral.findOne({ referred: referredUserId });
    if (!referral || referral.status === 'credited') return;

    const referredUser = await User.findById(referredUserId);
    if (!referredUser) return;

    const minEarning = 100;
    if (referredUser.totalEarned >= minEarning) {
      referral.status = 'credited';
      referral.creditedAt = new Date();
      await referral.save();

      const reward = 50;
      await RewardService.addCoins(
        referral.referrer,
        reward,
        `Referral reward for ${referredUser.username}`,
        'referral'
      );
    }
  }

  async getReferralStats(userId) {
    const total = await Referral.countDocuments({ referrer: userId });
    const credited = await Referral.countDocuments({ referrer: userId, status: 'credited' });
    const pending = await Referral.countDocuments({ referrer: userId, status: 'pending' });

    const referrals = await Referral.find({ referrer: userId })
      .populate('referred', 'username createdAt totalEarned level')
      .sort({ createdAt: -1 });

    return { total, credited, pending, referrals };
  }

  async getReferralLeaderboard(limit = 10) {
    return Referral.aggregate([
      { $match: { status: 'credited' } },
      { $group: { _id: '$referrer', count: { $sum: 1 }, totalReward: { $sum: '$reward' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          level: '$user.level',
          referrals: '$count',
          totalReward: 1,
        },
      },
    ]);
  }
}

module.exports = new ReferralService();
