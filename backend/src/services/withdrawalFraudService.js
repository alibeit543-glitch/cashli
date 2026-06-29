const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const OfferCompletion = require('../models/OfferCompletion');
const Transaction = require('../models/Transaction');
const FraudFlag = require('../models/FraudFlag');

const FRAUD_CHECKS = [
  {
    id: 'account_age',
    name: 'Account Age Check',
    severity: 'high',
    check: async (user) => {
      const ageDays = (Date.now() - new Date(user.createdAt).getTime()) / 86400000;
      if (ageDays < 7) {
        return { flagged: true, detail: `Account is only ${Math.floor(ageDays)} days old (minimum 7 days)`, recommendation: 'Hold for manual review' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'first_cashout_24h',
    name: 'First Cashout Within 24h',
    severity: 'critical',
    check: async (user) => {
      if (user.totalWithdrawalRequests > 0) return { flagged: false };
      const ageHours = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
      if (ageHours < 24) {
        return { flagged: true, detail: `First cashout requested only ${Math.floor(ageHours)} hours after signup`, recommendation: 'Block until 24h have passed' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'balance_earned_24h',
    name: 'Full Balance Earned in <24h',
    severity: 'critical',
    check: async (user) => {
      const recentEarnings = await Transaction.find({
        user: user._id,
        type: 'earning',
        createdAt: { $gte: new Date(Date.now() - 86400000) }
      });
      const earned24h = recentEarnings.reduce((s, t) => s + t.amount, 0);
      if (earned24h >= user.balance * 0.8 && user.balance > 100) {
        return { flagged: true, detail: `${earned24h.toFixed(0)} coins earned in 24h — ${((earned24h / user.balance) * 100).toFixed(0)}% of current balance`, recommendation: 'Full review' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'offers_velocity',
    name: 'Offer Velocity (>10 in 1 hour)',
    severity: 'high',
    check: async (user) => {
      const hourAgo = new Date(Date.now() - 3600000);
      const recentCompletions = await OfferCompletion.countDocuments({
        user: user._id,
        completedAt: { $gte: hourAgo }
      });
      if (recentCompletions > 10) {
        return { flagged: true, detail: `${recentCompletions} offers completed in 1 hour (max 10)`, recommendation: 'Suspend account pending review' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'single_offer_type',
    name: 'All Earnings From One Offer Type',
    severity: 'medium',
    check: async (user) => {
      const completions = await OfferCompletion.find({ user: user._id }).populate('offer', 'category').limit(50);
      if (completions.length < 3) return { flagged: false };
      const categories = {};
      completions.forEach(c => { if (c.offer) categories[c.offer.category] = (categories[c.offer.category] || 0) + 1; });
      const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      if (topCat && (topCat[1] / completions.length) > 0.9) {
        return { flagged: true, detail: `${(topCat[1] / completions.length * 100).toFixed(0)}% of completions from "${topCat[0]}"`, recommendation: 'Check for automated behavior' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'same_ip_accounts',
    name: 'Multiple Accounts From Same IP',
    severity: 'high',
    check: async (user) => {
      if (!user.ipAddresses || user.ipAddresses.length === 0) return { flagged: false };
      for (const ip of user.ipAddresses) {
        const count = await User.countDocuments({ ipAddresses: ip, _id: { $ne: user._id } });
        if (count > 2) {
          return { flagged: true, detail: `IP ${ip} linked to ${count + 1} accounts`, recommendation: 'Investigate multi-account farming' };
        }
      }
      return { flagged: false };
    }
  },
  {
    id: 'payment_changed_48h',
    name: 'Payment Info Changed in 48h',
    severity: 'medium',
    check: async (user) => {
      return { flagged: false };
    }
  },
  {
    id: 'large_cashout_after_topup',
    name: 'Large Cashout After Top-Up',
    severity: 'high',
    check: async (user, withdrawal) => {
      const recentTopups = await Transaction.find({
        user: user._id,
        type: 'bonus',
        createdAt: { $gte: new Date(Date.now() - 86400000 * 2) }
      });
      const topupAmount = recentTopups.reduce((s, t) => s + t.amount, 0);
      if (topupAmount > 0 && withdrawal.amount >= topupAmount * 0.8) {
        return { flagged: true, detail: `Cashout of ${withdrawal.amount} immediately after ${topupAmount} bonus/referral top-up`, recommendation: 'Verify earnings source' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'bot_like_pattern',
    name: 'Bot-Like Activity Pattern',
    severity: 'high',
    check: async (user) => {
      const completions = await OfferCompletion.find({ user: user._id }).sort({ completedAt: 1 }).limit(50);
      if (completions.length < 5) return { flagged: false };
      const intervals = [];
      for (let i = 1; i < completions.length; i++) {
        intervals.push(completions[i].completedAt - completions[i - 1].completedAt);
      }
      const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      const uniform = intervals.every(i => Math.abs(i - avgInterval) < 2000);
      if (uniform && completions.length > 10) {
        return { flagged: true, detail: 'Uniform completion intervals suggest automated bot activity', recommendation: 'Ban account' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'previous_rejected',
    name: 'Previously Rejected Withdrawals',
    severity: 'medium',
    check: async (user) => {
      const rejected = await Withdrawal.countDocuments({ user: user._id, status: 'rejected' });
      if (rejected > 0) {
        return { flagged: true, detail: `${rejected} previous rejected withdrawal(s)`, recommendation: 'Manual review required' };
      }
      return { flagged: false };
    }
  },
  {
    id: 'cashout_frequency',
    name: '>3 Cashout Requests in 7 Days',
    severity: 'medium',
    check: async (user) => {
      const weekAgo = new Date(Date.now() - 86400000 * 7);
      const recent = await Withdrawal.countDocuments({ user: user._id, createdAt: { $gte: weekAgo } });
      if (recent > 3) {
        return { flagged: true, detail: `${recent} cashout requests in the last 7 days`, recommendation: 'Cap frequency' };
      }
      return { flagged: false };
    }
  },
];

async function runFraudChecks(user, withdrawal) {
  const flags = [];
  for (const check of FRAUD_CHECKS) {
    try {
      const result = await check.check(user, withdrawal);
      if (result.flagged) {
        flags.push({
          flagType: check.id,
          severity: check.severity,
          detail: result.detail,
          recommendation: result.recommendation || 'Review required',
        });
      }
    } catch (err) {
      console.error(`Fraud check ${check.id} failed:`, err.message);
    }
  }
  return flags;
}

async function scanWithdrawal(withdrawal, user) {
  const flags = await runFraudChecks(user, withdrawal);

  let fraudScore = 0;
  const severityScores = { low: 10, medium: 25, high: 50, critical: 80 };
  flags.forEach(f => { fraudScore += severityScores[f.severity] || 10; });
  fraudScore = Math.min(100, fraudScore);

  const hasSuspicious = flags.some(f => f.severity === 'high' || f.severity === 'critical');

  withdrawal.fraudFlags = flags;
  withdrawal.fraudScore = fraudScore;
  if (hasSuspicious) {
    withdrawal.status = 'suspicious';
  }

  await withdrawal.save();

  for (const flag of flags) {
    await FraudFlag.create({
      user: user._id,
      withdrawal: withdrawal._id,
      flagType: flag.flagType,
      severity: flag.severity,
      detail: flag.detail,
      recommendation: flag.recommendation,
    });
  }

  return { flags, fraudScore, isSuspicious: hasSuspicious };
}

module.exports = { scanWithdrawal, FRAUD_CHECKS };
