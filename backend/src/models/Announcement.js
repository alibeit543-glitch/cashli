const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
