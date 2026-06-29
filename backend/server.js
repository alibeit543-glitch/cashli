require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const mongoose = require('mongoose');
const FraudAlert = require('./src/models/FraudAlert');

const PORT = process.env.PORT || 5000;

const seedDemoFraudAlerts = async () => {
  const count = await FraudAlert.countDocuments();
  if (count > 0) return;
  const now = Date.now();
  const alerts = [
    { userId: 'user_bot_001', username: 'FastClicker', type: 'bot', severity: 'critical', title: 'Bot Pattern Detected', description: 'Average time between steps: 187ms. Threshold is 500ms.', status: 'new', riskScore: 92 },
    { userId: 'user_bot_002', username: 'VPN_User_99', type: 'velocity', severity: 'high', title: 'Task Velocity Anomaly', description: '18 tasks completed in 22 minutes. Normal human rate: 2-3/hour.', status: 'new', riskScore: 85 },
    { userId: 'user_bot_003', username: 'EarnFastPro', type: 'multi-account', severity: 'high', title: 'Multi-Account Farm Suspected', description: 'Same IP (192.168.1.50) linked to 4 accounts.', status: 'reviewing', riskScore: 78 },
    { userId: 'user_bot_004', username: 'SurveyKing', type: 'time-anomaly', severity: 'medium', title: 'Unusual Activity Hours', description: 'All 34 completions occurred between 2:00 AM - 4:30 AM.', status: 'new', riskScore: 65 },
    { userId: 'user_demo_001', username: 'DemoUser', type: 'vpn', severity: 'medium', title: 'VPN/Proxy Detected', description: 'Connection appears to route through known proxy.', status: 'dismissed', riskScore: 30 },
  ];
  await FraudAlert.insertMany(alerts.map(a => ({ ...a, createdAt: new Date(now - Math.random() * 86400000) })));
  console.log('Demo fraud alerts seeded');
};

const start = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    if (collections.length <= 3) {
      console.log('Empty database detected, running seed...');
      await require('./src/seed')();
      await seedDemoFraudAlerts();
    }

    // Cron: check overdue withdrawals every 10 minutes
    const { checkOverdueWithdrawals } = require('./src/services/cronService');
    checkOverdueWithdrawals();
    setInterval(checkOverdueWithdrawals, 10 * 60 * 1000);
    console.log('Cron: withdrawal reminder service started');
  } catch (err) {
    console.error('MongoDB connection failed, using mock data fallback:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n  🚀 Cashli API running on http://localhost:${PORT}`);
    console.log(`  \n  Demo Accounts:`);
    console.log(`  ───────────────`);
    console.log(`  User:  demo@cashli.com / demo123`);
    console.log(`  Admin: admin@cashli.com / Admin@123`);
    console.log(`  Moderator: moderator@cashli.com / Moderator@123`);
    console.log(`  \n  Open http://localhost:3000 to see the app!\n`);
  });
};

start();
