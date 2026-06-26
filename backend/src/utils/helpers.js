const { nanoid } = require('nanoid');
const { LEVELS } = require('./constants');

const generateReferralCode = () => nanoid(8).toUpperCase();

const calculateLevel = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return { level: LEVELS[i].level, name: LEVELS[i].name };
    }
  }
  return { level: 1, name: 'Bronze' };
};

const calculateLevelProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  const levelData = LEVELS.find((l) => l.level === currentLevel.level);
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  if (!nextLevel) return { current: currentLevel, progress: 100, xpToNext: 0 };

  const xpInCurrentLevel = xp - levelData.minXp;
  const xpForNextLevel = nextLevel.minXp - levelData.minXp;
  const progress = Math.min(100, Math.floor((xpInCurrentLevel / xpForNextLevel) * 100));

  return {
    current: currentLevel,
    next: { level: nextLevel.level, name: nextLevel.name },
    progress,
    xpToNext: nextLevel.minXp - xp,
  };
};

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    balance: user.balance,
    totalEarned: user.totalEarned,
    level: user.level,
    xp: user.xp,
    referralCode: user.referralCode,
    role: user.role,
    dailyStreak: user.dailyStreak,
    verified: user.verified,
    achievements: user.achievements,
    createdAt: user.createdAt,
  };
};

const generateTransactionId = () => `TXN-${nanoid(12).toUpperCase()}`;

module.exports = {
  generateReferralCode,
  calculateLevel,
  calculateLevelProgress,
  sanitizeUser,
  generateTransactionId,
};
