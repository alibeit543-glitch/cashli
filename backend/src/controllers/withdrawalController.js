const Withdrawal = require('../models/Withdrawal');
const { MIN_WITHDRAWAL } = require('../utils/constants');
const RewardService = require('../services/rewardService');

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;
    const user = req.user;

    const minAmount = MIN_WITHDRAWAL[method] || 500;
    if (amount < minAmount) {
      return res.status(400).json({
        message: `Minimum withdrawal for ${method} is ${minAmount} coins`,
      });
    }

    if (amount > user.balance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const feeRate = 0.05;
    const fee = Math.floor(amount * feeRate);
    const netAmount = amount - fee;

    const withdrawal = await Withdrawal.create({
      user: user._id,
      amount,
      fee,
      netAmount,
      method,
      accountDetails,
    });

    await RewardService.deductCoins(
      user._id,
      amount,
      `Withdrawal request: ${amount} coins via ${method}`,
      'withdrawal',
      withdrawal._id
    );

    res.status(201).json({ withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWithdrawalMethods = async (req, res) => {
  res.json({
    methods: [
      {
        id: 'paypal',
        name: 'PayPal',
        minAmount: MIN_WITHDRAWAL.paypal,
        icon: 'paypal',
        description: 'Withdraw to your PayPal account',
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        minAmount: MIN_WITHDRAWAL.crypto,
        icon: 'crypto',
        description: 'Withdraw in BTC, ETH, or USDT',
      },
      {
        id: 'giftcard',
        name: 'Gift Card',
        minAmount: MIN_WITHDRAWAL.giftcard,
        icon: 'gift',
        description: 'Amazon, Google Play, Steam & more',
      },
    ],
  });
};
