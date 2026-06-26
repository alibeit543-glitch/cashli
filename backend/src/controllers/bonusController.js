const Bonus = require('../models/Bonus');
const RewardService = require('../services/rewardService');

exports.claimDailyBonus = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastBonus = await Bonus.findOne({
      user: user._id,
      type: 'daily',
    }).sort({ claimedAt: -1 });

    let streak = 1;
    if (lastBonus) {
      const lastDate = new Date(lastBonus.claimedAt);
      const lastBonusDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const diffDays = Math.floor((today - lastBonusDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return res.status(400).json({ message: 'Daily bonus already claimed today' });
      }

      if (diffDays === 1) {
        streak = user.dailyStreak + 1;
      }
    }

    const baseReward = 10;
    const streakBonus = Math.min(streak - 1, 30) * 2;
    const totalCoins = baseReward + streakBonus;
    const totalXp = 5 + streak;

    await Bonus.create({
      user: user._id,
      type: 'daily',
      reward: { coins: totalCoins, xp: totalXp },
      streak,
    });

    await RewardService.addCoins(
      user._id,
      totalCoins,
      `Daily bonus (day ${streak}): ${totalCoins} coins`,
      'bonus'
    );
    await RewardService.addXp(user._id, totalXp);

    user.dailyStreak = streak;
    user.lastDailyBonus = now;
    await user.save();

    if (streak % 7 === 0) {
      const streakReward = streak * 5;
      await Bonus.create({
        user: user._id,
        type: 'streak',
        reward: { coins: streakReward, xp: totalXp * 2 },
        streak,
      });
      await RewardService.addCoins(
        user._id,
        streakReward,
        `Streak bonus: ${streak} day streak!`,
        'bonus'
      );
      await RewardService.addXp(user._id, totalXp * 2);
    }

    await RewardService.checkAndAwardAchievements(user._id);

    res.json({
      streak,
      reward: { coins: totalCoins, xp: totalXp },
      message: `Daily bonus claimed! +${totalCoins} coins, +${totalXp} XP`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBonusHistory = async (req, res) => {
  try {
    const bonuses = await Bonus.find({ user: req.user._id })
      .sort({ claimedAt: -1 })
      .limit(30);

    res.json({ bonuses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkDailyBonus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const claimedToday = await Bonus.findOne({
      user: req.user._id,
      type: 'daily',
      claimedAt: { $gte: today },
    });

    res.json({
      canClaim: !claimedToday,
      streak: req.user.dailyStreak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
