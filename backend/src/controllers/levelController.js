const LevelService = require('../services/levelService');

exports.getLevelProgress = async (req, res) => {
  try {
    const progress = await LevelService.getLevelProgress(req.user._id);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await LevelService.getLeaderboard(
      parseInt(req.query.limit) || 50
    );

    const userRank = leaderboard.findIndex(
      (u) => u._id.toString() === req.user._id.toString()
    ) + 1;

    res.json({
      leaderboard,
      userRank: userRank || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAchievements = async (req, res) => {
  try {
    const achievements = await LevelService.getAchievements(req.user._id);
    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
