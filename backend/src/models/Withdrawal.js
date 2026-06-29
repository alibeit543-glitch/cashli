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
      enum: ['paypal', 'crypto', 'giftcard', 'bank'],
    },
    accountDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['suspicious', 'pending', 'approved', 'processing', 'completed', 'rejected', 'hold'],
      default: 'pending',
    },
    fraudFlags: [{
      flagType: String,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      detail: String,
      recommendation: String,
    }],
    fraudScore: { type: Number, default: 0 },
    adminNotes: {
      type: String,
    },
    rejectionReason: { type: String },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    holdTimestamp: { type: Date },
    escalationSent: { type: Boolean, default: false },
    reviewReminderSent: { type: Boolean, default: false },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    emailSentAt: { type: Date },
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
withdrawalSchema.index({ fraudScore: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
