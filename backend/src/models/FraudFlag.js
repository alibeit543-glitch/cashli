const mongoose = require('mongoose');

const fraudFlagSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  withdrawal: { type: mongoose.Schema.Types.ObjectId, ref: 'Withdrawal' },
  flagType: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  detail: { type: String, required: true },
  recommendation: { type: String },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
}, { timestamps: true });

fraudFlagSchema.index({ user: 1, createdAt: -1 });
fraudFlagSchema.index({ withdrawal: 1 });
fraudFlagSchema.index({ resolved: 1, severity: -1 });

module.exports = mongoose.model('FraudFlag', fraudFlagSchema);
