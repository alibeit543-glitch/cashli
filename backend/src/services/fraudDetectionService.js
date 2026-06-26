const FRAUD_RULES = {
  MIN_STEP_INTERVAL: 500,
  MAX_TASKS_PER_HOUR: 20,
  MAX_TASKS_PER_DAY: 100,
  MIN_SESSION_TIME: 3000,
  MAX_ACCOUNTS_PER_IP: 3,
  SUSPICIOUS_TIME_RANGE: [0, 6],
};

const REFERRAL_FRAUD_RULES = {
  MIN_REFERRAL_TIME: 60000,
  MAX_REFERRALS_PER_HOUR: 5,
  MIN_REFEREE_ACTIVITY: 5,
  MIN_REFEREE_TASKS: 1,
  SAME_IP_FLAG: true,
};

const userActionLogs = {};
const flaggedUsers = {};

function analyzeUserActivity(userId, username) {
  const logs = userActionLogs[userId];
  if (!logs || logs.actions.length < 3) return { riskScore: 0, flags: [] };

  const flags = [];
  const actions = logs.actions;
  const now = Date.now();

  if (actions.length >= 3) {
    const intervals = [];
    for (let i = 1; i < actions.length; i++) {
      intervals.push(actions[i].timestamp - actions[i - 1].timestamp);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avgInterval < FRAUD_RULES.MIN_STEP_INTERVAL) {
      flags.push({ type: 'bot', severity: 'critical', name: 'Bot Pattern Detected', description: `Average time between steps: ${avgInterval.toFixed(0)}ms. Threshold is ${FRAUD_RULES.MIN_STEP_INTERVAL}ms.`, score: 35 });
    }
    const uniqueIntervals = new Set(intervals.map(i => Math.round(i / 100) * 100));
    if (uniqueIntervals.size <= 2 && intervals.length > 5) {
      flags.push({ type: 'bot', severity: 'critical', name: 'Scripted Behavior', description: 'All action intervals are nearly identical (scripted automation).', score: 30 });
    }
  }

  const lastHour = actions.filter(a => a.type === 'task_complete' && (now - a.timestamp) < 3600000);
  if (lastHour.length > FRAUD_RULES.MAX_TASKS_PER_HOUR) {
    flags.push({ type: 'velocity', severity: 'high', name: 'Task Velocity Anomaly', description: `${lastHour.length} tasks completed in the last hour. Normal max: ${FRAUD_RULES.MAX_TASKS_PER_HOUR}.`, score: 25 });
  }
  const lastDay = actions.filter(a => a.type === 'task_complete' && (now - a.timestamp) < 86400000);
  if (lastDay.length > FRAUD_RULES.MAX_TASKS_PER_DAY) {
    flags.push({ type: 'velocity', severity: 'high', name: 'Daily Task Limit Exceeded', description: `${lastDay.length} tasks in 24h. Impossible for a human.`, score: 20 });
  }

  const shortSessions = actions.filter(a => a.type === 'session_end' && a.duration && a.duration < FRAUD_RULES.MIN_SESSION_TIME);
  if (shortSessions.length > 2) {
    flags.push({ type: 'session', severity: 'medium', name: 'Suspiciously Short Sessions', description: `${shortSessions.length} sessions lasted <3 seconds. Likely automated.`, score: 15 });
  }

  if (logs.ip) {
    const accountsOnIP = Object.values(userActionLogs).filter(l => l.ip === logs.ip && l.userId !== userId);
    if (accountsOnIP.length >= FRAUD_RULES.MAX_ACCOUNTS_PER_IP) {
      flags.push({ type: 'multi-account', severity: 'high', name: 'Multi-Account Farm Suspected', description: `IP ${logs.ip} linked to ${accountsOnIP.length + 1} accounts. Max allowed: ${FRAUD_RULES.MAX_ACCOUNTS_PER_IP}.`, score: 30 });
    }
  }

  const nightActions = actions.filter(a => {
    const h = new Date(a.timestamp).getHours();
    return h >= FRAUD_RULES.SUSPICIOUS_TIME_RANGE[0] && h < FRAUD_RULES.SUSPICIOUS_TIME_RANGE[1];
  });
  if (nightActions.length > actions.length * 0.8 && actions.length > 10) {
    flags.push({ type: 'time-anomaly', severity: 'medium', name: 'Unusual Activity Hours', description: `${((nightActions.length / actions.length) * 100).toFixed(0)}% of actions occurred between midnight and 6 AM.`, score: 10 });
  }

  const riskScore = Math.min(100, flags.reduce((sum, f) => sum + f.score, 0));
  if (riskScore > 30) {
    flaggedUsers[userId] = { username, riskScore, reasons: flags.map(f => `${f.name}: ${f.description}`) };
  }

  return { riskScore, flags };
}

module.exports = {
  FRAUD_RULES,
  REFERRAL_FRAUD_RULES,
  userActionLogs,
  flaggedUsers,
  analyzeUserActivity,
};
