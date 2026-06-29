const User = require('./models/User');
const Admin = require('./models/Admin');
const Offer = require('./models/Offer');
const { generateReferralCode } = require('./utils/helpers');

const seed = async () => {
  const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@cashli.com' });
  if (!adminExists) {
    await Admin.create({
      username: 'SuperAdmin',
      email: process.env.ADMIN_EMAIL || 'admin@cashli.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'super_admin',
    });
    console.log('Super admin account created');
  }

  const moderatorExists = await Admin.findOne({ email: 'moderator@cashli.com' });
  if (!moderatorExists) {
    await Admin.create({
      username: 'Moderator',
      email: 'moderator@cashli.com',
      password: 'Moderator@123',
      role: 'moderator',
    });
    console.log('Moderator account created');
  }

  const demoUserExists = await User.findOne({ email: 'demo@cashli.com' });
  if (!demoUserExists) {
    await User.create({
      username: 'DemoUser',
      email: 'demo@cashli.com',
      password: 'demo123',
      referralCode: generateReferralCode(),
      verified: true,
      balance: 1250,
      totalEarned: 3200,
      xp: 850,
      level: 3,
      trustLevel: 'regular',
      dailyStreak: 5,
      ipAddresses: ['192.168.1.100'],
      offersCompletedCount: 12,
    });
    console.log('Demo user created');
  }

  const offerCount = await Offer.countDocuments();
  if (offerCount === 0) {
    const offers = [
      { title: 'Complete a 5-min Survey', description: 'Share your opinions and earn rewards instantly!', shortDescription: 'Quick survey, big rewards', category: 'survey', reward: 50, xpReward: 25, difficulty: 'easy', timeToComplete: 5, requirements: 'Must be 18+', instructions: 'Click start, answer all questions truthfully to receive credit.', url: 'https://example.com/survey1', totalSlots: 500, device: 'all', isFeatured: true, trustLevelRequired: 'all', maxCompletionsPerUser: 1 },
      { title: 'Download & Install App', description: 'Try out this amazing app! Download, install, and open it to earn coins.', shortDescription: 'Easy app install reward', category: 'app-download', reward: 200, xpReward: 50, difficulty: 'easy', timeToComplete: 10, requirements: 'Android or iOS device required', instructions: 'Download from store, install, open the app and create an account.', url: 'https://example.com/app', totalSlots: 200, device: 'all', isFeatured: true, trustLevelRequired: 'regular', maxCompletionsPerUser: 1 },
      { title: 'Watch Video Offer', description: 'Watch a short 30-second video and answer a quick question to earn.', shortDescription: 'Watch and earn instantly', category: 'video', reward: 25, xpReward: 10, difficulty: 'easy', timeToComplete: 2, requirements: 'None', instructions: 'Watch the full video and answer one simple question.', url: 'https://example.com/video', totalSlots: 1000, device: 'all', trustLevelRequired: 'all', maxCompletionsPerUser: 3 },
      { title: 'Sign Up for Service', description: 'Create a free account on our partner platform and get rewarded.', shortDescription: 'Free signup bonus', category: 'signup', reward: 150, xpReward: 40, difficulty: 'medium', timeToComplete: 15, requirements: 'Valid email address', instructions: 'Click the link, fill the registration form, and verify your email.', url: 'https://example.com/signup', totalSlots: 300, device: 'all', trustLevelRequired: 'all', maxCompletionsPerUser: 1 },
      { title: 'Make a Purchase Offer', description: 'Make a qualifying purchase of $10+ and earn big rewards.', shortDescription: 'Get cashback on purchases', category: 'purchase', reward: 500, xpReward: 100, difficulty: 'hard', timeToComplete: 30, requirements: 'Minimum purchase of $10', instructions: 'Click the link, make a purchase, upload receipt as proof.', url: 'https://example.com/purchase', totalSlots: 100, device: 'all', isFeatured: true, trustLevelRequired: 'trusted', maxCompletionsPerUser: 3 },
      { title: 'iOS Exclusive Survey', description: 'iOS users only! Share your thoughts on the latest tech trends.', shortDescription: 'iOS users survey', category: 'survey', reward: 75, xpReward: 30, difficulty: 'easy', timeToComplete: 5, requirements: 'iOS device required', instructions: 'Complete the survey on your iPhone or iPad.', url: 'https://example.com/ios-survey', totalSlots: 250, device: 'ios', trustLevelRequired: 'regular', maxCompletionsPerUser: 1 },
    ];

    await Offer.insertMany(offers);
    console.log(`${offers.length} offers seeded`);
  }

  console.log('Seed completed!');
};

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  const connectDB = require('./config/db');
  connectDB().then(seed).then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
}

module.exports = seed;
