const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be positive'],
    },
    fee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
    },
    method: {
      type: String,
      required: true,
      enum: ['paypal', 'crypto', 'giftcard'],
    },
    accountDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'processing', 'completed', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

withdrawalSchema.pre('save', function (next) {
  if (this.netAmount === undefined) {
    this.netAmount = this.amount - (this.fee || 0);
  }
  next();
});

withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
