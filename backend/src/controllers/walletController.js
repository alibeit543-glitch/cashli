const Transaction = require('../models/Transaction');
const { calculateLevelProgress } = require('../utils/helpers');

exports.getBalance = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role === 'admin' || user.role === 'super_admin') {
      return res.status(403).json({ message: 'Admins do not have a wallet' });
    }

    const levelProgress = calculateLevelProgress(user.xp || 0);

    res.json({
      balance: user.balance || 0,
      totalEarned: user.totalEarned || 0,
      totalWithdrawn: user.totalWithdrawn || 0,
      xp: user.xp || 0,
      level: user.level || 1,
      levelProgress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
