const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    reward: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      enum: ['pending', 'credited'],
      default: 'pending',
    },
    creditedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referred: 1 }, { unique: true });

module.exports = mongoose.model('Referral', referralSchema);
