const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  type: { type: String, enum: ['bot', 'velocity', 'multi-account', 'vpn', 'time-anomaly', 'session'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['new', 'reviewing', 'resolved', 'dismissed'], default: 'new' },
  adminNotes: { type: String },
  riskScore: { type: Number, default: 0 },
}, { timestamps: true });

fraudAlertSchema.index({ status: 1, createdAt: -1 });
fraudAlertSchema.index({ userId: 1 });

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);
