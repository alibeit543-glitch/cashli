import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Skeleton from '../../components/admin/Skeleton';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMail, FiDollarSign, FiAward, FiCalendar, FiShield, FiAlertTriangle, FiMonitor, FiGlobe, FiUser, FiCheck, FiX } from 'react-icons/fi';

const TrustBadge = ({ level }) => {
  const colors = { new: '#ef4444', regular: '#f59e0b', trusted: '#22c55e', banned: '#6b7280' };
  const labels = { new: 'New', regular: 'Regular', trusted: 'Trusted', banned: 'Banned' };
  return (
    <span style={{ background: (colors[level] || '#6b7280') + '20', color: colors[level] || '#6b7280', padding: '3px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[level] || '#6b7280', display: 'inline-block' }} />
      {labels[level] || level}
    </span>
  );
};

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [fraudFlags, setFraudFlags] = useState([]);
  const [sameIPUsers, setSameIPUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [showAdjustXP, setShowAdjustXP] = useState(false);
  const [xpAmount, setXpAmount] = useState('');
  const [levelValue, setLevelValue] = useState('');
  const [showBanConfirm, setShowBanConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showHoldConfirm, setShowHoldConfirm] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showNotesEdit, setShowNotesEdit] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getUserById(id);
        setUser(res.data.user);
        setTransactions(res.data.transactions || []);
        setWithdrawals(res.data.withdrawals || []);
        setCompletions(res.data.completions || []);
        setFraudFlags(res.data.fraudFlags || []);
        setSameIPUsers(res.data.sameIPUsers || []);
        setAdminNotes(res.data.user?.adminNotes || '');
      } catch (err) {
        toast.error('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleBan = async () => {
    try { await adminAPI.banUser(id); setUser({ ...user, isActive: false, status: 'banned' }); toast.success('User banned'); setShowBanConfirm(null); } catch (err) { toast.error('Failed'); }
  };
  const handleUnban = async () => {
    try { await adminAPI.unbanUser(id); setUser({ ...user, isActive: true, status: 'active' }); toast.success('User unbanned'); setShowBanConfirm(null); } catch (err) { toast.error('Failed'); }
  };
  const handleHold = async () => {
    try { await adminAPI.holdUser(id); setUser({ ...user, status: 'on_hold' }); toast.success('User on hold'); setShowHoldConfirm(null); } catch (err) { toast.error('Failed'); }
  };
  const setTrustLevel = async (level) => {
    try { const res = await adminAPI.setTrustLevel(id, { trustLevel: level }); setUser(res.data.user); toast.success(`Trust level: ${level}`); } catch (err) { toast.error('Failed'); }
  };
  const handleAdjust = async (e) => {
    e.preventDefault();
    try { const res = await adminAPI.adjustBalance(id, { amount: parseFloat(adjustAmount), reason: adjustReason }); setUser(res.data.user); toast.success('Balance adjusted'); setShowAdjust(false); setAdjustAmount(''); setAdjustReason(''); } catch (err) { toast.error('Failed'); }
  };
  const handleAdjustXP = async (e) => {
    e.preventDefault();
    try { const res = await adminAPI.adjustXP(id, { xp: parseInt(xpAmount) || 0, level: parseInt(levelValue) || user.level }); setUser(res.data.user); toast.success('XP/Level updated'); setShowAdjustXP(false); } catch (err) { toast.error('Failed'); }
  };
  const handleSaveNotes = async () => {
    try { await adminAPI.updateUser(id, { adminNotes }); toast.success('Notes saved'); setShowNotesEdit(false); } catch (err) { toast.error('Failed'); }
  };
  const handleDelete = async () => {
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); setShowDeleteConfirm(null); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="page-loading"><Skeleton type="card" count={3} /></div>;
  if (!user) return <div className="page-loading">User not found</div>;

  const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);

  const stats = [
    { label: 'Balance', value: `${user.balance?.toFixed(0) || 0} coins`, icon: FiDollarSign, color: '#22c55e' },
    { label: 'Total Earned', value: `${user.totalEarned?.toFixed(0) || 0} coins`, icon: FiDollarSign, color: '#6366f1' },
    { label: 'Total Withdrawn', value: `${user.totalWithdrawn?.toFixed(0) || 0} coins`, icon: FiDollarSign, color: '#ef4444' },
    { label: 'Level', value: user.level, icon: FiAward, color: '#f59e0b' },
    { label: 'XP', value: user.xp, icon: FiAward, color: '#8b5cf6' },
    { label: 'Account Age', value: `${accountAgeDays}d`, icon: FiCalendar, color: '#ec4899' },
    { label: 'Offers Done', value: user.offersCompletedCount || 0, icon: FiCheck, color: '#22c55e' },
    { label: 'Trust Level', value: user.trustLevel, icon: FiShield, color: '#6366f1' },
  ];

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/admin/users" className="btn btn-ghost"><FiArrowLeft size={18} /> Back to Users</Link>
        <h1 style={{ flex: 1 }}>{user.username}</h1>
      </div>

      {/* Profile Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div className="profile-avatar-large" style={{ width: 72, height: 72, fontSize: '2rem' }}>{user.username?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>{user.username}</h2>
              <TrustBadge level={user.trustLevel} />
              <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Banned'}</span>
              {user.status === 'on_hold' && <span className="status-badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>On Hold</span>}
              {user.status === 'suspicious' && <span className="status-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Suspicious</span>}
            </div>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <FiMail size={14} /> {user.email}
              <span style={{ margin: '0 8px', color: 'var(--text-dark)' }}>|</span>
              Joined {new Date(user.createdAt).toLocaleDateString()}
              <span style={{ margin: '0 8px', color: 'var(--text-dark)' }}>|</span>
              Code: {user.referralCode}
              <span style={{ margin: '0 8px', color: 'var(--text-dark)' }}>|</span>
              Last active: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={() => setShowAdjust(true)}>Adjust Balance</button>
            <button className="btn btn-sm" onClick={() => { setXpAmount(String(user.xp)); setLevelValue(String(user.level)); setShowAdjustXP(true); }}>XP/Level</button>
          </div>
        </div>
      </div>

      {/* Trust Level + Status Controls */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Change Trust Level:</span>
          {['new', 'regular', 'trusted', 'banned'].map(level => (
            <button key={level} className={`btn btn-sm ${user.trustLevel === level ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTrustLevel(level)} disabled={user.trustLevel === level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
          <span style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
          <button className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => setShowBanConfirm(user)}>
            {user.isActive ? 'Ban' : 'Unban'}
          </button>
          <button className="btn btn-sm" onClick={() => setShowHoldConfirm(true)} disabled={user.status === 'on_hold'}>Put On Hold</button>
          <button className="btn btn-sm btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}><s.icon size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fraud Flags */}
      {fraudFlags.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid #ef4444' }}>
          <div className="card-header">
            <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAlertTriangle size={16} /> Fraud Flags ({fraudFlags.length})
            </h3>
          </div>
          {fraudFlags.map((f, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ background: f.severity === 'critical' ? 'rgba(239,68,68,0.2)' : f.severity === 'high' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)', color: f.severity === 'critical' ? '#ef4444' : f.severity === 'high' ? '#f59e0b' : '#6366f1', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{f.severity}</span>
              <span style={{ flex: 1 }}>{f.detail}</span>
              {f.recommendation && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>{f.recommendation}</span>}
              <span style={{ color: 'var(--text-dark)', fontSize: '0.75rem' }}>{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Same IP Users */}
      {sameIPUsers.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid #f59e0b' }}>
          <div className="card-header">
            <h3 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiGlobe size={16} /> Same IP Accounts ({sameIPUsers.length})
            </h3>
          </div>
          {sameIPUsers.map(u => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 500 }}>{u.username}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</span>
              <Link to={`/admin/users/${u._id}`} style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>View</Link>
            </div>
          ))}
        </div>
      )}

      {/* Device & IP Info */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        {user.ipAddresses?.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header"><h3><FiGlobe size={14} /> IP Addresses</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {user.ipAddresses.map((ip, i) => <span key={i} style={{ fontFamily: 'monospace', fontSize: '0.85rem', padding: '4px 0' }}>{ip}</span>)}
            </div>
          </div>
        )}
        {user.deviceIds?.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header"><h3><FiMonitor size={14} /> Device IDs</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {user.deviceIds.map((d, i) => <span key={i} style={{ fontFamily: 'monospace', fontSize: '0.85rem', padding: '4px 0' }}>{d}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Admin Notes */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3>Admin Notes</h3>
          {!showNotesEdit && <button className="btn btn-sm btn-ghost" onClick={() => setShowNotesEdit(true)}>{adminNotes ? 'Edit' : 'Add Note'}</button>}
        </div>
        {showNotesEdit ? (
          <div>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder="Internal notes about this user..." style={{ width: '100%', padding: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={handleSaveNotes}>Save</button>
              <button className="btn btn-sm btn-ghost" onClick={() => { setShowNotesEdit(false); setAdminNotes(user.adminNotes || ''); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <p style={{ color: adminNotes ? 'var(--text)' : 'var(--text-dark)', fontStyle: adminNotes ? 'normal' : 'italic' }}>{adminNotes || 'No notes yet'}</p>
        )}
      </div>

      {/* History Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {completions.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header"><h3>Recent Completions ({completions.length})</h3></div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Offer</th>
                    <th>Reward</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completions.slice(0, 10).map(c => (
                    <tr key={c._id}>
                      <td style={{ fontSize: '0.85rem' }}>{c.offer?.title || 'Unknown'}</td>
                      <td>${c.reward}</td>
                      <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {withdrawals.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header"><h3>Withdrawal History ({withdrawals.length})</h3></div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.slice(0, 10).map(w => (
                    <tr key={w._id}>
                      <td>${w.amount.toLocaleString()}</td>
                      <td><span className="category-tag">{w.method}</span></td>
                      <td><span className={`status-badge ${w.status}`}>{w.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust Balance">
        <form onSubmit={handleAdjust}>
          <p style={{ marginBottom: 16 }}>Current balance: <strong>{user.balance} coins</strong></p>
          <div className="form-group"><label>Amount (positive to add, negative to deduct)</label><input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="e.g. 100 or -50" required /></div>
          <div className="form-group"><label>Reason</label><input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="e.g. Bonus, penalty, correction" required /></div>
          <button type="submit" className="btn btn-primary btn-full">Apply Adjustment</button>
        </form>
      </Modal>

      <Modal isOpen={showAdjustXP} onClose={() => setShowAdjustXP(false)} title="Adjust XP & Level">
        <form onSubmit={handleAdjustXP}>
          <p style={{ marginBottom: 16 }}>Current: <strong>Level {user.level}</strong> · <strong>{user.xp} XP</strong></p>
          <div className="form-group"><label>Set XP</label><input type="number" value={xpAmount} onChange={(e) => setXpAmount(e.target.value)} required /></div>
          <div className="form-group"><label>Set Level</label><input type="number" value={levelValue} onChange={(e) => setLevelValue(e.target.value)} min="1" max="100" required /></div>
          <button type="submit" className="btn btn-primary btn-full">Update</button>
        </form>
      </Modal>

      <ConfirmationModal isOpen={!!showBanConfirm} onClose={() => setShowBanConfirm(null)} onConfirm={user.isActive ? handleBan : handleUnban} title={user.isActive ? 'Ban User' : 'Unban User'} message={`Are you sure you want to ${user.isActive ? 'ban' : 'unban'} "${user.username}"?`} confirmText={user.isActive ? 'Ban' : 'Unban'} confirmVariant={user.isActive ? 'danger' : 'primary'} />
      <ConfirmationModal isOpen={!!showHoldConfirm} onClose={() => setShowHoldConfirm(null)} onConfirm={handleHold} title="Put User On Hold" message={`Freeze cashouts for "${user.username}"? They can still use the app but withdrawals will be blocked.`} confirmText="Put On Hold" confirmVariant="warning" />
      <ConfirmationModal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} onConfirm={handleDelete} title="Delete User" message={`Permanently delete "${user.username}" and all associated data? This cannot be undone.`} confirmText="Delete Permanently" confirmVariant="danger" />
    </div>
  );
};

export default UserDetail;
