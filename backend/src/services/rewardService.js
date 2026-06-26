const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { generateTransactionId } = require('../utils/helpers');

class RewardService {
  async addCoins(userId, amount, description, type = 'earning', reference = null) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.balance;
    user.balance += amount;
    user.totalEarned += amount;
    await user.save();

    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      description,
      reference,
      status: 'completed',
      balanceBefore,
      balanceAfter: user.balance,
    });

    return { user, transaction };
  }

  async deductCoins(userId, amount, description, type = 'withdrawal', reference = null) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.balance < amount) throw new Error('Insufficient balance');

    const balanceBefore = user.balance;
    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      user: userId,
      type,
      amount: -amount,
      description,
      reference,
      status: 'completed',
      balanceBefore,
      balanceAfter: user.balance,
    });

    return { user, transaction };
  }

  async addXp(userId, xpAmount) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.xp += xpAmount;

    const oldLevel = user.level;
    const { calculateLevel } = require('../utils/helpers');
    const newLevelInfo = calculateLevel(user.xp);
    user.level = newLevelInfo.level;

    await user.save();

    return {
      leveledUp: oldLevel !== user.level,
      oldLevel,
      newLevel: user.level,
      xpGained: xpAmount,
      totalXp: user.xp,
    };
  }

  async checkAndAwardAchievements(userId) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    const { ACHIEVEMENTS } = require('../utils/constants');

    const offerCompletions = await require('../models/OfferCompletion').countDocuments({
      user: userId,
      status: 'approved',
    });

    const referralCount = await require('../models/Referral').countDocuments({
      referrer: userId,
    });

    const dailyBonuses = await require('../models/Bonus').countDocuments({
      user: userId,
      type: 'daily',
    });

    const withdrawalCount = await require('../models/Withdrawal').countDocuments({
      user: userId,
      status: 'completed',
    });

    const newAchievements = [];

    for (const achievement of ACHIEVEMENTS) {
      const alreadyHas = user.achievements.some((a) => a.name === achievement.name);
      if (alreadyHas) continue;

      let earned = false;
      const req = achievement.requirement;

      switch (req.type) {
        case 'offers_completed':
          earned = offerCompletions >= req.count;
          break;
        case 'referrals':
          earned = referralCount >= req.count;
          break;
        case 'daily_bonuses':
          earned = dailyBonuses >= req.count;
          break;
        case 'total_earned':
          earned = user.totalEarned >= req.count;
          break;
        case 'withdrawals':
          earned = withdrawalCount >= req.count;
          break;
      }

      if (earned) {
        user.achievements.push({ name: achievement.name, unlockedAt: new Date() });
        newAchievements.push(achievement);

        if (achievement.reward.coins > 0) {
          await this.addCoins(
            userId,
            achievement.reward.coins,
            `Achievement unlocked: ${achievement.name}`,
            'bonus'
          );
        }
        if (achievement.reward.xp > 0) {
          await this.addXp(userId, achievement.reward.xp);
        }
      }
    }

    if (newAchievements.length > 0) {
      await user.save();
    }

    return newAchievements;
  }
}

module.exports = new RewardService();
