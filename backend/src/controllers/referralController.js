const ReferralService = require('../services/referralService');

exports.getReferralStats = async (req, res) => {
  try {
    const stats = await ReferralService.getReferralStats(req.user._id);

    res.json({
      ...stats,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${req.user.referralCode}`,
      referralCode: req.user.referralCode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReferralLeaderboard = async (req, res) => {
  try {
    const leaderboard = await ReferralService.getReferralLeaderboard(
      parseInt(req.query.limit) || 10
    );
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
