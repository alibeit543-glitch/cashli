const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    trustLevel: {
      type: String,
      enum: ['new', 'regular', 'trusted', 'banned'],
      default: 'new',
    },
    status: {
      type: String,
      enum: ['active', 'banned', 'on_hold', 'suspicious'],
      default: 'active',
    },
    dailyStreak: {
      type: Number,
      default: 0,
    },
    lastDailyBonus: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    achievements: [
      {
        name: String,
        unlockedAt: Date,
      },
    ],
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
    },
    adminNotes: {
      type: String,
    },
    deviceIds: [{ type: String }],
    ipAddresses: [{ type: String }],
    paymentAccountHashes: [{ type: String }],
    offersCompletedCount: { type: Number, default: 0 },
    totalWithdrawalRequests: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
