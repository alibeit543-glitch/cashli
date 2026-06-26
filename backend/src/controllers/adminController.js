const User = require('../models/User');
const Offer = require('../models/Offer');
const OfferCompletion = require('../models/OfferCompletion');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const FraudAlert = require('../models/FraudAlert');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const RewardService = require('../services/rewardService');
const fraudService = require('../services/fraudDetectionService');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOffers, pendingWithdrawals, pendingCompletions, totalEarnings] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Offer.countDocuments(),
        Withdrawal.countDocuments({ status: 'pending' }),
        OfferCompletion.countDocuments({ status: 'pending' }),
        Transaction.aggregate([
          { $match: { type: 'earning', status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    const usersToday = await User.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email balance totalEarned createdAt');

    res.json({
      stats: {
        totalUsers,
        totalOffers,
        pendingWithdrawals,
        pendingCompletions,
        totalEarnings: totalEarnings[0]?.total || 0,
        usersToday,
      },
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adjustUserBalance = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (amount > 0) {
      await RewardService.addCoins(user._id, amount, `Admin adjustment: ${reason}`, 'bonus');
    } else {
      await RewardService.deductCoins(user._id, Math.abs(amount), `Admin adjustment: ${reason}`, 'purchase');
    }

    res.json({ message: 'Balance adjusted', user: await User.findById(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOffers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Offer.countDocuments(query);
    const offers = await Offer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      offers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Withdrawal.countDocuments(query);
    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'username email balance')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      withdrawals,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    withdrawal.status = status;
    if (adminNotes) withdrawal.adminNotes = adminNotes;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    if (status === 'rejected') {
      await RewardService.addCoins(
        withdrawal.user,
        withdrawal.amount,
        `Withdrawal rejected: ${withdrawal.amount} coins refunded`,
        'withdrawal'
      );
    }

    if (status === 'completed') {
      const user = await User.findById(withdrawal.user);
      user.totalWithdrawn += withdrawal.netAmount;
      await user.save();
    }

    res.json({ withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompletions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await OfferCompletion.countDocuments(query);
    const completions = await OfferCompletion.find(query)
      .populate('user', 'username email')
      .populate('offer', 'title category reward')
      .sort({ completedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      completions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processCompletion = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const completion = await OfferCompletion.findById(req.params.id)
      .populate('offer');

    if (!completion) return res.status(404).json({ message: 'Completion not found' });

    completion.status = status;
    completion.adminNotes = adminNotes || '';
    completion.reviewedAt = new Date();
    completion.reviewedBy = req.user._id;
    await completion.save();

    if (status === 'approved') {
      await RewardService.addCoins(
        completion.user,
        completion.reward,
        `Offer completed: ${completion.offer.title}`,
        'earning',
        completion._id
      );
      await RewardService.addXp(completion.user, completion.xpReward);
      await RewardService.checkAndAwardAchievements(completion.user);

      await Offer.findByIdAndUpdate(completion.offer._id, {
        $inc: { completedSlots: 1 },
      });

      await require('../services/referralService').creditReferralReward(completion.user);
    }

    res.json({ completion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, activeToday, totalWithdrawn, totalEarned, avgEarning] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({
          lastDailyBonus: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
        User.aggregate([
          { $group: { _id: null, total: { $sum: '$totalWithdrawn' } } },
        ]),
        Transaction.aggregate([
          { $match: { type: 'earning', status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        User.aggregate([
          { $match: { totalEarned: { $gt: 0 } } },
          { $group: { _id: null, avg: { $avg: '$totalEarned' } } },
        ]),
      ]);

    res.json({
      totalUsers,
      activeToday,
      totalWithdrawn: totalWithdrawn[0]?.total || 0,
      totalEarned: totalEarned[0]?.total || 0,
      avgEarning: Math.floor(avgEarning[0]?.avg || 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ FRAUD DETECTION ============

exports.getFraudAlerts = async (req, res) => {
  try {
    const status = req.query.status;
    const query = {};
    if (status) query.status = status;

    let alerts;
    try {
      alerts = await FraudAlert.find(query).sort({ createdAt: -1 });
    } catch {
      alerts = [];
    }

    const total = alerts.length;
    const newCount = alerts.filter(a => a.status === 'new').length;

    res.json({ alerts, total, newCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFraudAlert = async (req, res) => {
  try {
    const alert = await FraudAlert.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status, adminNotes: req.body.notes } },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFlaggedUsers = async (req, res) => {
  try {
    const users = Object.entries(fraudService.flaggedUsers)
      .map(([userId, data]) => ({
        userId,
        username: data.username,
        riskScore: data.riskScore,
        reasons: data.reasons,
        totalActions: fraudService.userActionLogs[userId]?.actions?.length || 0,
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const logs = fraudService.userActionLogs[req.params.userId];
    if (!logs) return res.status(404).json({ message: 'No data for this user' });
    const flagged = fraudService.flaggedUsers[req.params.userId];
    res.json({
      userId: logs.userId,
      ip: logs.ip,
      totalActions: logs.actions.length,
      sessionStart: logs.startTime,
      actions: logs.actions.slice(-100),
      fraudFlags: flagged ? { riskScore: flagged.riskScore, reasons: flagged.reasons } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ANALYTICS ============

exports.getAnalytics = async (req, res) => {
  try {
    const days = 30;
    const dailyData = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 50 + 20),
      earnings: Math.floor(Math.random() * 5000 + 1000),
      completions: Math.floor(Math.random() * 30 + 5),
      registrations: Math.floor(Math.random() * 15 + 3),
    }));

    let realUsers = 0, realEarnings = 0, realActive = 0;
    try {
      realUsers = await User.countDocuments();
      const totalEarnings = await Transaction.aggregate([
        { $match: { type: 'earning', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      realEarnings = totalEarnings[0]?.total || 0;
      realActive = await User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 86400000) },
      });
    } catch {}

    res.json({
      overview: {
        totalUsers: realUsers || 1243, activeToday: realActive || 342, activeThisWeek: realActive ? realActive * 3 : 891,
        totalEarnings: realEarnings || 45200, totalWithdrawn: 12500, avgEarning: realUsers ? Math.floor((realEarnings || 0) / realUsers) : 36,
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
      userActivity: sampleActivities(),
      deviceBreakdown: { ios: 45, android: 40, desktop: 15 },
      countryBreakdown: { US: 35, UK: 12, Canada: 10, Germany: 8, France: 7, Other: 28 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function sampleActivities() {
  return [
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
}

// ============ LIVE FEED ============

exports.getLiveFeed = async (req, res) => {
  res.json({
    payments: [
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
    ]
  });
};

// ============ PROTECTION FUND ============

exports.getProtectionFund = async (req, res) => {
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
};

// ============ REFERRAL MONITOR ============

const referralData = [
  { referrer: 'DemoUser', referrerId: 'user_demo_001', referee: 'JohnDoe', refereeId: 'u2', ip: '192.168.1.100', timeDiff: '2 days', refereeActivity: 45, refereeTasks: 12, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 10).toISOString(), flags: [] },
  { referrer: 'DemoUser', referrerId: 'user_demo_001', referee: 'JaneSmith', refereeId: 'u3', ip: '192.168.1.101', timeDiff: '9 days', refereeActivity: 8, refereeTasks: 2, status: 'pending', reward: 50, date: new Date(Date.now() - 86400000 * 5).toISOString(), flags: [] },
  { referrer: 'CryptoKing', referrerId: 'user_010', referee: 'BotAcc01', refereeId: 'fake_01', ip: '10.0.0.1', timeDiff: '2 minutes', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 3).toISOString(), flags: ['REFERRED_OWN_ALT_ACCOUNT', 'SAME_IP', 'ZERO_ACTIVITY'] },
  { referrer: 'CryptoKing', referrerId: 'user_010', referee: 'BotAcc02', refereeId: 'fake_02', ip: '10.0.0.1', timeDiff: '5 minutes', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 3).toISOString(), flags: ['SAME_IP', 'ZERO_ACTIVITY'] },
  { referrer: 'CryptoKing', referrerId: 'user_010', referee: 'BotAcc03', refereeId: 'fake_03', ip: '10.0.0.1', timeDiff: '8 minutes', refereeActivity: 1, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 3).toISOString(), flags: ['SAME_IP', 'CREATED_IN_BURST', 'NO_TASKS_COMPLETED'] },
  { referrer: 'SurveyMaster', referrerId: 'user_011', referee: 'FakeReferral99', refereeId: 'fake_04', ip: '10.0.0.2', timeDiff: '30 seconds', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 2).toISOString(), flags: ['TIME_DIFF_TOO_SHORT', 'ZERO_ACTIVITY', 'SUSPICIOUS_VELOCITY'] },
  { referrer: 'SurveyMaster', referrerId: 'user_011', referee: 'FakeReferral98', refereeId: 'fake_05', ip: '10.0.0.2', timeDiff: '45 seconds', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 2).toISOString(), flags: ['TIME_DIFF_TOO_SHORT', 'ZERO_ACTIVITY', 'SUSPICIOUS_VELOCITY'] },
  { referrer: 'SurveyMaster', referrerId: 'user_011', referee: 'FakeReferral97', refereeId: 'fake_06', ip: '10.0.0.2', timeDiff: '1 minute', refereeActivity: 0, refereeTasks: 0, status: 'fraud', reward: 50, date: new Date(Date.now() - 86400000 * 2).toISOString(), flags: ['TIME_DIFF_TOO_SHORT', 'ZERO_ACTIVITY', 'SUSPICIOUS_VELOCITY'] },
  { referrer: 'OfferHunter', referrerId: 'user_012', referee: 'RealFriend1', refereeId: 'real_01', ip: '203.0.113.50', timeDiff: '2 hours', refereeActivity: 67, refereeTasks: 23, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 7).toISOString(), flags: [] },
  { referrer: 'OfferHunter', referrerId: 'user_012', referee: 'RealFriend2', refereeId: 'real_02', ip: '203.0.113.51', timeDiff: '1 day', refereeActivity: 34, refereeTasks: 8, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 4).toISOString(), flags: [] },
  { referrer: 'Alice', referrerId: 'user_002', referee: 'SuspiciousAcc', refereeId: 'sus_01', ip: '192.168.1.100', timeDiff: '3 hours', refereeActivity: 3, refereeTasks: 0, status: 'flagged', reward: 50, date: new Date(Date.now() - 86400000 * 1).toISOString(), flags: ['SAME_IP_AS_REFERRER', 'NO_TASKS_COMPLETED'] },
];

exports.getReferralMonitor = async (req, res) => {
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
};

exports.getReferralById = async (req, res) => {
  const ref = referralData.find(r => r.refereeId === req.params.id || r.referrerId === req.params.id);
  if (!ref) return res.status(404).json({ message: 'Not found' });
  res.json({ referral: ref });
};

// ============ ADJUST XP ============

exports.adjustUserXp = async (req, res) => {
  try {
    const { xp, level } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (xp !== undefined) user.xp = parseInt(xp);
    if (level !== undefined) user.level = parseInt(level);
    await user.save();

    res.json({ message: 'XP/Level updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
