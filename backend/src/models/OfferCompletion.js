const mongoose = require('mongoose');

const offerCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    proof: [String],
    adminNotes: {
      type: String,
    },
    reward: {
      type: Number,
    },
    xpReward: {
      type: Number,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

offerCompletionSchema.index({ user: 1, status: 1 });
offerCompletionSchema.index({ offer: 1, user: 1 });

module.exports = mongoose.model('OfferCompletion', offerCompletionSchema);
