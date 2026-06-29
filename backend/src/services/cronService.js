const Withdrawal = require('../models/Withdrawal');
const Setting = require('../models/Setting');

async function checkOverdueWithdrawals() {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const pending = await Withdrawal.find({ status: { $in: ['pending', 'suspicious'] }, createdAt: { $lte: twentyFourHoursAgo } });

  for (const wd of pending) {
    if (!wd.reviewReminderSent) {
      wd.reviewReminderSent = true;
      await wd.save();
    }
    if (wd.createdAt <= fortyEightHoursAgo && !wd.escalationSent) {
      wd.escalationSent = true;
      await wd.save();
    }
  }
}

async function getAlertStats() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const overdue24h = await Withdrawal.countDocuments({
    status: { $in: ['pending', 'suspicious'] },
    createdAt: { $lte: twentyFourHoursAgo },
    reviewReminderSent: false,
  });

  const escalated48h = await Withdrawal.countDocuments({
    status: { $in: ['pending', 'suspicious'] },
    createdAt: { $lte: fortyEightHoursAgo },
    escalationSent: true,
  });

  return { overdue24h, escalated48h };
}

module.exports = { checkOverdueWithdrawals, getAlertStats };
