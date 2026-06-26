const AnalyticsEvent = require('../models/AnalyticsEvent');
const fraudService = require('../services/fraudDetectionService');

exports.startSession = async (req, res) => {
  const { userId, ip } = req.body;
  if (!fraudService.userActionLogs[userId]) {
    fraudService.userActionLogs[userId] = { userId, actions: [], ip: ip || 'unknown', startTime: Date.now() };
  }
  fraudService.userActionLogs[userId].sessionStart = Date.now();
  fraudService.userActionLogs[userId].actions.push({ type: 'session_start', timestamp: Date.now() });
  try {
    await AnalyticsEvent.create({ userId, type: 'session_start', ip: ip || 'unknown' });
  } catch {}
  res.json({ sessionId: 'sess_' + Date.now(), status: 'tracking' });
};

exports.endSession = async (req, res) => {
  const { userId } = req.body;
  if (fraudService.userActionLogs[userId] && fraudService.userActionLogs[userId].sessionStart) {
    const duration = Date.now() - fraudService.userActionLogs[userId].sessionStart;
    fraudService.userActionLogs[userId].actions.push({ type: 'session_end', timestamp: Date.now(), duration });
    try {
      await AnalyticsEvent.create({ userId, type: 'session_end', ip: 'unknown', duration });
    } catch {}
  }
  res.json({ tracked: true });
};

exports.trackStep = async (req, res) => {
  const { userId, taskId, step, action, username, ip } = req.body;
  if (!fraudService.userActionLogs[userId]) {
    fraudService.userActionLogs[userId] = { userId, actions: [], ip: ip || 'unknown', startTime: Date.now() };
  }
  if (ip) fraudService.userActionLogs[userId].ip = ip;
  fraudService.userActionLogs[userId].actions.push({ type: 'task_step', taskId, step, action, timestamp: Date.now() });

  try {
    await AnalyticsEvent.create({ userId, username, type: 'task_step', ip: ip || 'unknown', taskId, step, action });
  } catch {}

  if (fraudService.userActionLogs[userId].actions.length % 5 === 0) {
    const analysis = fraudService.analyzeUserActivity(userId, username || userId);
    res.json({ tracked: true, fraudCheck: { riskScore: analysis.riskScore, flags: analysis.flags.length } });
  } else {
    res.json({ tracked: true });
  }
};

exports.trackPageView = async (req, res) => {
  const { userId, page } = req.body;
  if (!fraudService.userActionLogs[userId]) {
    fraudService.userActionLogs[userId] = { userId, actions: [], ip: 'unknown', startTime: Date.now() };
  }
  fraudService.userActionLogs[userId].actions.push({ type: 'pageview', page, timestamp: Date.now() });
  try {
    await AnalyticsEvent.create({ userId, type: 'pageview', page, ip: 'unknown' });
  } catch {}
  res.json({ tracked: true });
};

exports.trackComplete = async (req, res) => {
  const { userId, taskId, taskName, timeSpent, stepsCount, username } = req.body;
  if (!fraudService.userActionLogs[userId]) {
    fraudService.userActionLogs[userId] = { userId, actions: [], ip: 'unknown', startTime: Date.now() };
  }
  fraudService.userActionLogs[userId].actions.push({ type: 'task_complete', taskId, taskName, timestamp: Date.now() });

  try {
    await AnalyticsEvent.create({ userId, username, type: 'task_complete', taskId, taskName, ip: 'unknown', duration: timeSpent, metadata: { stepsCount } });
  } catch {}

  const analysis = fraudService.analyzeUserActivity(userId, username || userId);

  res.json({
    tracked: true,
    activity: { user: username || userId, task: taskName, time: timeSpent, steps: stepsCount, status: 'completed', date: new Date().toISOString() },
    fraudCheck: {
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskScore > 60 ? 'critical' : analysis.riskScore > 30 ? 'suspicious' : 'normal',
      flags: analysis.flags,
    }
  });
};
