import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiAlertTriangle, FiUser, FiMail, FiCalendar, FiDollarSign, FiShield, FiClock, FiCheck, FiX, FiSend } from 'react-icons/fi';

const TrustBadge = ({ level }) => {
  const colors = { new: '#ef4444', regular: '#f59e0b', trusted: '#22c55e', banned: '#6b7280' };
  return <span style={{ background: (colors[level] || '#6b7280') + '20', color: colors[level] || '#6b7280', padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>{level}</span>;
};

const SeverityBadge = ({ severity }) => {
  const colors = { low: '#6366f1', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };
  return <span style={{ background: (colors[severity] || '#6366f1') + '20', color: colors[severity] || '#6366f1', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{severity}</span>;
};

const WithdrawalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showBanConfirm, setShowBanConfirm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getWithdrawalById(id);
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load withdrawal');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleProcess = async () => {
    if (!action) return;
    if (action === 'rejected' && !rejectionReason) { toast.error('Rejection requires a reason'); return; }
    try {
      await adminAPI.processWithdrawal(id, {
        status: action,
        adminNotes,
        rejectionReason: action === 'rejected' ? rejectionReason : undefined,
      });
      toast.success(`Withdrawal ${action}`);
      const res = await adminAPI.getWithdrawalById(id);
      setData(res.data);
      setAction('');
      setAdminNotes('');
      setRejectionReason('');
      setShowRejectInput(false);
      setShowConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleBan = async () => {
    try {
      await adminAPI.banUser(data.withdrawal.user._id);
      toast.success('User banned');
      setShowBanConfirm(null);
    } catch (err) {
      toast.error('Failed to ban');
    }
  };

  if (loading) return <div className="page-loading">Loading withdrawal details...</div>;
  if (!data) return <div className="page-loading">Withdrawal not found</div>;

  const { withdrawal, userSummary, fraudFlags } = data;
  const user = userSummary?.user || {};
  const hoursSinceRequest = Math.floor((Date.now() - new Date(withdrawal.createdAt).getTime()) / 3600000);
  const hasUrgentFlag = hoursSinceRequest >= 24;
  const hasEscalatedFlag = hoursSinceRequest >= 48;
  const isSuspicious = withdrawal.status === 'suspicious' || withdrawal.fraudScore > 30;

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/admin/withdrawals" className="btn btn-ghost"><FiArrowLeft size={18} /> Back</Link>
        <h1 style={{ flex: 1 }}>Withdrawal Review</h1>
        {withdrawal.fraudScore > 0 && (
          <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '4px 12px', borderRadius: 99, fontWeight: 700, fontSize: '0.85rem' }}>
            Fraud Score: {withdrawal.fraudScore}/100
          </span>
        )}
      </div>

      {hasEscalatedFlag && (
        <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #dc2626', padding: '12px 20px', borderRadius: 'var(--radius-sm)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, color: '#fca5a5' }}>
          <FiAlertTriangle size={20} />
          <span style={{ fontWeight: 600 }}>ESCALATED: Over 48 hours — super admin review required</span>
        </div>
      )}
      {hasUrgentFlag && !hasEscalatedFlag && (
        <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b', padding: '12px 20px', borderRadius: 'var(--radius-sm)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, color: '#fbbf24' }}>
          <FiClock size={20} />
          <span style={{ fontWeight: 600 }}>Pending over 24 hours — needs attention</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* LEFT PANEL: Request Info */}
        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: 16 }}>Request Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount Requested</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${withdrawal.amount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
              <span className="category-tag" style={{ fontSize: '0.85rem' }}>{withdrawal.method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className={`status-badge ${withdrawal.status}`}>{withdrawal.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date Requested</span>
              <span>{new Date(withdrawal.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Time Since Request</span>
              <span style={{ color: hoursSinceRequest > 24 ? '#ef4444' : 'var(--text)', fontWeight: 600 }}>
                {hoursSinceRequest}h {Math.floor((Date.now() - new Date(withdrawal.createdAt).getTime()) % 3600000 / 60000)}m
              </span>
            </div>
          </div>

          {withdrawal.accountDetails && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Account Details</p>
              <pre style={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{JSON.stringify(withdrawal.accountDetails, null, 2)}</pre>
            </div>
          )}

          {/* ADMIN ACTION */}
          <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <h4 style={{ marginBottom: 12 }}>Admin Action</h4>
            <div className="form-group">
              <select value={action} onChange={(e) => { setAction(e.target.value); setShowRejectInput(e.target.value === 'rejected'); }}>
                <option value="">Select action...</option>
                <option value="approved" style={{ color: '#22c55e' }}>Approve</option>
                <option value="processing">Mark Processing</option>
                <option value="completed">Mark Completed</option>
                <option value="hold">Put On Hold</option>
                <option value="rejected" style={{ color: '#ef4444' }}>Reject</option>
              </select>
            </div>
            {showRejectInput && (
              <div className="form-group" style={{ border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                <label style={{ color: '#ef4444', fontWeight: 600 }}>Rejection Reason *</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2} placeholder="Required: explain why (user will see this)..." style={{ border: '1px solid #ef4444' }} />
              </div>
            )}
            <div className="form-group">
              <label>Internal Notes</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} placeholder="Notes for other admins..." />
            </div>
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => setShowConfirm('approved')} disabled={!action || action === 'rejected'}>
                  <FiCheck size={16} /> {action ? action.charAt(0).toUpperCase() + action.slice(1) : 'Submit'}
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setShowRejectInput(true) || setAction('rejected') || setShowConfirm('rejected')}>
                  <FiX size={16} /> Reject
                </button>
              </div>
              <button className="btn btn-warning" onClick={() => setShowBanConfirm(true)}>
                <FiShield size={16} /> Ban Account
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: User Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div className="avatar-small" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>{user.username?.charAt(0).toUpperCase()}</div>
              <div>
                <h4 style={{ margin: 0 }}>{user.username}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}><FiMail size={12} /> {user.email}</p>
              </div>
              <TrustBadge level={user.trustLevel} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Age</span>
                <span style={{ fontWeight: 600 }}>{Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)} days</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Earned</span>
                <span style={{ fontWeight: 600 }}>${user.totalEarned?.toLocaleString()}</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Withdrawn</span>
                <span style={{ fontWeight: 600 }}>${user.totalWithdrawn?.toLocaleString()}</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Balance</span>
                <span style={{ fontWeight: 600 }}>${user.balance?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {withdrawal.fraudFlags?.length > 0 && (
            <div className="card" style={{ margin: 0, borderLeft: '3px solid #ef4444' }}>
              <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                <FiAlertTriangle size={16} /> Fraud Flags ({withdrawal.fraudFlags.length})
              </h4>
              {withdrawal.fraudFlags.map((f, i) => (
                <div key={i} style={{ padding: '8px 12px', marginBottom: 8, background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${f.severity === 'critical' ? '#dc2626' : f.severity === 'high' ? '#ef4444' : '#f59e0b'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <SeverityBadge severity={f.severity} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dark)', fontFamily: 'monospace' }}>{f.flagType}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{f.detail}</p>
                  {f.recommendation && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>Recommendation: {f.recommendation}</p>}
                </div>
              ))}
            </div>
          )}

          {userSummary?.previousWithdrawals?.length > 0 && (
            <div className="card" style={{ margin: 0 }}>
              <h4 style={{ marginBottom: 12 }}>Withdrawal History ({userSummary.previousWithdrawals.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {userSummary.previousWithdrawals.slice(0, 10).map(w => (
                  <div key={w._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                    <span>${w.amount} via {w.method}</span>
                    <span className={`status-badge ${w.status}`} style={{ fontSize: '0.7rem' }}>{w.status}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userSummary?.sameIPUsers?.length > 0 && (
            <div className="card" style={{ margin: 0, borderLeft: '3px solid #f59e0b' }}>
              <h4 style={{ marginBottom: 12, color: '#f59e0b' }}>⚠ Same IP Accounts ({userSummary.sameIPUsers.length})</h4>
              {userSummary.sameIPUsers.map(u => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border)' }}>
                  <span>{u.username}</span>
                  <Link to={`/admin/users/${u._id}`} style={{ color: 'var(--primary)', fontSize: '0.78rem' }}>View</Link>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/admin/users/${user._id}`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              <FiUser size={16} /> View Full Profile
            </Link>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={handleProcess}
        title={showConfirm === 'approved' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
        message={showConfirm === 'approved' ? 'Are you sure you want to approve this withdrawal? The user will be notified.' : `Are you sure you want to reject this withdrawal?${rejectionReason ? `\nReason: ${rejectionReason}` : ''}`}
        confirmText={showConfirm === 'approved' ? 'Approve' : 'Reject'}
        confirmVariant={showConfirm === 'approved' ? 'primary' : 'danger'}
      />

      <ConfirmationModal
        isOpen={!!showBanConfirm}
        onClose={() => setShowBanConfirm(null)}
        onConfirm={handleBan}
        title="Ban User Account"
        message={`Are you sure you want to permanently ban "${user.username}"? This will prevent them from logging in or withdrawing.`}
        confirmText="Ban User"
        confirmVariant="danger"
      />
    </div>
  );
};

export default WithdrawalDetail;
