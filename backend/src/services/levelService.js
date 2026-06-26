const User = require('../models/User');
const { LEVELS, ACHIEVEMENTS } = require('../utils/constants');
const { calculateLevel, calculateLevelProgress } = require('../utils/helpers');
const RewardService = require('./rewardService');

class LevelService {
  async checkLevelUp(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const oldLevel = user.level;
    const newLevelInfo = calculateLevel(user.xp);

    if (newLevelInfo.level > oldLevel) {
      user.level = newLevelInfo.level;

      const levelData = LEVELS.find((l) => l.level === newLevelInfo.level);
      if (levelData && levelData.reward > 0) {
        await RewardService.addCoins(
          userId,
          levelData.reward,
          `Level up reward: reached ${newLevelInfo.name} (Level ${newLevelInfo.level})`,
          'bonus'
        );
      }

      await user.save();

      return {
        leveledUp: true,
        oldLevel,
        newLevel: newLevelInfo.level,
        newLevelName: newLevelInfo.name,
        reward: levelData ? levelData.reward : 0,
      };
    }

    return { leveledUp: false };
  }

  async getLevelProgress(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return calculateLevelProgress(user.xp);
  }

  async getLeaderboard(limit = 50) {
    return User.find({ isActive: true })
      .select('username level xp totalEarned profileImage')
      .sort({ xp: -1 })
      .limit(limit);
  }

  async getAchievements(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: user.achievements.some((ua) => ua.name === a.name),
      unlockedAt: user.achievements.find((ua) => ua.name === a.name)?.unlockedAt || null,
    }));
  }
}

module.exports = new LevelService();
