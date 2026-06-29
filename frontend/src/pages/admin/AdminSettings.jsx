import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiSettings, FiMail, FiCreditCard, FiUsers, FiDollarSign } from 'react-icons/fi';

const TABS = [
  { key: 'general', label: 'General', icon: FiSettings },
  { key: 'email', label: 'Email', icon: FiMail },
  { key: 'payments', label: 'Payments', icon: FiCreditCard },
  { key: 'cashout', label: 'Cashout Rules', icon: FiDollarSign },
  { key: 'notifications', label: 'Notifications', icon: FiUsers },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getSettings().then(res => {
      setSettings(res.data.settings);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Loading settings...</div>;
  if (!settings) return <div className="page-loading">No settings found</div>;

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure platform settings</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="fraud-tabs" style={{ marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab.key} className={`fraud-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group"><label>Site Name</label><input value={settings.siteName || ''} onChange={(e) => handleChange('siteName', e.target.value)} /></div>
            <div className="form-group"><label>Site Logo URL</label><input value={settings.siteLogo || ''} onChange={(e) => handleChange('siteLogo', e.target.value)} placeholder="https://..." /></div>
            <label className="checkbox-label"><input type="checkbox" checked={settings.maintenanceMode || false} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} /> Maintenance Mode (block all users)</label>
            <div className="form-row">
              <div className="form-group"><label>Welcome Bonus ($)</label><input type="number" value={settings.welcomeBonus || 0} onChange={(e) => handleChange('welcomeBonus', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label>Referral Bonus ($)</label><input type="number" value={settings.referralBonus || 0} onChange={(e) => handleChange('referralBonus', parseFloat(e.target.value) || 0)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Referred Friend Bonus ($)</label><input type="number" value={settings.referredBonus || 0} onChange={(e) => handleChange('referredBonus', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label>Email From Address</label><input value={settings.emailFrom || ''} onChange={(e) => handleChange('emailFrom', e.target.value)} /></div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-row">
              <div className="form-group"><label>SMTP Host</label><input value={settings.smtpHost || ''} onChange={(e) => handleChange('smtpHost', e.target.value)} /></div>
              <div className="form-group"><label>SMTP Port</label><input type="number" value={settings.smtpPort || 587} onChange={(e) => handleChange('smtpPort', parseInt(e.target.value) || 587)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>SMTP Username</label><input value={settings.smtpUser || ''} onChange={(e) => handleChange('smtpUser', e.target.value)} /></div>
              <div className="form-group"><label>SMTP Password</label><input type="password" value={settings.smtpPass || ''} onChange={(e) => handleChange('smtpPass', e.target.value)} /></div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              <h4 style={{ marginBottom: 12, color: 'var(--text-muted)' }}>Email Templates</h4>
              <div className="form-group"><label>Welcome Email Template</label><textarea value={settings.welcomeEmailTemplate || ''} onChange={(e) => handleChange('welcomeEmailTemplate', e.target.value)} rows={3} /></div>
              <div className="form-group"><label>Withdrawal Submitted Template</label><textarea value={settings.withdrawalSubmittedTemplate || ''} onChange={(e) => handleChange('withdrawalSubmittedTemplate', e.target.value)} rows={3} /></div>
              <div className="form-group"><label>Withdrawal Approved Template</label><textarea value={settings.withdrawalApprovedTemplate || ''} onChange={(e) => handleChange('withdrawalApprovedTemplate', e.target.value)} rows={3} /></div>
              <div className="form-group"><label>Withdrawal Rejected Template</label><textarea value={settings.withdrawalRejectedTemplate || ''} onChange={(e) => handleChange('withdrawalRejectedTemplate', e.target.value)} rows={3} /></div>
              <div className="form-group"><label>Account Ban Notice Template</label><textarea value={settings.banNoticeTemplate || ''} onChange={(e) => handleChange('banNoticeTemplate', e.target.value)} rows={3} /></div>
              <div className="form-group"><label>Account Hold Notice Template</label><textarea value={settings.holdNoticeTemplate || ''} onChange={(e) => handleChange('holdNoticeTemplate', e.target.value)} rows={3} /></div>
              <div className="form-group"><label>24h Review Reminder Template</label><textarea value={settings.reviewReminderTemplate || ''} onChange={(e) => handleChange('reviewReminderTemplate', e.target.value)} rows={3} /></div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <label className="checkbox-label"><input type="checkbox" checked={settings.paypalEnabled || false} onChange={(e) => handleChange('paypalEnabled', e.target.checked)} /> PayPal</label>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Fee (%)</label><input type="number" value={settings.paypalFee || 0} onChange={(e) => handleChange('paypalFee', parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <label className="checkbox-label"><input type="checkbox" checked={settings.cryptoEnabled || false} onChange={(e) => handleChange('cryptoEnabled', e.target.checked)} /> Crypto</label>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Fee (%)</label><input type="number" value={settings.cryptoFee || 0} onChange={(e) => handleChange('cryptoFee', parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <label className="checkbox-label"><input type="checkbox" checked={settings.giftcardEnabled || false} onChange={(e) => handleChange('giftcardEnabled', e.target.checked)} /> Gift Cards</label>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Fee (%)</label><input type="number" value={settings.giftcardFee || 0} onChange={(e) => handleChange('giftcardFee', parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <label className="checkbox-label"><input type="checkbox" checked={settings.bankEnabled || false} onChange={(e) => handleChange('bankEnabled', e.target.checked)} /> Bank Transfer</label>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Fee (%)</label><input type="number" value={settings.bankFee || 0} onChange={(e) => handleChange('bankFee', parseFloat(e.target.value) || 0)} /></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cashout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-row">
              <div className="form-group"><label>Minimum Withdrawal Amount ($)</label><input type="number" value={settings.minWithdrawal || 0} onChange={(e) => handleChange('minWithdrawal', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label>Maximum Withdrawal Amount ($)</label><input type="number" value={settings.maxWithdrawal || 0} onChange={(e) => handleChange('maxWithdrawal', parseFloat(e.target.value) || 0)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Max Cashouts Per Week</label><input type="number" value={settings.maxCashoutsPerWeek || 3} onChange={(e) => handleChange('maxCashoutsPerWeek', parseInt(e.target.value) || 3)} /></div>
              <div className="form-group"><label>Min Account Age to Cashout (days)</label><input type="number" value={settings.minAccountAgeCashout || 0} onChange={(e) => handleChange('minAccountAgeCashout', parseInt(e.target.value) || 0)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Min Offers Completed Before Cashout</label><input type="number" value={settings.minOffersBeforeCashout || 0} onChange={(e) => handleChange('minOffersBeforeCashout', parseInt(e.target.value) || 0)} /></div>
              <div className="form-group"><label>Auto-Approve (Trusted max $)</label><input type="number" value={settings.autoApproveTrustedThreshold || 0} onChange={(e) => handleChange('autoApproveTrustedThreshold', parseFloat(e.target.value) || 0)} /></div>
            </div>
            <div className="form-group">
              <label>Auto-Approve (Regular max $)</label>
              <input type="number" value={settings.autoApproveRegularThreshold || 0} onChange={(e) => handleChange('autoApproveRegularThreshold', parseFloat(e.target.value) || 0)} />
              <small>Cashouts below this amount for regular users auto-approve</small>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group"><label>Admin Email</label><input type="email" value={settings.adminEmail || ''} onChange={(e) => handleChange('adminEmail', e.target.value)} placeholder="admin@cashli.com" /></div>
            <label className="checkbox-label"><input type="checkbox" checked={settings.newWithdrawalAlert || false} onChange={(e) => handleChange('newWithdrawalAlert', e.target.checked)} /> Email me on new withdrawal requests</label>
            <label className="checkbox-label"><input type="checkbox" checked={settings.fraudAlertEmail || false} onChange={(e) => handleChange('fraudAlertEmail', e.target.checked)} /> Email me on fraud alerts</label>
            <label className="checkbox-label"><input type="checkbox" checked={settings.escalationEmail || false} onChange={(e) => handleChange('escalationEmail', e.target.checked)} /> Email me on 48h escalations</label>
            <div className="form-group"><label>Withdrawal Alert Email</label><input type="email" value={settings.withdrawalAlertEmail || ''} onChange={(e) => handleChange('withdrawalAlertEmail', e.target.value)} placeholder="(optional) separate email for withdrawal alerts" /></div>
            <div className="form-group"><label>Fraud Alert Email</label><input type="email" value={settings.fraudAlertEmailAddress || ''} onChange={(e) => handleChange('fraudAlertEmailAddress', e.target.value)} placeholder="(optional) separate email for fraud alerts" /></div>
            <div className="form-group"><label>Escalation Email</label><input type="email" value={settings.escalationEmailAddress || ''} onChange={(e) => handleChange('escalationEmailAddress', e.target.value)} placeholder="(optional) separate email for escalations" /></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
