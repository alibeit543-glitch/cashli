import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const AdminCompletions = () => {
  const [completions, setCompletions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getCompletions({ page, status: statusFilter || undefined, limit: 20 });
        setCompletions(res.data.completions);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [page, statusFilter]);

  const handleProcess = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.processCompletion(selected._id, { status: action, adminNotes });
      toast.success(`Completion ${action}`);
      setSelected(null);
      setAction('');
      setAdminNotes('');
      const res = await adminAPI.getCompletions({ page, status: statusFilter || undefined, limit: 20 });
      setCompletions(res.data.completions);
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>Offer Completions</h1>
        <p>Review and approve/reject user offer completions</p>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/analytics">Analytics</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/offers">Offers</Link>
          <Link to="/admin/withdrawals">Withdrawals</Link>
          <Link to="/admin/transactions">Transactions</Link>
          <Link to="/admin/completions" className="active">Completions</Link>
                  <Link to="/admin/referrals">Referrals</Link>
        <Link to="/admin/activity">Activity</Link>
          <Link to="/admin/live-feed">Live Feed</Link>
          <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
        </nav>
      </div>

      <div className="filter-group">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className="text-muted" style={{ marginLeft: 12 }}>
          {pagination ? `${pagination.total} total` : ''}
        </span>
      </div>

      <div className="card">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Offer</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {completions.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">No completions found</td></tr>
              ) : (
                completions.map((c) => (
                  <tr key={c._id}>
                    <td><strong>{c.user?.username || 'N/A'}</strong></td>
                    <td>{c.offer?.title || 'N/A'}</td>
                    <td>{c.reward || c.offer?.reward} coins</td>
                    <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                    <td>{new Date(c.completedAt || c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => setSelected(c)}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Completion">
        {selected && (
          <form onSubmit={handleProcess}>
            <div style={{ marginBottom: 16 }}>
              <p><strong>User:</strong> {selected.user?.username} ({selected.user?.email})</p>
              <p><strong>Offer:</strong> {selected.offer?.title}</p>
              <p><strong>Category:</strong> {selected.offer?.category}</p>
              <p><strong>Reward:</strong> {selected.reward || selected.offer?.reward} coins + {selected.xpReward || selected.offer?.xpReward} XP</p>
              <p><strong>Submitted:</strong> {new Date(selected.completedAt || selected.createdAt).toLocaleString()}</p>
              <p><strong>Current Status:</strong> <span className={`status-badge ${selected.status}`}>{selected.status}</span></p>
              {selected.proof?.length > 0 && (
                <div><strong>Proof:</strong> {selected.proof.join(', ')}</div>
              )}
            </div>
            <div className="form-group">
              <label>Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value)} required>
                <option value="">Select action</option>
                <option value="approved">✔ Approve & Credit Reward</option>
                <option value="rejected">✖ Reject</option>
              </select>
            </div>
            <div className="form-group">
              <label>Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Reason for approval/rejection..."
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Process</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminCompletions;
