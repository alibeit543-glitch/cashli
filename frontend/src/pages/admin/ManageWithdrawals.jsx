import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ManageWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWd, setSelectedWd] = useState(null);
  const [action, setAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getWithdrawals({ page, status: statusFilter || undefined, limit: 20 });
        setWithdrawals(res.data.withdrawals);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [page, statusFilter]);

  const processWithdrawal = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.processWithdrawal(selectedWd._id, { status: action, adminNotes });
      toast.success(`Withdrawal ${action}`);
      setSelectedWd(null);
      setAction('');
      setAdminNotes('');
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>Manage Withdrawals</h1>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/analytics">Analytics</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/offers">Offers</Link>
          <Link to="/admin/withdrawals" className="active">Withdrawals</Link>
          <Link to="/admin/transactions">Transactions</Link>
          <Link to="/admin/completions">Completions</Link>
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
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((wd) => (
                <tr key={wd._id}>
                  <td>{wd.user?.username}</td>
                  <td>{wd.amount} coins <small>({wd.netAmount} net)</small></td>
                  <td>{wd.method}</td>
                  <td><span className={`status-badge ${wd.status}`}>{wd.status}</span></td>
                  <td>{new Date(wd.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setSelectedWd(wd)}>
                      Process
                    </button>
                  </td>
                </tr>
              ))}
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

      <Modal isOpen={!!selectedWd} onClose={() => setSelectedWd(null)} title="Process Withdrawal">
        {selectedWd && (
          <form onSubmit={processWithdrawal}>
            <p>
              <strong>{selectedWd.user?.username}</strong> - {selectedWd.amount} coins via {selectedWd.method}
            </p>
            <div className="form-group">
              <label>Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value)} required>
                <option value="">Select action</option>
                <option value="approved">Approve</option>
                <option value="processing">Mark Processing</option>
                <option value="completed">Mark Completed</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            <div className="form-group">
              <label>Admin Notes</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Process</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageWithdrawals;
