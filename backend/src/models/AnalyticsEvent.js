const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String },
  type: {
    type: String,
    enum: ['session_start', 'session_end', 'pageview', 'task_step', 'task_complete', 'task_abandon'],
    required: true,
  },
  ip: { type: String, default: 'unknown' },
  page: { type: String },
  taskId: { type: String },
  taskName: { type: String },
  step: { type: Number },
  action: { type: String },
  duration: { type: Number },
  sessionStart: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

analyticsEventSchema.index({ userId: 1, createdAt: -1 });
analyticsEventSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
