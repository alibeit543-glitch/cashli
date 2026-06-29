const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Cashli' },
  siteLogo: { type: String, default: '' },
  maintenanceMode: { type: Boolean, default: false },
  welcomeBonus: { type: Number, default: 100 },

  // Referral
  referralEnabled: { type: Boolean, default: true },
  referralBonus: { type: Number, default: 50 },
  referredBonus: { type: Number, default: 25 },

  // Cashout rules
  minWithdrawal: { type: Number, default: 500 },
  maxWithdrawal: { type: Number, default: 50000 },
  maxCashoutsPerWeek: { type: Number, default: 3 },
  minAccountAgeCashout: { type: Number, default: 7 },
  minOffersBeforeCashout: { type: Number, default: 5 },
  autoApproveTrustedThreshold: { type: Number, default: 50 },
  autoApproveRegularThreshold: { type: Number, default: 20 },

  // Payment methods
  paypalEnabled: { type: Boolean, default: true },
  paypalFee: { type: Number, default: 5 },
  cryptoEnabled: { type: Boolean, default: true },
  cryptoFee: { type: Number, default: 2 },
  giftcardEnabled: { type: Boolean, default: true },
  giftcardFee: { type: Number, default: 3 },
  bankEnabled: { type: Boolean, default: false },
  bankFee: { type: Number, default: 0 },

  // Email / SMTP
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  emailFrom: { type: String, default: 'noreply@cashli.app' },

  // Notification settings
  adminEmail: { type: String, default: 'admin@cashli.com' },
  newWithdrawalAlert: { type: Boolean, default: true },
  fraudAlertEmail: { type: Boolean, default: true },
  escalationEmail: { type: Boolean, default: true },
  withdrawalAlertEmail: { type: String, default: '' },
  fraudAlertEmailAddress: { type: String, default: '' },
  escalationEmailAddress: { type: String, default: '' },

  // Email templates
  welcomeEmailTemplate: { type: String, default: '' },
  withdrawalSubmittedTemplate: { type: String, default: '' },
  withdrawalApprovedTemplate: { type: String, default: '' },
  withdrawalRejectedTemplate: { type: String, default: '' },
  banNoticeTemplate: { type: String, default: '' },
  holdNoticeTemplate: { type: String, default: '' },
  reviewReminderTemplate: { type: String, default: '' },
}, { timestamps: true });

settingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Setting', settingSchema);
