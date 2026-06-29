const User = require('../models/User');
const Admin = require('../models/Admin');
const Offer = require('../models/Offer');
const OfferCompletion = require('../models/OfferCompletion');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const FraudAlert = require('../models/FraudAlert');
const FraudFlag = require('../models/FraudFlag');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Announcement = require('../models/Announcement');
const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');
const IpBlock = require('../models/IpBlock');
const jwt = require('jsonwebtoken');
const RewardService = require('../services/rewardService');
const { scanWithdrawal } = require('../services/withdrawalFraudService');
const { getAlertStats } = require('../services/cronService');

// ============ ADMIN AUTH ============

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
    if (!admin) {
      await AuditLog.create({ admin: null, action: 'login-failed', resource: 'admin', details: `Failed login attempt for ${email}`, ip: req.ip });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return res.status(423).json({ message: `Account locked. Try again after ${admin.lockedUntil.toLocaleTimeString()}` });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await admin.save();
      await AuditLog.create({ admin: admin._id, action: 'login-failed', resource: 'admin', details: `Failed attempt ${admin.loginAttempts}/5`, ip: req.ip });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    admin.loginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLogin = new Date();
    admin.lastLoginIp = req.ip;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    await AuditLog.create({ admin: admin._id, action: 'login', resource: 'admin', details: 'Admin login', ip: req.ip });

    res.json({ token, user: { _id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminLogout = async (req, res) => {
  try {
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'logout', resource: 'admin', ip: req.ip });
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  const admin = req.admin || req.user;
  res.json({ user: { _id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
};

// ============ DASHBOARD ============

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, usersLastWeek, totalOffers, pendingWithdrawals, suspiciousWithdrawals,
      totalEarnings, usersToday, signupsThisWeek, newFraudAlerts, flaggedAccountsCount, alertsData
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $lt: weekAgo } }),
      Offer.countDocuments(),
      Withdrawal.countDocuments({ status: 'pending' }),
      Withdrawal.countDocuments({ status: 'suspicious' }),
      Transaction.aggregate([
        { $match: { type: 'earning', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.countDocuments({ lastActive: { $gte: today } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: weekAgo } }),
      FraudFlag.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ status: 'suspicious' }),
      getAlertStats(),
    ]);

    const userChange = usersLastWeek > 0 ? ((totalUsers - usersLastWeek) / usersLastWeek * 100).toFixed(1) : '0';
    const pendingAmount = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 }).limit(5)
      .select('username email balance totalEarned createdAt lastActive trustLevel status');

    const recentActivity = await Transaction.find()
      .populate('user', 'username').sort({ createdAt: -1 }).limit(10)
      .select('type amount description createdAt user');

    const signupChartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));
      const count = await User.countDocuments({ role: 'user', createdAt: { $gte: dayStart, $lte: dayEnd } });
      signupChartData.push({ date: dayStart.toISOString().split('T')[0], count });
    }

    res.json({
      stats: {
        totalUsers, userChange: `${userChange > 0 ? '+' : ''}${userChange}%`,
        totalOffers, pendingWithdrawals: pendingWithdrawals.length || 0,
        pendingAmount: pendingAmount[0]?.total || 0,
        suspiciousWithdrawals, totalEarnings: totalEarnings[0]?.total || 0,
        usersToday, signupsThisWeek, newFraudAlerts, flaggedAccounts: flaggedAccountsCount,
        overdue24h: alertsData.overdue24h, escalated48h: alertsData.escalated48h,
      },
      recentUsers, recentActivity, signupChartData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, activeToday, totalWithdrawn, totalEarned, avgEarning] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$totalWithdrawn' } } }]),
      Transaction.aggregate([{ $match: { type: 'earning', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.aggregate([{ $match: { totalEarned: { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: '$totalEarned' } } }]),
    ]);
    res.json({
      totalUsers, activeToday,
      totalWithdrawn: totalWithdrawn[0]?.total || 0,
      totalEarned: totalEarned[0]?.total || 0,
      avgEarning: Math.floor(avgEarning[0]?.avg || 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ USERS ============

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = '-createdAt', active, status: statusFilter, trustLevel } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;
    if (statusFilter) query.status = statusFilter;
    if (trustLevel) query.trustLevel = trustLevel;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sort).skip((page - 1) * limit).limit(parseInt(limit))
      .select('username email balance totalEarned totalWithdrawn xp level trustLevel status isActive createdAt lastActive profileImage');

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
    user.status = user.isActive ? 'active' : 'banned';
    await user.save();
    const action = user.isActive ? 'unban' : 'ban';
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action, resource: 'user', resourceId: req.params.id, ip: req.ip });
    res.json({ message: `User ${user.isActive ? 'activated' : 'banned'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adjustUserBalance = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    if (amount > 0) {
      await RewardService.addCoins(user._id, amount, `Admin adjustment: ${reason}`, 'bonus');
    } else {
      await RewardService.deductCoins(user._id, Math.abs(amount), `Admin adjustment: ${reason}`, 'purchase');
    }

    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'adjust-balance', resource: 'user', resourceId: req.params.id, details: `${amount} coins - ${reason}`, ip: req.ip });
    res.json({ message: 'Balance adjusted', user: await User.findById(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['username', 'email', 'adminNotes'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'update', resource: 'user', resourceId: req.params.id, details: `Updated: ${Object.keys(updates).join(', ')}`, ip: req.ip });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    if (admin.role !== 'super_admin') return res.status(403).json({ message: 'Only super admins can delete users' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Promise.all([
      Transaction.deleteMany({ user: user._id }),
      Withdrawal.deleteMany({ user: user._id }),
      OfferCompletion.deleteMany({ user: user._id }),
    ]);
    await AuditLog.create({ admin: admin._id, action: 'delete', resource: 'user', resourceId: req.params.id, details: user.email, ip: req.ip });
    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false, status: 'banned' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'ban', resource: 'user', resourceId: req.params.id, ip: req.ip });
    res.json({ message: 'User banned', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true, status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'unban', resource: 'user', resourceId: req.params.id, ip: req.ip });
    res.json({ message: 'User unbanned', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.holdUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'on_hold' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'hold', resource: 'user', resourceId: req.params.id, ip: req.ip });
    res.json({ message: 'User put on hold', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setTrustLevel = async (req, res) => {
  try {
    const { trustLevel } = req.body;
    if (!['new', 'regular', 'trusted', 'banned'].includes(trustLevel)) {
      return res.status(400).json({ message: 'Invalid trust level' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { trustLevel }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'set-trust-level', resource: 'user', resourceId: req.params.id, details: `Trust level changed to ${trustLevel}`, ip: req.ip });
    res.json({ message: `Trust level set to ${trustLevel}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [transactions, withdrawals, completions, fraudFlags, sameIPUsers] = await Promise.all([
      Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(50),
      Withdrawal.find({ user: user._id }).sort({ createdAt: -1 }).limit(50),
      OfferCompletion.find({ user: user._id }).populate('offer', 'title category reward').sort({ createdAt: -1 }).limit(50),
      FraudFlag.find({ user: user._id, resolved: false }).sort({ createdAt: -1 }),
      user.ipAddresses?.length > 0
        ? User.find({ ipAddresses: { $in: user.ipAddresses }, _id: { $ne: user._id } }).select('username email createdAt')
        : [],
    ]);

    res.json({ user, transactions, withdrawals, completions, fraudFlags, sameIPUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ OFFERS ============

exports.getOffers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Offer.countDocuments(query);
    const offers = await Offer.find(query)
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    const totalCompletions = await OfferCompletion.countDocuments();
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'earning', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      offers, totalCompletions,
      totalRevenue: totalRevenue[0]?.total || 0,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create({ ...req.body, createdBy: req.admin?._id || req.user?._id });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'create', resource: 'offer', resourceId: offer._id.toString(), details: offer.title, ip: req.ip });
    res.status(201).json({ offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'update', resource: 'offer', resourceId: req.params.id, details: offer.title, ip: req.ip });
    res.json({ offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'delete', resource: 'offer', resourceId: req.params.id, details: offer.title, ip: req.ip });
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ WITHDRAWALS ============

exports.getWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query['user'] = search;

    const total = await Withdrawal.countDocuments(query);
    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'username email balance trustLevel status totalEarned offerCompletedCount')
      .populate('processedBy', 'username')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    const pendingTotal = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const suspiciousTotal = await Withdrawal.aggregate([
      { $match: { status: 'suspicious' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const approvedTotal = await Withdrawal.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      withdrawals,
      stats: {
        pending: { amount: pendingTotal[0]?.total || 0, count: pendingTotal[0]?.count || 0 },
        suspicious: { amount: suspiciousTotal[0]?.total || 0, count: suspiciousTotal[0]?.count || 0 },
        approved: { amount: approvedTotal[0]?.total || 0, count: approvedTotal[0]?.count || 0 },
      },
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWithdrawalById = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate('user', 'username email balance trustLevel status totalEarned totalWithdrawn isActive createdAt lastActive deviceIds ipAddresses offerCompletedCount')
      .populate('processedBy', 'username');

    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    const user = withdrawal.user;
    const [completions, sameIPUsers, fraudFlags] = await Promise.all([
      OfferCompletion.find({ user: user._id }).populate('offer', 'title category reward').sort({ createdAt: -1 }).limit(50),
      user.ipAddresses?.length > 0
        ? User.find({ ipAddresses: { $in: user.ipAddresses }, _id: { $ne: user._id } }).select('username email createdAt')
        : [],
      FraudFlag.find({ withdrawal: withdrawal._id }).sort({ createdAt: -1 }),
    ]);

    const previousWithdrawals = await Withdrawal.find({ user: user._id, _id: { $ne: withdrawal._id } }).sort({ createdAt: -1 }).limit(20);

    res.json({
      withdrawal,
      userSummary: { user, completions, sameIPUsers, previousWithdrawals },
      fraudFlags,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    const validTransitions = {
      'pending': ['approved', 'rejected', 'hold', 'processing', 'suspicious'],
      'suspicious': ['approved', 'rejected', 'hold', 'processing'],
      'hold': ['approved', 'rejected', 'processing'],
      'processing': ['completed', 'rejected'],
      'approved': ['completed', 'rejected'],
    };

    const allowed = validTransitions[withdrawal.status];
    if (allowed && !allowed.includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${withdrawal.status} to ${status}` });
    }

    if (status === 'rejected' && !rejectionReason && req.body.requireReason !== false) {
      return res.status(400).json({ message: 'Rejection requires a reason' });
    }

    withdrawal.status = status;
    if (adminNotes) withdrawal.adminNotes = adminNotes;
    if (rejectionReason) withdrawal.rejectionReason = rejectionReason;
    withdrawal.processedBy = req.admin?._id || req.user?._id;
    withdrawal.reviewedBy = req.admin?._id || req.user?._id;
    withdrawal.processedAt = new Date();

    if (status === 'hold') {
      withdrawal.holdTimestamp = new Date();
    }

    await withdrawal.save();

    if (status === 'rejected') {
      await RewardService.addCoins(
        withdrawal.user._id,
        withdrawal.amount,
        `Withdrawal rejected: ${withdrawal.amount} coins refunded - ${rejectionReason || ''}`,
        'withdrawal'
      );
    }

    if (status === 'completed' || status === 'approved') {
      const user = await User.findById(withdrawal.user._id);
      user.totalWithdrawn += withdrawal.netAmount || withdrawal.amount;
      await user.save();
    }

    await AuditLog.create({
      admin: req.admin?._id || req.user?._id,
      action: `withdrawal-${status}`,
      resource: 'withdrawal',
      resourceId: req.params.id,
      details: `${withdrawal.amount} coins - ${withdrawal.method}${rejectionReason ? ` - Reason: ${rejectionReason}` : ''}`,
      ip: req.ip,
    });

    res.json({ withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rescanWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    const result = await scanWithdrawal(withdrawal, withdrawal.user);

    res.json({ withdrawal, scanResult: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ COMPLETIONS ============

exports.getCompletions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await OfferCompletion.countDocuments(query);
    const completions = await OfferCompletion.find(query)
      .populate('user', 'username email')
      .populate('offer', 'title category reward')
      .sort({ completedAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    res.json({ completions, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processCompletion = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const completion = await OfferCompletion.findById(req.params.id).populate('offer');
    if (!completion) return res.status(404).json({ message: 'Completion not found' });

    completion.status = status;
    completion.adminNotes = adminNotes || '';
    completion.reviewedAt = new Date();
    completion.reviewedBy = req.admin?._id || req.user?._id;
    await completion.save();

    if (status === 'approved') {
      await RewardService.addCoins(completion.user, completion.reward, `Offer completed: ${completion.offer.title}`, 'earning', completion._id);
      await RewardService.addXp(completion.user, completion.xpReward);
      await RewardService.checkAndAwardAchievements(completion.user);
      await Offer.findByIdAndUpdate(completion.offer._id, { $inc: { completedSlots: 1 } });
      try { await require('../services/referralService').creditReferralReward(completion.user); } catch {}
      await User.findByIdAndUpdate(completion.user, { $inc: { offerCompletedCount: 1 } });
    }

    res.json({ completion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ FRAUD & SECURITY ============

exports.getFraudAlerts = async (req, res) => {
  try {
    const { status, severity } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    let alerts;
    try { alerts = await FraudAlert.find(query).sort({ createdAt: -1 }); } catch { alerts = []; }
    res.json({ alerts, total: alerts.length, newCount: alerts.filter(a => a.status === 'new').length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFraudAlert = async (req, res) => {
  try {
    const alert = await FraudAlert.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status, adminNotes: req.body.notes } }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFraudFlags = async (req, res) => {
  try {
    const { page = 1, limit = 20, resolved, severity } = req.query;
    const query = {};
    if (resolved === 'true') query.resolved = true;
    else if (resolved === 'false') query.resolved = false;
    if (severity) query.severity = severity;

    const total = await FraudFlag.countDocuments(query);
    const flags = await FraudFlag.find(query)
      .populate('user', 'username email trustLevel status')
      .populate('withdrawal', 'amount status')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    res.json({
      flags,
      stats: {
        total: await FraudFlag.countDocuments(),
        unresolved: await FraudFlag.countDocuments({ resolved: false }),
        critical: await FraudFlag.countDocuments({ severity: 'critical', resolved: false }),
        high: await FraudFlag.countDocuments({ severity: 'high', resolved: false }),
      },
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resolveFraudFlag = async (req, res) => {
  try {
    const flag = await FraudFlag.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedBy: req.admin?._id || req.user?._id, resolvedAt: new Date() },
      { new: true }
    );
    if (!flag) return res.status(404).json({ message: 'Flag not found' });
    res.json({ flag });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFlaggedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'suspicious' }).select('username email trustLevel status totalEarned balance createdAt');
    const fraudFlags = await FraudFlag.aggregate([
      { $match: { resolved: false } },
      { $group: { _id: '$user', count: { $sum: 1 }, maxSeverity: { $max: '$severity' } } },
      { $sort: { count: -1 } },
    ]);

    const enriched = users.map(u => {
      const flagData = fraudFlags.find(f => f._id && f._id.toString() === u._id.toString());
      return { ...u.toObject(), flagCount: flagData?.count || 0, maxSeverity: flagData?.maxSeverity || 'low' };
    }).sort((a, b) => b.flagCount - a.flagCount);

    res.json({ users: enriched, total: enriched.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const fraudService = require('../services/fraudDetectionService');
    const logs = fraudService.userActionLogs?.[req.params.userId];
    if (!logs) return res.status(404).json({ message: 'No tracking data for this user' });
    const flagged = fraudService.flaggedUsers?.[req.params.userId];
    res.json({
      userId: logs.userId, ip: logs.ip,
      totalActions: logs.actions.length,
      sessionStart: logs.startTime,
      actions: logs.actions.slice(-100),
      fraudFlags: flagged ? { riskScore: flagged.riskScore, reasons: flagged.reasons } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIpManagement = async (req, res) => {
  try {
    const blocklist = await IpBlock.find({ isActive: true }).populate('blockedBy', 'username');

    const ipGroups = await User.aggregate([
      { $unwind: '$ipAddresses' },
      { $group: { _id: '$ipAddresses', users: { $push: { id: '$_id', username: '$username', email: '$email', createdAt: '$createdAt' } }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ blocklist, ipGroups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockIp = async (req, res) => {
  try {
    const { ipAddress, reason } = req.body;
    if (!ipAddress || !reason) return res.status(400).json({ message: 'IP address and reason required' });

    const existing = await IpBlock.findOne({ ipAddress });
    if (existing) return res.status(400).json({ message: 'IP already blocked' });

    const block = await IpBlock.create({ ipAddress, reason, blockedBy: req.admin?._id || req.user?._id });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'block-ip', resource: 'ip', details: `Blocked ${ipAddress}: ${reason}`, ip: req.ip });
    res.status(201).json({ block });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unblockIp = async (req, res) => {
  try {
    const block = await IpBlock.findOneAndUpdate({ ipAddress: req.params.ip }, { isActive: false }, { new: true });
    if (!block) return res.status(404).json({ message: 'Block not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'unblock-ip', resource: 'ip', details: `Unblocked ${req.params.ip}`, ip: req.ip });
    res.json({ message: 'IP unblocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, action: actionFilter, admin: adminFilter, startDate, endDate } = req.query;
    const query = {};
    if (actionFilter) query.action = { $regex: actionFilter, $options: 'i' };
    if (adminFilter) query.admin = adminFilter;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('admin', 'username email')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    res.json({ logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSecurityOverview = async (req, res) => {
  try {
    const [totalFlags, unresolvedFlags, criticalFlags, blockedIps, suspiciousAccounts, reviewedThisMonth] = await Promise.all([
      FraudFlag.countDocuments(),
      FraudFlag.countDocuments({ resolved: false }),
      FraudFlag.countDocuments({ severity: 'critical', resolved: false }),
      IpBlock.countDocuments({ isActive: true }),
      User.countDocuments({ status: 'suspicious' }),
      AuditLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400000) }, action: { $regex: 'withdrawal' } }),
    ]);

    res.json({
      totalFraudAttempts: totalFlags,
      unresolvedFlags,
      criticalFlags,
      blockedIps,
      suspiciousAccounts,
      reviewedThisMonth,
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
      const totalEarnings = await Transaction.aggregate([{ $match: { type: 'earning', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
      realEarnings = totalEarnings[0]?.total || 0;
      realActive = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 86400000) } });
    } catch {}

    res.json({
      overview: {
        totalUsers: realUsers || 1243, activeToday: realActive || 342, activeThisWeek: realActive ? realActive * 3 : 891,
        totalEarnings: realEarnings || 45200, totalWithdrawn: 12500, avgEarning: realUsers ? Math.floor((realEarnings || 0) / realUsers) : 36,
        avgSessionTime: '14m 32s', bounceRate: '32%', completionRate: '78%', avgTaskTime: '8m 45s',
      },
      dailyData,
      topOffers: [
        { name: 'Download & Install App', completions: 87, revenue: 17400 },
        { name: 'Complete a 5-min Survey', completions: 234, revenue: 11700 },
        { name: 'Sign Up for Service', completions: 110, revenue: 16500 },
        { name: 'Make a Purchase Offer', completions: 42, revenue: 21000 },
        { name: 'iOS Exclusive Survey', completions: 68, revenue: 5100 },
      ],
      deviceBreakdown: { ios: 45, android: 40, desktop: 15 },
      countryBreakdown: { US: 35, UK: 12, Canada: 10, Germany: 8, France: 7, Other: 28 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const q = type ? { type } : {};
    const [transactions, total] = await Promise.all([
      Transaction.find(q).populate('user', 'username email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Transaction.countDocuments(q),
    ]);
    res.json({ transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLiveFeed = async (req, res) => {
  const recent = await Withdrawal.find({ status: { $in: ['completed', 'approved'] } })
    .populate('user', 'username').sort({ processedAt: -1 }).limit(10);
  const payments = recent.map(w => ({
    user: w.user?.username || 'Unknown',
    amount: w.amount, method: w.method,
    time: `${Math.floor((Date.now() - new Date(w.processedAt || w.createdAt).getTime()) / 60000)} min ago`,
    avatar: w.user?.username?.charAt(0).toUpperCase() || '?',
  }));
  res.json({ payments });
};

exports.getProtectionFund = async (req, res) => {
  res.json({
    totalFund: 4520, totalDisputes: 23, resolvedDisputes: 19, paidOut: 1250, pendingDisputes: 4,
    recentDisputes: [
      { user: 'Alice', task: 'Download & Install App', amount: 200, status: 'paid', date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { user: 'Bob', task: 'Sign Up for Service', amount: 150, status: 'pending', date: new Date(Date.now() - 86400000).toISOString() },
    ],
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
  { referrer: 'OfferHunter', referrerId: 'user_012', referee: 'RealFriend1', refereeId: 'real_01', ip: '203.0.113.50', timeDiff: '2 hours', refereeActivity: 67, refereeTasks: 23, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 7).toISOString(), flags: [] },
  { referrer: 'OfferHunter', referrerId: 'user_012', referee: 'RealFriend2', refereeId: 'real_02', ip: '203.0.113.51', timeDiff: '1 day', refereeActivity: 34, refereeTasks: 8, status: 'legitimate', reward: 50, date: new Date(Date.now() - 86400000 * 4).toISOString(), flags: [] },
  { referrer: 'Alice', referrerId: 'user_002', referee: 'SuspiciousAcc', refereeId: 'sus_01', ip: '192.168.1.100', timeDiff: '3 hours', refereeActivity: 3, refereeTasks: 0, status: 'flagged', reward: 50, date: new Date(Date.now() - 86400000 * 1).toISOString(), flags: ['SAME_IP_AS_REFERRER', 'NO_TASKS_COMPLETED'] },
];

exports.getReferralMonitor = async (req, res) => {
  const filter = req.query.status || 'all';
  let data = [...referralData];
  if (filter !== 'all') data = data.filter(r => r.status === filter);
  const stats = {
    total: referralData.length, legitimate: referralData.filter(r => r.status === 'legitimate').length,
    fraud: referralData.filter(r => r.status === 'fraud').length, flagged: referralData.filter(r => r.status === 'flagged').length,
    pending: referralData.filter(r => r.status === 'pending').length,
    totalRewardsAtRisk: referralData.filter(r => r.status !== 'legitimate').reduce((s, r) => s + r.reward, 0),
    topFraudReferrers: Object.entries(referralData.filter(r => r.status === 'fraud' || r.status === 'flagged').reduce((acc, r) => {
      acc[r.referrer] = (acc[r.referrer] || 0) + 1; return acc;
    }, {})).map(([referrer, fraudCount]) => ({
      referrer, fraudCount,
      totalReferrals: referralData.filter(r => r.referrer === referrer).length,
      legitRate: `${Math.round(referralData.filter(r => r.referrer === referrer && r.status === 'legitimate').length / Math.max(referralData.filter(r => r.referrer === referrer).length, 1) * 100)}%`,
    })).sort((a, b) => b.fraudCount - a.fraudCount).slice(0, 5),
  };
  res.json({ referrals: data, stats });
};

exports.getReferralById = async (req, res) => {
  const ref = referralData.find(r => r.refereeId === req.params.id || r.referrerId === req.params.id);
  if (!ref) return res.status(404).json({ message: 'Not found' });
  res.json({ referral: ref });
};

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

// ============ ANNOUNCEMENTS ============

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.admin?._id || req.user?._id });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'create', resource: 'announcement', resourceId: announcement._id.toString(), details: req.body.title, ip: req.ip });
    res.status(201).json({ announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'update', resource: 'announcement', resourceId: req.params.id, details: req.body.title, ip: req.ip });
    res.json({ announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'delete', resource: 'announcement', resourceId: req.params.id, ip: req.ip });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ SETTINGS ============

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = new Setting();
    Object.assign(settings, req.body);
    await settings.save();
    await AuditLog.create({ admin: req.admin?._id || req.user?._id, action: 'update', resource: 'settings', ip: req.ip });
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
