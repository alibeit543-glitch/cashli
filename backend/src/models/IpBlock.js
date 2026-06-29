const mongoose = require('mongoose');

const ipBlockSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true, unique: true },
  reason: { type: String, required: true },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ipBlockSchema.index({ ipAddress: 1, isActive: 1 });

module.exports = mongoose.model('IpBlock', ipBlockSchema);
