import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getUsers({ page, search, limit: 20 });
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [page, search]);

  const toggleStatus = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      setUsers(users.map((u) => (u._id === id ? { ...u, isActive: !u.isActive } : u)));
      toast.success('Status toggled');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const adjustBalance = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.adjustBalance(selectedUser._id, {
        amount: parseFloat(adjustAmount),
        reason: adjustReason,
      });
      toast.success('Balance adjusted');
      setSelectedUser(null);
      setAdjustAmount('');
      setAdjustReason('');
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>Manage Users</h1>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/analytics">Analytics</Link>
          <Link to="/admin/users" className="active">Users</Link>
          <Link to="/admin/offers">Offers</Link>
          <Link to="/admin/withdrawals">Withdrawals</Link>
          <Link to="/admin/transactions">Transactions</Link>
          <Link to="/admin/completions">Completions</Link>
                  <Link to="/admin/referrals">Referrals</Link>
        <Link to="/admin/activity">Activity</Link>
          <Link to="/admin/live-feed">Live Feed</Link>
          <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
        </nav>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Earned</th>
                <th>Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><Link to={`/admin/users/${u._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{u.username}</Link></td>
                  <td>{u.email}</td>
                  <td>{u.balance.toFixed(0)}</td>
                  <td>{u.totalEarned.toFixed(0)}</td>
                  <td>{u.level}</td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn btn-sm" onClick={() => setSelectedUser(u)}>
                      Adjust
                    </button>
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleStatus(u._id)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
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

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Adjust Balance">
        {selectedUser && (
          <form onSubmit={adjustBalance}>
            <p>User: <strong>{selectedUser.username}</strong> (Current: {selectedUser.balance} coins)</p>
            <div className="form-group">
              <label>Amount (use negative for deduction)</label>
              <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Apply</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;
