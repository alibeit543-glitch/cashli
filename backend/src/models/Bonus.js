const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['daily', 'streak', 'welcome', 'achievement', 'level-up'],
      required: true,
    },
    reward: {
      coins: { type: Number, default: 0 },
      xp: { type: Number, default: 0 },
    },
    streak: {
      type: Number,
    },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

bonusSchema.index({ user: 1, type: 1 });
bonusSchema.index({ user: 1, claimedAt: -1 });

module.exports = mongoose.model('Bonus', bonusSchema);
