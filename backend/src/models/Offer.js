const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: ['survey', 'offer', 'video', 'app-download', 'signup', 'purchase'],
    },
    reward: {
      type: Number,
      required: [true, 'Reward is required'],
      min: [1, 'Reward must be at least 1'],
    },
    xpReward: {
      type: Number,
      default: 10,
    },
    requirements: {
      type: String,
    },
    instructions: {
      type: String,
    },
    url: {
      type: String,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    totalSlots: {
      type: Number,
      default: 1000,
    },
    completedSlots: {
      type: Number,
      default: 0,
    },
    device: {
      type: String,
      enum: ['all', 'ios', 'android'],
      default: 'all',
    },
    countries: [String],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ status: 1, category: 1 });
offerSchema.index({ isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Offer', offerSchema);
