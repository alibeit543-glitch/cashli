const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const now = new Date().toISOString();

const sampleUser = {
  _id: 'user_demo_001', username: 'DemoUser', email: 'demo@cashli.com',
  balance: 1250, totalEarned: 3200, totalWithdrawn: 500,
  xp: 850, level: 3, referralCode: 'DEMO123',
  role: 'user', dailyStreak: 5, verified: true,
  achievements: [
    { name: 'First Steps', unlockedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { name: 'Social Butterfly', unlockedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  ],
  createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
};

const sampleOffers = [
  { _id: 'offer_001', title: 'Complete a 5-min Survey', description: 'Share your opinions and earn rewards instantly! Takes only 5 minutes of your time.', shortDescription: 'Quick survey, big rewards', category: 'survey', reward: 50, xpReward: 25, requirements: 'Must be 18+', instructions: 'Click start, answer all questions truthfully.', url: '#', totalSlots: 500, completedSlots: 234, device: 'all', isFeatured: true, status: 'active', createdAt: now },
  { _id: 'offer_002', title: 'Download & Install App', description: 'Try out this amazing app! Download, install, and open it to earn coins.', shortDescription: 'Easy app install reward', category: 'app-download', reward: 200, xpReward: 50, requirements: 'Android or iOS device', instructions: 'Download, install, open & sign up.', url: '#', totalSlots: 200, completedSlots: 87, device: 'all', isFeatured: true, status: 'active', createdAt: now },
  { _id: 'offer_003', title: 'Watch Video Offer', description: 'Watch a short 30-second video and answer a quick question.', shortDescription: 'Watch and earn instantly', category: 'video', reward: 25, xpReward: 10, requirements: 'None', instructions: 'Watch the full video and answer.', url: '#', totalSlots: 1000, completedSlots: 512, device: 'all', isFeatured: false, status: 'active', createdAt: now },
  { _id: 'offer_004', title: 'Sign Up for Service', description: 'Create a free account on our partner platform.', shortDescription: 'Free signup bonus', category: 'signup', reward: 150, xpReward: 40, requirements: 'Valid email', instructions: 'Register and verify your email.', url: '#', totalSlots: 300, completedSlots: 110, device: 'all', isFeatured: false, status: 'active', createdAt: now },
  { _id: 'offer_005', title: 'Make a Purchase Offer', description: 'Make a qualifying purchase of $10+ and earn big rewards!', shortDescription: 'Get cashback on purchases', category: 'purchase', reward: 500, xpReward: 100, requirements: 'Min $10 purchase', instructions: 'Purchase and upload receipt.', url: '#', totalSlots: 100, completedSlots: 42, device: 'all', isFeatured: true, status: 'active', createdAt: now },
  { _id: 'offer_006', title: 'iOS Exclusive Survey', description: 'iOS users only! Share your thoughts on the latest trends.', shortDescription: 'iOS users survey', category: 'survey', reward: 75, xpReward: 30, requirements: 'iOS device', instructions: 'Complete on your iPhone/iPad.', url: '#', totalSlots: 250, completedSlots: 68, device: 'ios', isFeatured: false, status: 'active', createdAt: now },
];

const sampleTransactions = [
  { _id: 'txn_001', user: 'user_demo_001', type: 'earning', amount: 50, description: 'Offer completed: Complete a 5-min Survey', status: 'completed', balanceBefore: 1200, balanceAfter: 1250, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'txn_002', user: 'user_demo_001', type: 'bonus', amount: 25, description: 'Daily bonus (day 5)', status: 'completed', balanceBefore: 1175, balanceAfter: 1200, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'txn_003', user: 'user_demo_001', type: 'referral', amount: 50, description: 'Referral reward for JohnDoe', status: 'completed', balanceBefore: 1125, balanceAfter: 1175, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'txn_004', user: 'user_demo_001', type: 'earning', amount: 200, description: 'Offer completed: Download & Install App', status: 'completed', balanceBefore: 925, balanceAfter: 1125, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { _id: 'txn_005', user: 'user_demo_001', type: 'withdrawal', amount: -500, description: 'Withdrawal request: PayPal', status: 'completed', balanceBefore: 1425, balanceAfter: 925, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
];

const sampleWithdrawals = [
  { _id: 'wd_001', user: sampleUser, amount: 500, fee: 25, netAmount: 475, method: 'paypal', accountDetails: { email: 'demo@paypal.com' }, status: 'completed', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { _id: 'wd_002', user: sampleUser, amount: 750, fee: 37.5, netAmount: 712.5, method: 'giftcard', accountDetails: { brand: 'amazon', email: 'demo@email.com' }, status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'wd_003', user: { _id: 'u2', username: 'Alice', email: 'alice@test.com' }, amount: 300, fee: 15, netAmount: 285, method: 'paypal', accountDetails: { email: 'alice@paypal.com' }, status: 'approved', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { _id: 'wd_004', user: { _id: 'u3', username: 'Bob', email: 'bob@test.com' }, amount: 1000, fee: 50, netAmount: 950, method: 'crypto', accountDetails: { currency: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }, status: 'processing', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
];

const sampleReferrals = [
  { _id: 'ref_001', referrer: 'user_demo_001', referred: { _id: 'u2', username: 'JohnDoe', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() }, status: 'credited', reward: 50, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { _id: 'ref_002', referrer: 'user_demo_001', referred: { _id: 'u3', username: 'JaneSmith', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() }, status: 'pending', reward: 50, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const sampleAdminUsers = [
  { _id: 'admin_001', username: 'admin', email: 'admin@cashli.com', balance: 0, totalEarned: 0, totalWithdrawn: 0, level: 1, xp: 0, dailyStreak: 0, referralCode: 'ADMIN', role: 'admin', isActive: true, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { _id: 'user_demo_001', username: 'DemoUser', email: 'demo@cashli.com', balance: 1250, totalEarned: 3200, totalWithdrawn: 500, level: 3, xp: 850, dailyStreak: 5, referralCode: 'DEMO123', role: 'user', isActive: true, createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
  { _id: 'user_002', username: 'Alice', email: 'alice@test.com', balance: 890, totalEarned: 1500, totalWithdrawn: 200, level: 2, xp: 450, dailyStreak: 3, referralCode: 'ALICE01', role: 'user', isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { _id: 'user_003', username: 'Bob', email: 'bob@test.com', balance: 2100, totalEarned: 5000, totalWithdrawn: 1200, level: 4, xp: 1200, dailyStreak: 7, referralCode: 'BOB01', role: 'user', isActive: false, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

// ============ AUTH ============
app.post('/api/auth/register', (req, res) => {
  res.status(201).json({ token: 'mock_token_abc123', user: { ...sampleUser, username: req.body.username, email: req.body.email } });
});

app.post('/api/auth/login', (req, res) => {
  if (req.body.email === 'admin@cashli.com') {
    return res.json({ token: 'mock_token_admin', user: { ...sampleUser, username: 'admin', email: 'admin@cashli.com', role: 'admin', balance: 0, level: 1 } });
  }
  res.json({ token: 'mock_token_abc123', user: sampleUser });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'mock_token_admin') return res.json({ user: { ...sampleUser, username: 'admin', email: 'admin@cashli.com', role: 'admin', balance: 0, level: 1 } });
  res.json({ user: sampleUser });
});

app.put('/api/auth/profile', (req, res) => {
  res.json({ user: { ...sampleUser, username: req.body.username || sampleUser.username } });
});

app.put('/api/auth/change-password', (req, res) => {
  res.json({ message: 'Password updated successfully' });
});

// ============ OFFERS ============
app.get('/api/offers', (req, res) => {
  let filtered = [...sampleOffers];
  if (req.query.category) filtered = filtered.filter(o => o.category === req.query.category);
  if (req.query.device && req.query.device !== 'all') filtered = filtered.filter(o => o.device === 'all' || o.device === req.query.device);
  if (req.query.sort === 'reward') filtered.sort((a, b) => b.reward - a.reward);
  res.json({ offers: filtered, pagination: { page: 1, limit: 20, total: filtered.length, pages: 1 } });
});

app.get('/api/offers/:id', (req, res) => {
  const offer = sampleOffers.find(o => o._id === req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  const completion = Math.random() > 0.5 ? { _id: 'comp_001', status: 'pending', reward: offer.reward, xpReward: offer.xpReward } : null;
  res.json({ offer, completion });
});

app.post('/api/offers/:id/start', (req, res) => {
  res.status(201).json({ completion: { _id: 'comp_' + Date.now(), status: 'pending', offer: req.params.id, user: 'user_demo_001', reward: 50, xpReward: 25, completedAt: now } });
});

app.get('/api/offers/completions', (req, res) => {
  res.json({ completions: [] });
});

app.put('/api/offers/:completionId/proof', (req, res) => {
  res.json({ completion: { _id: req.params.completionId, status: 'pending', proof: req.body.proof } });
});

// ============ WALLET ============
app.get('/api/wallet/balance', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const isAdmin = token === 'mock_token_admin';
  const u = isAdmin ? { balance: 0, totalEarned: 0, totalWithdrawn: 0, xp: 0, level: 1 } : sampleUser;
  res.json({ balance: u.balance, totalEarned: u.totalEarned, totalWithdrawn: u.totalWithdrawn, xp: u.xp, level: u.level, levelProgress: { current: { level: u.level, name: u.level >= 4 ? 'Platinum' : u.level >= 3 ? 'Gold' : u.level >= 2 ? 'Silver' : 'Bronze' }, next: { level: Math.min(u.level + 1, 10), name: u.level >= 4 ? 'Diamond' : u.level >= 3 ? 'Platinum' : u.level >= 2 ? 'Gold' : 'Silver' }, progress: 42, xpToNext: 650 } });
});

app.get('/api/wallet/transactions', (req, res) => {
  let txns = [...sampleTransactions];
  if (req.query.type) txns = txns.filter(t => t.type === req.query.type);
  if (req.query.limit) txns = txns.slice(0, parseInt(req.query.limit));
  res.json({ transactions: txns, pagination: { page: 1, limit: 20, total: txns.length, pages: 1 } });
});

// ============ WITHDRAWALS ============
app.get('/api/withdrawals/methods', (req, res) => {
  res.json({ methods: [
    { id: 'paypal', name: 'PayPal', minAmount: 500, icon: 'paypal', description: 'Withdraw to your PayPal account' },
    { id: 'crypto', name: 'Cryptocurrency', minAmount: 1000, icon: 'crypto', description: 'Withdraw in BTC, ETH, or USDT' },
    { id: 'giftcard', name: 'Gift Card', minAmount: 200, icon: 'gift', description: 'Amazon, Google Play, Steam & more' },
  ]});
});

app.get('/api/withdrawals', (req, res) => {
  res.json({ withdrawals: sampleWithdrawals });
});

app.post('/api/withdrawals', (req, res) => {
  res.status(201).json({ withdrawal: { _id: 'wd_' + Date.now(), user: 'user_demo_001', amount: req.body.amount, method: req.body.method, status: 'pending', accountDetails: req.body.accountDetails, createdAt: now } });
});

// ============ REFERRALS ============
app.get('/api/referrals', (req, res) => {
  res.json({ total: 2, credited: 1, pending: 1, referrals: sampleReferrals, referralCode: 'DEMO123', referralLink: 'http://localhost:3000/register?ref=DEMO123' });
});

app.get('/api/referrals/leaderboard', (req, res) => {
  res.json({ leaderboard: [
    { _id: 'u1', username: 'CryptoKing', level: 7, referrals: 45, totalReward: 2250 },
    { _id: 'u2', username: 'SurveyMaster', level: 5, referrals: 32, totalReward: 1600 },
    { _id: 'u3', username: 'OfferHunter', level: 4, referrals: 18, totalReward: 900 },
    { _id: 'u4', username: 'CoinCollector', level: 3, referrals: 12, totalReward: 600 },
    { _id: 'user_demo_001', username: 'DemoUser', level: 3, referrals: 2, totalReward: 50 },
  ]});
});

// ============ LEVELS ============
app.get('/api/levels/progress', (req, res) => {
  res.json({ current: { level: 3, name: 'Gold' }, next: { level: 4, name: 'Platinum' }, progress: 42, xpToNext: 650 });
});

app.get('/api/levels/leaderboard', (req, res) => {
  const lb = [
    { _id: 'u1', username: 'CryptoKing', level: 7, xp: 85000, totalEarned: 45000 },
    { _id: 'u2', username: 'SurveyMaster', level: 5, xp: 32000, totalEarned: 18000 },
    { _id: 'u3', username: 'OfferHunter', level: 4, xp: 15000, totalEarned: 9200 },
    { _id: 'u4', username: 'CoinCollector', level: 3, xp: 5000, totalEarned: 3500 },
    { _id: 'user_demo_001', username: 'DemoUser', level: 3, xp: 850, totalEarned: 3200 },
  ];
  res.json({ leaderboard: lb, userRank: 5 });
});

app.get('/api/levels/achievements', (req, res) => {
  res.json({ achievements: [
    { name: 'First Steps', description: 'Complete your first offer', icon: '🚀', category: 'offers', requirement: { type: 'offers_completed', count: 1 }, reward: { coins: 5, xp: 50 }, unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { name: 'Offer Machine', description: 'Complete 10 offers', icon: '⚡', category: 'offers', requirement: { type: 'offers_completed', count: 10 }, reward: { coins: 25, xp: 200 }, unlocked: false },
    { name: 'Offer King', description: 'Complete 50 offers', icon: '👑', category: 'offers', requirement: { type: 'offers_completed', count: 50 }, reward: { coins: 100, xp: 500 }, unlocked: false },
    { name: 'Social Butterfly', description: 'Refer your first friend', icon: '🦋', category: 'referrals', requirement: { type: 'referrals', count: 1 }, reward: { coins: 20, xp: 100 }, unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { name: 'Networker', description: 'Refer 5 friends', icon: '🌐', category: 'referrals', requirement: { type: 'referrals', count: 5 }, reward: { coins: 50, xp: 300 }, unlocked: false },
    { name: 'Dedicated', description: 'Claim 7 daily bonuses', icon: '🔥', category: 'bonuses', requirement: { type: 'daily_bonuses', count: 7 }, reward: { coins: 30, xp: 150 }, unlocked: false },
    { name: 'Loyal', description: 'Claim 30 daily bonuses', icon: '💎', category: 'bonuses', requirement: { type: 'daily_bonuses', count: 30 }, reward: { coins: 100, xp: 500 }, unlocked: false },
    { name: 'Big Earner', description: 'Earn 1000 coins total', icon: '💰', category: 'earnings', requirement: { type: 'total_earned', count: 1000 }, reward: { coins: 50, xp: 300 }, unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { name: 'Cash Cow', description: 'Earn 10000 coins total', icon: '🐄', category: 'earnings', requirement: { type: 'total_earned', count: 10000 }, reward: { coins: 200, xp: 1000 }, unlocked: false },
    { name: 'First Payout', description: 'Make your first withdrawal', icon: '💸', category: 'withdrawals', requirement: { type: 'withdrawals', count: 1 }, reward: { coins: 10, xp: 100 }, unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  ]});
});

// ============ BONUSES ============
app.get('/api/bonuses/check', (req, res) => {
  res.json({ canClaim: true, streak: 5 });
});

app.post('/api/bonuses/daily', (req, res) => {
  res.json({ streak: 6, reward: { coins: 20, xp: 11 }, message: 'Daily bonus claimed! +20 coins, +11 XP' });
});

app.get('/api/bonuses/history', (req, res) => {
  res.json({ bonuses: [
    { _id: 'b1', type: 'daily', reward: { coins: 18, xp: 10 }, streak: 5, claimedAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'b2', type: 'daily', reward: { coins: 16, xp: 9 }, streak: 4, claimedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { _id: 'b3', type: 'welcome', reward: { coins: 100, xp: 50 }, claimedAt: new Date(Date.now() - 86400000 * 14).toISOString() },
  ]});
});

// ============ ADMIN ============
app.get('/api/admin/dashboard', (req, res) => {
  res.json({ stats: { totalUsers: 1243, totalOffers: 6, pendingWithdrawals: 3, pendingCompletions: 5, totalEarnings: 45200, usersToday: 18 }, recentUsers: sampleAdminUsers.slice(0, 5) });
});

app.get('/api/admin/platform-stats', (req, res) => {
  res.json({ totalUsers: 1243, activeToday: 342, totalWithdrawn: 12500, totalEarned: 45200, avgEarning: 36 });
});

app.get('/api/admin/users', (req, res) => {
  let users = [...sampleAdminUsers];
  if (req.query.search) users = users.filter(u => u.username.toLowerCase().includes(req.query.search.toLowerCase()) || u.email.toLowerCase().includes(req.query.search.toLowerCase()));
  res.json({ users, pagination: { page: 1, limit: 20, total: users.length, pages: 1 } });
});

app.put('/api/admin/users/:id/toggle-status', (req, res) => {
  res.json({ message: 'User status toggled', user: { _id: req.params.id, isActive: true } });
});

app.post('/api/admin/users/:id/adjust-balance', (req, res) => {
  const user = sampleAdminUsers.find(u => u._id === req.params.id);
  if (user) {
    user.balance = Math.max(0, user.balance + (parseFloat(req.body.amount) || 0));
    if (req.body.reason) user._adjustReason = req.body.reason;
    if (user._id === sampleUser._id) sampleUser.balance = user.balance;
    return res.json({ message: 'Balance adjusted', user });
  }
  const fallback = { _id: req.params.id, balance: 1000, totalEarned: 3200, totalWithdrawn: 500, level: 3, xp: 850, dailyStreak: 5, referralCode: 'DEMO123', role: 'user', isActive: true, username: 'DemoUser', email: 'demo@cashli.com', createdAt: new Date(Date.now() - 86400000 * 14).toISOString() };
  if (fallback._id === sampleUser._id) sampleUser.balance = fallback.balance;
  res.json({ message: 'Balance adjusted', user: fallback });
});

app.put('/api/admin/users/:id/adjust-xp', (req, res) => {
  const user = sampleAdminUsers.find(u => u._id === req.params.id);
  if (user) {
    user.xp = parseInt(req.body.xp) || user.xp;
    user.level = parseInt(req.body.level) || user.level;
    if (user._id === sampleUser._id) { sampleUser.xp = user.xp; sampleUser.level = user.level; }
    return res.json({ message: 'XP/Level updated', user });
  }
  const fallback2 = { _id: req.params.id, balance: 1000, totalEarned: 3200, totalWithdrawn: 500, level: parseInt(req.body.level) || 3, xp: parseInt(req.body.xp) || 850, dailyStreak: 5, referralCode: 'DEMO123', role: 'user', isActive: true, username: 'DemoUser', email: 'demo@cashli.com', createdAt: new Date(Date.now() - 86400000 * 14).toISOString() };
  if (fallback2._id === sampleUser._id) { sampleUser.xp = fallback2.xp; sampleUser.level = fallback2.level; }
  res.json({ message: 'XP/Level updated', user: fallback2 });
});

app.get('/api/admin/offers', (req, res) => {
  res.json({ offers: sampleOffers, pagination: { page: 1, limit: 20, total: sampleOffers.length, pages: 1 } });
});

app.post('/api/admin/offers', (req, res) => {
  res.status(201).json({ offer: { _id: 'offer_new', ...req.body } });
});

app.put('/api/admin/offers/:id', (req, res) => {
  res.json({ offer: { _id: req.params.id, ...req.body } });
});

app.get('/api/admin/withdrawals', (req, res) => {
  let wds = [...sampleWithdrawals];
  if (req.query.status) wds = wds.filter(w => w.status === req.query.status);
  res.json({ withdrawals: wds.map(w => ({ ...w, user: sampleUser })), pagination: { page: 1, limit: 20, total: wds.length, pages: 1 } });
});

app.put('/api/admin/withdrawals/:id/process', (req, res) => {
  res.json({ withdrawal: { _id: req.params.id, status: req.body.status, adminNotes: req.body.adminNotes } });
});

const sampleCompletions = [
  { _id: 'comp_001', user: { _id: 'user_demo_001', username: 'DemoUser', email: 'demo@cashli.com' }, offer: { _id: 'offer_001', title: 'Complete a 5-min Survey', category: 'survey', reward: 50 }, reward: 50, xpReward: 25, status: 'pending', completedAt: new Date(Date.now() - 3600000).toISOString(), proof: ['screenshot_proof.jpg'], createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'comp_002', user: { _id: 'u2', username: 'Alice', email: 'alice@test.com' }, offer: { _id: 'offer_002', title: 'Download & Install App', category: 'app-download', reward: 200 }, reward: 200, xpReward: 50, status: 'pending', completedAt: new Date(Date.now() - 7200000).toISOString(), proof: [], createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'comp_003', user: { _id: 'user_demo_001', username: 'DemoUser', email: 'demo@cashli.com' }, offer: { _id: 'offer_003', title: 'Watch Video Offer', category: 'video', reward: 25 }, reward: 25, xpReward: 10, status: 'approved', completedAt: new Date(Date.now() - 86400000 * 5).toISOString(), reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(), reviewedBy: 'admin_001', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { _id: 'comp_004', user: { _id: 'u4', username: 'Charlie', email: 'charlie@test.com' }, offer: { _id: 'offer_005', title: 'Make a Purchase Offer', category: 'purchase', reward: 500 }, reward: 500, xpReward: 100, status: 'rejected', completedAt: new Date(Date.now() - 86400000 * 3).toISOString(), adminNotes: 'Receipt does not match requirements', reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(), reviewedBy: 'admin_001', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { _id: 'comp_005', user: { _id: 'user_005', username: 'Diana', email: 'diana@test.com' }, offer: { _id: 'offer_004', title: 'Sign Up for Service', category: 'signup', reward: 150 }, reward: 150, xpReward: 40, status: 'pending', completedAt: new Date(Date.now() - 1800000).toISOString(), proof: ['screenshot_1.png', 'screenshot_2.png'], createdAt: new Date(Date.now() - 1800000).toISOString() },
];

app.get('/api/admin/completions', (req, res) => {
  let filtered = [...sampleCompletions];
  if (req.query.status) filtered = filtered.filter(c => c.status === req.query.status);
  res.json({ completions: filtered, pagination: { page: 1, limit: 20, total: filtered.length, pages: 1 } });
});

app.put('/api/admin/completions/:id/process', (req, res) => {
  res.json({ completion: { _id: req.params.id, status: req.body.status } });
});

// ============ REAL FRAUD DETECTION ENGINE ============
// Stores every single user action with precise timestamps
const userActionLogs = {};
const fraudAlerts = [];
const flaggedUsers = {};
const knownIPs = {};

// Risk profiles
const FRAUD_RULES = {
  MIN_STEP_INTERVAL: 500,        // <500ms between actions = bot
  MAX_TASKS_PER_HOUR: 20,        // >20 tasks in 1 hour = velocity hack
  MAX_TASKS_PER_DAY: 100,        // >100 tasks in 24h = impossible for human
  MIN_SESSION_TIME: 3000,        // session <3s = automated
  MAX_ACCOUNTS_PER_IP: 3,        // >3 accounts same IP = farm
  SUSPICIOUS_TIME_RANGE: [0, 6], // 00:00-06:00 = unusual activity window
};

// Seed some flagged users for demo
flaggedUsers['user_bot_001'] = { username: 'FastClicker', riskScore: 92, reasons: ['Time between steps < 200ms (bot pattern)', 'Completed 47 tasks in 1 hour', 'All actions at exact 500ms intervals'] };
flaggedUsers['user_bot_002'] = { username: 'VPN_User_99', riskScore: 85, reasons: ['VPN/proxy detected', 'Account created 5 min ago, already completed 12 tasks', 'IP matches 3 other accounts'] };
flaggedUsers['user_bot_003'] = { username: 'EarnFastPro', riskScore: 78, reasons: ['Time between steps < 100ms (scripted)', '100% identical click patterns', 'Session duration: 2.1s average'] };
flaggedUsers['user_bot_004'] = { username: 'SurveyKing', riskScore: 65, reasons: ['Completed 34 surveys in 90 minutes', 'All completions at identical speeds', 'Geolocation mismatch with IP'] };

// Seed initial fraud alerts
const seedAlerts = () => {
  const now = Date.now();
  return [
    { id: 'alert_001', type: 'bot', severity: 'critical', user: 'FastClicker', title: 'Bot Pattern Detected', description: 'Average time between steps: 187ms. Threshold is 500ms.', timestamp: now - 120000, status: 'new', userId: 'user_bot_001' },
    { id: 'alert_002', type: 'velocity', severity: 'high', user: 'VPN_User_99', title: 'Task Velocity Anomaly', description: '18 tasks completed in 22 minutes. Normal human rate: 2-3/hour.', timestamp: now - 300000, status: 'new', userId: 'user_bot_002' },
    { id: 'alert_003', type: 'multi-account', severity: 'high', user: 'EarnFastPro', title: 'Multi-Account Farm Suspected', description: 'Same IP (192.168.1.50) linked to 4 accounts. Max allowed: 3.', timestamp: now - 600000, status: 'reviewing', userId: 'user_bot_003' },
    { id: 'alert_004', type: 'time-anomaly', severity: 'medium', user: 'SurveyKing', title: 'Unusual Activity Hours', description: 'All 34 completions occurred between 2:00 AM - 4:30 AM local time.', timestamp: now - 3600000, status: 'new', userId: 'user_bot_004' },
    { id: 'alert_005', type: 'vpn', severity: 'medium', user: 'DemoUser', title: 'VPN/Proxy Detected', description: 'Connection appears to route through known proxy. Flagged for review.', timestamp: now - 7200000, status: 'dismissed', userId: 'user_demo_001' },
  ];
};
fraudAlerts.push(...seedAlerts());

// Helper: parse time string like "4m 32s" to ms
function parseTimeToMs(timeStr) {
  const m = timeStr.match(/(\d+)m\s*(\d+)s/);
  if (m) return parseInt(m[1]) * 60000 + parseInt(m[2]) * 1000;
  const s = timeStr.match(/(\d+)s/);
  if (s) return parseInt(s[1]) * 1000;
  return 0;
}

// Helper: format ms to time string
function formatMs(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

// REAL fraud analysis engine
function analyzeUserActivity(userId, username) {
  const logs = userActionLogs[userId];
  if (!logs || logs.actions.length < 3) return { riskScore: 0, flags: [] };

  const flags = [];
  const actions = logs.actions;
  const now = Date.now();

  // 1. TIME BETWEEN STEPS CHECK (Bot detection)
  if (actions.length >= 3) {
    const intervals = [];
    for (let i = 1; i < actions.length; i++) {
      intervals.push(actions[i].timestamp - actions[i - 1].timestamp);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avgInterval < FRAUD_RULES.MIN_STEP_INTERVAL) {
      const desc = `Average time between steps: ${avgInterval.toFixed(0)}ms. Threshold is ${FRAUD_RULES.MIN_STEP_INTERVAL}ms.`;
      flags.push({ type: 'bot', severity: 'critical', name: 'Bot Pattern Detected', description: desc, score: 35 });
    }
    // Check for identical intervals (scripted behavior)
    const uniqueIntervals = new Set(intervals.map(i => Math.round(i / 100) * 100));
    if (uniqueIntervals.size <= 2 && intervals.length > 5) {
      flags.push({ type: 'bot', severity: 'critical', name: 'Scripted Behavior', description: 'All action intervals are nearly identical (scripted automation).', score: 30 });
    }
  }

  // 2. VELOCITY CHECK (Task completion rate)
  const lastHour = actions.filter(a => a.type === 'task_complete' && (now - a.timestamp) < 3600000);
  if (lastHour.length > FRAUD_RULES.MAX_TASKS_PER_HOUR) {
    flags.push({ type: 'velocity', severity: 'high', name: 'Task Velocity Anomaly', description: `${lastHour.length} tasks completed in the last hour. Normal max: ${FRAUD_RULES.MAX_TASKS_PER_HOUR}.`, score: 25 });
  }
  const lastDay = actions.filter(a => a.type === 'task_complete' && (now - a.timestamp) < 86400000);
  if (lastDay.length > FRAUD_RULES.MAX_TASKS_PER_DAY) {
    flags.push({ type: 'velocity', severity: 'high', name: 'Daily Task Limit Exceeded', description: `${lastDay.length} tasks in 24h. Impossible for a human.`, score: 20 });
  }

  // 3. SESSION TIME CHECK
  const shortSessions = actions.filter(a => a.type === 'session_end' && a.duration && a.duration < FRAUD_RULES.MIN_SESSION_TIME);
  if (shortSessions.length > 2) {
    flags.push({ type: 'session', severity: 'medium', name: 'Suspiciously Short Sessions', description: `${shortSessions.length} sessions lasted <3 seconds. Likely automated.`, score: 15 });
  }

  // 4. MULTI-ACCOUNT CHECK
  if (logs.ip) {
    const accountsOnIP = Object.values(userActionLogs).filter(l => l.ip === logs.ip && l.userId !== userId);
    if (accountsOnIP.length >= FRAUD_RULES.MAX_ACCOUNTS_PER_IP) {
      flags.push({ type: 'multi-account', severity: 'high', name: 'Multi-Account Farm Suspected', description: `IP ${logs.ip} linked to ${accountsOnIP.length + 1} accounts. Max allowed: ${FRAUD_RULES.MAX_ACCOUNTS_PER_IP}.`, score: 30 });
    }
  }

  // 5. TIME-OF-DAY ANOMALY CHECK
  const nightActions = actions.filter(a => {
    const h = new Date(a.timestamp).getHours();
    return h >= FRAUD_RULES.SUSPICIOUS_TIME_RANGE[0] && h < FRAUD_RULES.SUSPICIOUS_TIME_RANGE[1];
  });
  if (nightActions.length > actions.length * 0.8 && actions.length > 10) {
    flags.push({ type: 'time-anomaly', severity: 'medium', name: 'Unusual Activity Hours', description: `${((nightActions.length / actions.length) * 100).toFixed(0)}% of actions occurred between midnight and 6 AM.`, score: 10 });
  }

  const riskScore = flags.reduce((sum, f) => sum + f.score, 0);

  // If risky, generate alert
  if (riskScore > 30) {
    const existingAlert = fraudAlerts.find(a => a.userId === userId && a.status !== 'dismissed');
    if (!existingAlert) {
      fraudAlerts.unshift({
        id: 'alert_' + Date.now(),
        type: flags[0].type,
        severity: riskScore > 60 ? 'critical' : riskScore > 40 ? 'high' : 'medium',
        user: username,
        title: flags[0].name,
        description: flags[0].description,
        timestamp: now,
        status: 'new',
        userId,
      });
    }
    flaggedUsers[userId] = { username, riskScore, reasons: flags.map(f => `${f.name}: ${f.description}`) };
  }

  return { riskScore, flags };
}

// Endpoint: start tracking session
app.post('/api/analytics/session/start', (req, res) => {
  const { userId, ip } = req.body;
  if (!userActionLogs[userId]) {
    userActionLogs[userId] = { userId, actions: [], ip: ip || 'unknown', startTime: Date.now() };
  }
  userActionLogs[userId].sessionStart = Date.now();
  userActionLogs[userId].actions.push({ type: 'session_start', timestamp: Date.now() });
  res.json({ sessionId: 'sess_' + Date.now(), status: 'tracking' });
});

// Endpoint: end session
app.post('/api/analytics/session/end', (req, res) => {
  const { userId } = req.body;
  if (userActionLogs[userId] && userActionLogs[userId].sessionStart) {
    const duration = Date.now() - userActionLogs[userId].sessionStart;
    userActionLogs[userId].actions.push({ type: 'session_end', timestamp: Date.now(), duration });
  }
  res.json({ tracked: true });
});

// Endpoint: track task step with REAL fraud analysis
app.post('/api/analytics/task/step', (req, res) => {
  const { userId, taskId, step, action, username, ip } = req.body;
  if (!userActionLogs[userId]) {
    userActionLogs[userId] = { userId, actions: [], ip: ip || 'unknown', startTime: Date.now() };
  }
  if (ip) userActionLogs[userId].ip = ip;
  userActionLogs[userId].actions.push({ type: 'task_step', taskId, step, action, timestamp: Date.now() });

  // Run real-time fraud check on every 5th action
  if (userActionLogs[userId].actions.length % 5 === 0) {
    const analysis = analyzeUserActivity(userId, username || userId);
    res.json({ tracked: true, fraudCheck: { riskScore: analysis.riskScore, flags: analysis.flags.length } });
  } else {
    res.json({ tracked: true });
  }
});

// Endpoint: track page view
app.post('/api/analytics/pageview', (req, res) => {
  const { userId, page } = req.body;
  if (!userActionLogs[userId]) {
    userActionLogs[userId] = { userId, actions: [], ip: 'unknown', startTime: Date.now() };
  }
  userActionLogs[userId].actions.push({ type: 'pageview', page, timestamp: Date.now() });
  res.json({ tracked: true });
});

// Endpoint: report task completion with real fraud calc
app.post('/api/analytics/task/complete', (req, res) => {
  const { userId, taskId, taskName, timeSpent, stepsCount, username } = req.body;
  if (!userActionLogs[userId]) {
    userActionLogs[userId] = { userId, actions: [], ip: 'unknown', startTime: Date.now() };
  }
  userActionLogs[userId].actions.push({ type: 'task_complete', taskId, taskName, timestamp: Date.now() });

  // Run fraud analysis
  const analysis = analyzeUserActivity(userId, username || userId);

  res.json({
    tracked: true,
    activity: { user: username || userId, task: taskName, time: timeSpent, steps: stepsCount, status: 'completed', date: new Date().toISOString() },
    fraudCheck: {
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskScore > 60 ? 'critical' : analysis.riskScore > 30 ? 'suspicious' : 'normal',
      flags: analysis.flags,
    }
  });
});

// Endpoint: get all fraud alerts for admin
app.get('/api/admin/fraud-alerts', (req, res) => {
  const status = req.query.status;
  let alerts = [...fraudAlerts];
  if (status) alerts = alerts.filter(a => a.status === status);
  res.json({ alerts, total: fraudAlerts.length, newCount: fraudAlerts.filter(a => a.status === 'new').length });
});

// Endpoint: update alert status
app.put('/api/admin/fraud-alerts/:id', (req, res) => {
  const alert = fraudAlerts.find(a => a.id === req.params.id);
  if (alert) {
    alert.status = req.body.status || alert.status;
    if (req.body.notes) alert.adminNotes = req.body.notes;
    res.json({ alert });
  } else {
    res.status(404).json({ message: 'Alert not found' });
  }
});

// Endpoint: get flagged users
app.get('/api/admin/flagged-users', (req, res) => {
  const users = Object.entries(flaggedUsers).map(([userId, data]) => ({
    userId,
    username: data.username,
    riskScore: data.riskScore,
    reasons: data.reasons,
    totalActions: userActionLogs[userId]?.actions?.length || 0,
  })).sort((a, b) => b.riskScore - a.riskScore);
  res.json({ users, total: users.length });
});

// Endpoint: get detailed user activity for investigation
app.get('/api/admin/analytics/user/:userId', (req, res) => {
  const logs = userActionLogs[req.params.userId];
  if (!logs) return res.status(404).json({ message: 'No data for this user' });
  const flagged = flaggedUsers[req.params.userId];
  res.json({
    userId: logs.userId,
    ip: logs.ip,
    totalActions: logs.actions.length,
    sessionStart: logs.startTime,
    actions: logs.actions.slice(-100), // last 100 actions
    fraudFlags: flagged ? { riskScore: flagged.riskScore, reasons: flagged.reasons } : null,
  });
});

// Sample activities for display (static + real)
const sampleActivities = [
  { user: 'DemoUser', task: 'Complete a 5-min Survey', time: '4m 32s', steps: 12, status: 'completed', date: new Date(Date.now() - 3600000).toISOString() },
  { user: 'Alice', task: 'Download & Install App', time: '12m 15s', steps: 8, status: 'completed', date: new Date(Date.now() - 7200000).toISOString() },
  { user: 'DemoUser', task: 'Watch Video Offer', time: '1m 05s', steps: 3, status: 'completed', date: new Date(Date.now() - 14400000).toISOString() },
  { user: 'Bob', task: 'Sign Up for Service', time: '8m 22s', steps: 6, status: 'abandoned', date: new Date(Date.now() - 28800000).toISOString() },
  { user: 'Charlie', task: 'Make a Purchase Offer', time: '35m 10s', steps: 15, status: 'completed', date: new Date(Date.now() - 86400000).toISOString() },
  { user: 'DemoUser', task: 'iOS Exclusive Survey', time: '6m 48s', steps: 9, status: 'pending', date: new Date(Date.now() - 1800000).toISOString() },
  { user: 'Diana', task: 'Complete a 5-min Survey', time: '5m 12s', steps: 11, status: 'completed', date: new Date(Date.now() - 5400000).toISOString() },
  { user: 'Eve', task: 'Download & Install App', time: '15m 30s', steps: 7, status: 'completed', date: new Date(Date.now() - 10800000).toISOString() },
  { user: 'Frank', task: 'Watch Video Offer', time: '0m 55s', steps: 3, status: 'completed', date: new Date(Date.now() - 21600000).toISOString() },
  { user: 'Alice', task: 'Sign Up for Service', time: '7m 05s', steps: 5, status: 'completed', date: new Date(Date.now() - 43200000).toISOString() },
];

// Get analytics dashboard data
app.get('/api/admin/analytics', (req, res) => {
  const days = 30;
  const dailyData = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0],
    users: Math.floor(Math.random() * 50 + 20),
    earnings: Math.floor(Math.random() * 5000 + 1000),
    completions: Math.floor(Math.random() * 30 + 5),
    registrations: Math.floor(Math.random() * 15 + 3),
  }));

  res.json({
    overview: {
      totalUsers: 1243, activeToday: 342, activeThisWeek: 891,
      totalEarnings: 45200, totalWithdrawn: 12500, avgEarning: 36,
      avgSessionTime: '14m 32s', bounceRate: '32%',
      completionRate: '78%', avgTaskTime: '8m 45s',
    },
    dailyData,
    topOffers: [
      { name: 'Download & Install App', completions: 87, revenue: 17400 },
      { name: 'Complete a 5-min Survey', completions: 234, revenue: 11700 },
      { name: 'Sign Up for Service', completions: 110, revenue: 16500 },
      { name: 'Make a Purchase Offer', completions: 42, revenue: 21000 },
      { name: 'iOS Exclusive Survey', completions: 68, revenue: 5100 },
    ],
    userActivity: sampleActivities.slice(0, 20),
    deviceBreakdown: { ios: 45, android: 40, desktop: 15 },
    countryBreakdown: { US: 35, UK: 12, Canada: 10, Germany: 8, France: 7, Other: 28 },
  });
});

// ============ LIVE PAYMENT FEED ============
const paymentFeed = [
  { user: 'JohnD', amount: 25, method: 'PayPal', time: '2 min ago', avatar: 'J', country: 'US' },
  { user: 'Sarah_M', amount: 50, method: 'Gift Card', time: '5 min ago', avatar: 'S', country: 'UK' },
  { user: 'CryptoKing', amount: 100, method: 'BTC', time: '12 min ago', avatar: 'C', country: 'DE' },
  { user: 'Emma_W', amount: 15, method: 'PayPal', time: '18 min ago', avatar: 'E', country: 'CA' },
  { user: 'TaskMaster', amount: 75, method: 'Gift Card', time: '25 min ago', avatar: 'T', country: 'US' },
  { user: 'Lucas_B', amount: 200, method: 'PayPal', time: '32 min ago', avatar: 'L', country: 'FR' },
  { user: 'Aria_N', amount: 10, method: 'Gift Card', time: '40 min ago', avatar: 'A', country: 'AU' },
  { user: 'Max_P', amount: 50, method: 'Crypto', time: '48 min ago', avatar: 'M', country: 'US' },
  { user: 'Sophia_R', amount: 30, method: 'PayPal', time: '1h ago', avatar: 'S', country: 'UK' },
  { user: 'Leo_M', amount: 150, method: 'Gift Card', time: '1h ago', avatar: 'L', country: 'US' },
];

app.get('/api/admin/live-feed', (req, res) => {
  res.json({ payments: paymentFeed });
});

// ============ SUPPORT CHATBOT ============
const supportResponses = {
  'my reward didn\'t track': 'I understand your reward didn\'t track. Let me check your completion status... Your task was completed successfully! The reward of 50 coins has been credited to your account. If you don\'t see it, try refreshing the page.',
  'i can\'t withdraw': 'I can help you with that! Withdrawals require a minimum balance. Your current balance is shown on your wallet page. Make sure you\'ve selected the correct payment method and entered valid account details. Need help with a specific method?',
  'when will i get paid': 'Payouts are typically processed within 24-48 hours after approval. Once approved, PayPal payments are instant, crypto takes 1-2 hours, and gift cards are delivered within 24 hours to your email.',
  'my account was banned': 'I\'m sorry to hear that. Let me look into this for you. Could you provide your username so I can check the reason? Most bans are due to VPN usage or multiple accounts. If you believe this was a mistake, I can escalate this to our team.',
  'how do i earn': 'Great question! You can earn by completing offers, surveys, watching videos, downloading apps, and referring friends. Each task shows the exact reward before you start. I can also recommend tasks based on your profile!',
  'default': 'Thank you for reaching out! I\'m Cashli AI assistant. I can help with: tracking rewards, withdrawals, bans, earning tips, or account issues. Just tell me what you need help with!'
};

app.post('/api/support/chat', (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();
  let response = supportResponses.default;
  for (const [key, value] of Object.entries(supportResponses)) {
    if (lowerMsg.includes(key)) { response = value; break; }
  }
  res.json({ response, timestamp: new Date().toISOString() });
});

// ============ USER PROTECTION FUND ============
app.get('/api/admin/protection-fund', (req, res) => {
  res.json({
    totalFund: 4520,
    totalDisputes: 23,
    resolvedDisputes: 19,
    paidOut: 1250,
    pendingDisputes: 4,
    recentDisputes: [
      { user: 'Alice', task: 'Download & Install App', amount: 200, status: 'paid', date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { user: 'Bob', task: 'Sign Up for Service', amount: 150, status: 'pending', date: new Date(Date.now() - 86400000).toISOString() },
      { user: 'Charlie', task: 'Purchase Offer', amount: 500, status: 'paid', date: new Date(Date.now() - 86400000 * 5).toISOString() },
      { user: 'Diana', task: 'iOS Survey', amount: 75, status: 'pending', date: new Date(Date.now() - 43200000).toISOString() },
    ]
  });
});

// ============ REFERRAL FRAUD DETECTION ============
const referralData = [
  { referrer: 'DemoUser', referrerId: 'user_demo_001', referee: 'JohnDoe', refereeId: 'u2', ip: '192.168.1.100', timeDiff: '2 days', refereeActivity: 45, refereeTasks: 12, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 10).toISOString(), flags: [] },
  { referrer: 'DemoUser', referrerId: 'user_demo_001', referee: 'JaneSmith', refereeId: 'u3', ip: '192.168.1.101', timeDiff: '9 days', refereeActivity: 8, refereeTasks: 2, status: 'pending', reward: 50, date: new Date(Date.now() - 86400000 * 5).toISOString(), flags: [] },
  { referrer: 'CryptoKing', referrerId: 'user_010', referee: 'BotAcc01', refereeId: 'fake_01', ip: '10.0.0.1', timeDiff: '2 minutes', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 3).toISOString(), flags: ['REFERRED_OWN_ALT_ACCOUNT', 'SAME_IP', 'ZERO_ACTIVITY'] },
  { referrer: 'CryptoKing', referrerId: 'user_010', referee: 'BotAcc02', refereeId: 'fake_02', ip: '10.0.0.1', timeDiff: '5 minutes', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 3).toISOString(), flags: ['REFERRED_OWN_ALT_ACCOUNT', 'SAME_IP', 'ZERO_ACTIVITY'] },
  { referrer: 'CryptoKing', referrerId: 'user_010', referee: 'BotAcc03', refereeId: 'fake_03', ip: '10.0.0.1', timeDiff: '8 minutes', refereeActivity: 1, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 3).toISOString(), flags: ['SAME_IP', 'CREATED_IN_BURST', 'NO_TASKS_COMPLETED'] },
  { referrer: 'SurveyMaster', referrerId: 'user_011', referee: 'FakeReferral99', refereeId: 'fake_04', ip: '10.0.0.2', timeDiff: '30 seconds', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 2).toISOString(), flags: ['TIME_DIFF_TOO_SHORT', 'ZERO_ACTIVITY', 'SUSPICIOUS_VELOCITY'] },
  { referrer: 'SurveyMaster', referrerId: 'user_011', referee: 'FakeReferral98', refereeId: 'fake_05', ip: '10.0.0.2', timeDiff: '45 seconds', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 2).toISOString(), flags: ['TIME_DIFF_TOO_SHORT', 'ZERO_ACTIVITY', 'SUSPICIOUS_VELOCITY'] },
  { referrer: 'SurveyMaster', referrerId: 'user_011', referee: 'FakeReferral97', refereeId: 'fake_06', ip: '10.0.0.2', timeDiff: '1 minute', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 2).toISOString(), flags: ['TIME_DIFF_TOO_SHORT', 'ZERO_ACTIVITY', 'SUSPICIOUS_VELOCITY'] },
  { referrer: 'OfferHunter', referrerId: 'user_012', referee: 'RealFriend1', refereeId: 'real_01', ip: '203.0.113.50', timeDiff: '2 hours', refereeActivity: 67, refereeTasks: 23, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 7).toISOString(), flags: [] },
  { referrer: 'OfferHunter', referrerId: 'user_012', referee: 'RealFriend2', refereeId: 'real_02', ip: '203.0.113.51', timeDiff: '1 day', refereeActivity: 34, refereeTasks: 8, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 4).toISOString(), flags: [] },
  { referrer: 'Alice', referrerId: 'user_002', referee: 'SuspiciousAcc', refereeId: 'sus_01', ip: '192.168.1.100', timeDiff: '3 hours', refereeActivity: 3, refereeTasks: 0, status: 'flagged', reward: 50, date: new Date(Date.now() - 86400000 * 1).toISOString(), flags: ['SAME_IP_AS_REFERRER', 'NO_TASKS_COMPLETED'] },
];

const REFERRAL_FRAUD_RULES = {
  MIN_REFERRAL_TIME: 60000,        // <1min between signups = automated
  MAX_REFERRALS_PER_HOUR: 5,       // >5 referrals in 1h = farm
  MIN_REFEREE_ACTIVITY: 5,         // <5 actions by referee = dead account
  MIN_REFEREE_TASKS: 1,            // 0 tasks completed = fake
  SAME_IP_FLAG: true,              // same IP as referrer = self-referral
};

app.get('/api/admin/referral-monitor', (req, res) => {
  const filter = req.query.status || 'all';
  let data = [...referralData];
  if (filter !== 'all') data = data.filter(r => r.status === filter);

  const stats = {
    total: referralData.length,
    legitimate: referralData.filter(r => r.status === 'legitimate').length,
    fraud: referralData.filter(r => r.status === 'fraud').length,
    flagged: referralData.filter(r => r.status === 'flagged').length,
    pending: referralData.filter(r => r.status === 'pending').length,
    totalRewardsAtRisk: referralData.filter(r => r.status !== 'legitimate').reduce((s, r) => s + r.reward, 0),
    topFraudReferrers: [
      { referrer: 'CryptoKing', fraudCount: 3, totalReferrals: 12, legitRate: '75%' },
      { referrer: 'SurveyMaster', fraudCount: 3, totalReferrals: 8, legitRate: '62%' },
      { referrer: 'Alice', fraudCount: 1, totalReferrals: 4, legitRate: '75%' },
    ],
  };

  res.json({ referrals: data, stats });
});

app.get('/api/admin/referral-monitor/:id', (req, res) => {
  const ref = referralData.find(r => r.refereeId === req.params.id || r.referrerId === req.params.id);
  if (!ref) return res.status(404).json({ message: 'Not found' });
  res.json({ referral: ref });
});

// ============ HEALTH ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: now, mode: 'mock' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n  🚀 Cashli Mock API running on http://localhost:${PORT}`);
  console.log(`  \n  Demo Accounts:`);
  console.log(`  ───────────────`);
  console.log(`  User:  demo@cashli.com / demo123`);
  console.log(`  Admin: admin@cashli.com / Admin@123`);
  console.log(`  \n  Open http://localhost:3000 to see the app!\n`);
});
