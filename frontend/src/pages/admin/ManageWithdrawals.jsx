import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Skeleton from '../../components/admin/Skeleton';
import toast from 'react-hot-toast';
import { FiDollarSign, FiAlertTriangle, FiCheckCircle, FiXCircle, FiClock, FiEye, FiSearch } from 'react-icons/fi';

const TABS = [
  { key: 'suspicious', label: 'Suspicious', icon: FiAlertTriangle, color: '#ef4444' },
  { key: 'pending', label: 'Pending', icon: FiClock, color: '#f59e0b' },
  { key: 'approved', label: 'Approved', icon: FiCheckCircle, color: '#3b82f6' },
  { key: 'rejected', label: 'Rejected', icon: FiXCircle, color: '#ef4444' },
  { key: '', label: 'All', icon: FiDollarSign, color: '#6366f1' },
];

const ManageWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: { amount: 0, count: 0 }, suspicious: { amount: 0, count: 0 }, approved: { amount: 0, count: 0 } });
  const [selectedWd, setSelectedWd] = useState(null);
  const [action, setAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const status = activeTab || undefined;
        const res = await adminAPI.getWithdrawals({ page, status, limit: 20 });
        setWithdrawals(res.data.withdrawals);
        setPagination(res.data.pagination);
        if (res.data.stats) setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, activeTab]);

  const openProcess = (wd) => {
    setSelectedWd(wd);
    setAction('');
    setAdminNotes('');
    setRejectionReason('');
    setShowRejectInput(false);
  };

  const handleProcess = async () => {
    if (!action) { toast.error('Select an action'); return; }
    if (action === 'rejected' && !rejectionReason) { toast.error('Rejection requires a reason'); return; }
    try {
      await adminAPI.processWithdrawal(selectedWd._id, { status: action, adminNotes, rejectionReason: action === 'rejected' ? rejectionReason : undefined });
      toast.success(`Withdrawal ${action}`);
      setSelectedWd(null);
      const res = await adminAPI.getWithdrawals({ page, status: activeTab || undefined, limit: 20 });
      setWithdrawals(res.data.withdrawals);
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process');
    }
  };

  const handleRescan = async (id) => {
    try {
      const res = await adminAPI.rescanWithdrawal(id);
      toast.success(`Rescan complete: ${res.data.scanResult?.flags?.length || 0} flags`);
      const refetch = await adminAPI.getWithdrawals({ page, status: activeTab || undefined, limit: 20 });
      setWithdrawals(refetch.data.withdrawals);
    } catch (err) {
      toast.error('Rescan failed');
    }
  };

  const getTrustBadge = (level) => {
    const colors = { new: '#ef4444', regular: '#f59e0b', trusted: '#22c55e', banned: '#6b7280' };
    return <span style={{ background: (colors[level] || '#6b7280') + '20', color: colors[level] || '#6b7280', padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600 }}>{level}</span>;
  };

  return (
    <div className="admin-page">
      <h1>Withdrawals & Cashout Control</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Review, approve, or reject withdrawal requests with fraud detection</p>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><FiAlertTriangle size={24} style={{ color: '#ef4444' }} /></div>
          <div className="stat-info"><span className="stat-label">Suspicious Queue</span><span className="stat-value">{stats.suspicious.count}<small style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> (${stats.suspicious.amount})</small></span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><FiClock size={24} style={{ color: '#f59e0b' }} /></div>
          <div className="stat-info"><span className="stat-label">Pending Queue</span><span className="stat-value">{stats.pending.count}<small style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> (${stats.pending.amount})</small></span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)' }}><FiCheckCircle size={24} style={{ color: '#22c55e' }} /></div>
          <div className="stat-info"><span className="stat-label">Approved/Paid</span><span className="stat-value">{stats.approved.count}<small style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> (${stats.approved.amount})</small></span></div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="fraud-tabs" style={{ flex: 1 }}>
          {TABS.map(tab => (
            <button key={tab.key} className={`fraud-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => { setActiveTab(tab.key); setPage(1); }}>
              <tab.icon size={14} />
              <span>{tab.label}</span>
              {tab.key && stats[tab.key]?.count > 0 && <span className="alert-badge" style={{ background: tab.color }}>{stats[tab.key].count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Skeleton type="table" count={5} />
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Trust</th>
                  <th>Status</th>
                  <th>Fraud Score</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((wd) => (
                  <tr key={wd._id} style={wd.status === 'suspicious' ? { borderLeft: '3px solid #ef4444' } : {}}>
                    <td style={{ fontWeight: 500 }}>{wd.user?.username || 'Unknown'}</td>
                    <td>${wd.amount.toLocaleString()}</td>
                    <td><span className="category-tag">{wd.method}</span></td>
                    <td>{getTrustBadge(wd.user?.trustLevel)}</td>
                    <td><span className={`status-badge ${wd.status}`}>{wd.status}</span></td>
                    <td>
                      {wd.fraudScore > 0 ? (
                        <span style={{ color: wd.fraudScore > 50 ? '#ef4444' : wd.fraudScore > 25 ? '#f59e0b' : '#6366f1', fontWeight: 700 }}>{wd.fraudScore}</span>
                      ) : <span style={{ color: 'var(--text-dark)' }}>-</span>}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(wd.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <Link to={`/admin/withdrawals/${wd._id}`} className="btn btn-sm" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}><FiEye size={14} /> View</Link>
                        {(wd.status === 'pending' || wd.status === 'suspicious' || wd.status === 'hold') && (
                          <button className="btn btn-sm" onClick={() => openProcess(wd)}>Process</button>
                        )}
                        {wd.status !== 'suspicious' && (
                          <button className="btn btn-sm btn-warning" onClick={() => handleRescan(wd._id)}>Rescan</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {withdrawals.length === 0 && <div className="empty-state"><h3>No withdrawals</h3><p>No requests in this queue</p></div>}
          </div>
        )}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedWd} onClose={() => setSelectedWd(null)} title="Process Withdrawal">
        {selectedWd && (
          <div>
            <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><p style={{ fontWeight: 600 }}>{selectedWd.user?.username}</p><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedWd.amount.toLocaleString()} coins via {selectedWd.method}</p></div>
                <span className={`status-badge ${selectedWd.status}`} style={{ fontSize: '0.75rem' }}>{selectedWd.status}</span>
              </div>
              {selectedWd.fraudFlags?.length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>Fraud Flags:</p>
                  {selectedWd.fraudFlags.map((f, i) => (
                    <p key={i} style={{ fontSize: '0.78rem', color: '#fca5a5', padding: '2px 0' }}>• {f.detail} <span style={{ opacity: 0.6 }}>({f.severity})</span></p>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Action</label>
              <select value={action} onChange={(e) => { setAction(e.target.value); setShowRejectInput(e.target.value === 'rejected'); }} required>
                <option value="">Select action</option>
                <option value="approved" style={{ color: '#22c55e' }}>Approve</option>
                <option value="processing">Mark Processing</option>
                <option value="completed">Mark Completed</option>
                <option value="hold">Put On Hold</option>
                <option value="rejected" style={{ color: '#ef4444' }}>Reject</option>
              </select>
            </div>
            {showRejectInput && (
              <div className="form-group">
                <label>Rejection Reason <span style={{ color: '#ef4444' }}>*required</span></label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2} placeholder="Explain why this withdrawal was rejected (user will see this)..." required />
              </div>
            )}
            <div className="form-group">
              <label>Admin Notes (internal)</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} placeholder="Internal notes about this decision..." />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleProcess} disabled={!action || (action === 'rejected' && !rejectionReason)}>
                {action ? `${action.charAt(0).toUpperCase() + action.slice(1)}` : 'Select Action'}
              </button>
              <button className="btn btn-ghost" onClick={() => setSelectedWd(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageWithdrawals;
