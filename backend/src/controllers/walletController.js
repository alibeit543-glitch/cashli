const Transaction = require('../models/Transaction');
const { calculateLevelProgress } = require('../utils/helpers');

exports.getBalance = async (req, res) => {
  try {
    const user = req.user;
    const levelProgress = calculateLevelProgress(user.xp);

    res.json({
      balance: user.balance,
      totalEarned: user.totalEarned,
      totalWithdrawn: user.totalWithdrawn,
      xp: user.xp,
      level: user.level,
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
