const OFFER_CATEGORIES = ['survey', 'offer', 'video', 'app-download', 'signup', 'purchase'];
const OFFER_STATUS = ['active', 'inactive', 'expired'];
const COMPLETION_STATUS = ['pending', 'approved', 'rejected'];
const TRANSACTION_TYPES = ['earning', 'withdrawal', 'bonus', 'referral', 'purchase'];
const TRANSACTION_STATUS = ['completed', 'pending', 'failed'];
const WITHDRAWAL_METHODS = ['paypal', 'crypto', 'giftcard'];
const WITHDRAWAL_STATUS = ['pending', 'approved', 'processing', 'completed', 'rejected'];
const USER_ROLES = ['user', 'admin'];
const BONUS_TYPES = ['daily', 'streak', 'welcome', 'achievement', 'level-up'];
const DEVICE_TYPES = ['all', 'ios', 'android'];

const LEVELS = [
  { level: 1, name: 'Bronze', minXp: 0, maxXp: 499, reward: 0 },
  { level: 2, name: 'Silver', minXp: 500, maxXp: 1499, reward: 10 },
  { level: 3, name: 'Gold', minXp: 1500, maxXp: 3999, reward: 25 },
  { level: 4, name: 'Platinum', minXp: 4000, maxXp: 9999, reward: 50 },
  { level: 5, name: 'Diamond', minXp: 10000, maxXp: 24999, reward: 100 },
  { level: 6, name: 'Elite', minXp: 25000, maxXp: 49999, reward: 200 },
  { level: 7, name: 'Legend', minXp: 50000, maxXp: 99999, reward: 500 },
  { level: 8, name: 'Mythic', minXp: 100000, maxXp: Infinity, reward: 1000 },
];

const ACHIEVEMENTS = [
  {
    name: 'First Steps',
    description: 'Complete your first offer',
    icon: '🚀',
    category: 'offers',
    requirement: { type: 'offers_completed', count: 1 },
    reward: { coins: 5, xp: 50 },
  },
  {
    name: 'Offer Machine',
    description: 'Complete 10 offers',
    icon: '⚡',
    category: 'offers',
    requirement: { type: 'offers_completed', count: 10 },
    reward: { coins: 25, xp: 200 },
  },
  {
    name: 'Offer King',
    description: 'Complete 50 offers',
    icon: '👑',
    category: 'offers',
    requirement: { type: 'offers_completed', count: 50 },
    reward: { coins: 100, xp: 500 },
  },
  {
    name: 'Social Butterfly',
    description: 'Refer your first friend',
    icon: '🦋',
    category: 'referrals',
    requirement: { type: 'referrals', count: 1 },
    reward: { coins: 20, xp: 100 },
  },
  {
    name: 'Networker',
    description: 'Refer 5 friends',
    icon: '🌐',
    category: 'referrals',
    requirement: { type: 'referrals', count: 5 },
    reward: { coins: 50, xp: 300 },
  },
  {
    name: 'Dedicated',
    description: 'Claim 7 daily bonuses',
    icon: '🔥',
    category: 'bonuses',
    requirement: { type: 'daily_bonuses', count: 7 },
    reward: { coins: 30, xp: 150 },
  },
  {
    name: 'Loyal',
    description: 'Claim 30 daily bonuses',
    icon: '💎',
    category: 'bonuses',
    requirement: { type: 'daily_bonuses', count: 30 },
    reward: { coins: 100, xp: 500 },
  },
  {
    name: 'Big Earner',
    description: 'Earn 1000 coins total',
    icon: '💰',
    category: 'earnings',
    requirement: { type: 'total_earned', count: 1000 },
    reward: { coins: 50, xp: 300 },
  },
  {
    name: 'Cash Cow',
    description: 'Earn 10000 coins total',
    icon: '🐄',
    category: 'earnings',
    requirement: { type: 'total_earned', count: 10000 },
    reward: { coins: 200, xp: 1000 },
  },
  {
    name: 'First Payout',
    description: 'Make your first withdrawal',
    icon: '💸',
    category: 'withdrawals',
    requirement: { type: 'withdrawals', count: 1 },
    reward: { coins: 10, xp: 100 },
  },
];

const MIN_WITHDRAWAL = {
  paypal: 500,
  crypto: 1000,
  giftcard: 200,
};

module.exports = {
  OFFER_CATEGORIES,
  OFFER_STATUS,
  COMPLETION_STATUS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  WITHDRAWAL_METHODS,
  WITHDRAWAL_STATUS,
  USER_ROLES,
  BONUS_TYPES,
  DEVICE_TYPES,
  LEVELS,
  ACHIEVEMENTS,
  MIN_WITHDRAWAL,
};
