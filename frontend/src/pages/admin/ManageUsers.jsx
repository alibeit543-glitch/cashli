import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Skeleton from '../../components/admin/Skeleton';
import toast from 'react-hot-toast';
import { FiSearch, FiUserX, FiUserCheck, FiPause, FiAlertTriangle } from 'react-icons/fi';

const TrustBadge = ({ level }) => {
  const colors = { new: '#ef4444', regular: '#f59e0b', trusted: '#22c55e', banned: '#6b7280' };
  return <span style={{ background: (colors[level] || '#6b7280') + '20', color: colors[level] || '#6b7280', padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600 }}>{level}</span>;
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [statusFilter, setStatusFilter] = useState('');
  const [trustFilter, setTrustFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [showBanConfirm, setShowBanConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = { page, search, sort, limit: 20 };
        if (statusFilter) params.status = statusFilter;
        if (trustFilter) params.trustLevel = trustFilter;
        const res = await adminAPI.getUsers(params);
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, [page, search, sort, statusFilter, trustFilter]);

  useEffect(() => { setPage(1); }, [search, sort, statusFilter, trustFilter]);

  const toggleStatus = async (id) => {
    try { await adminAPI.toggleUserStatus(id); setUsers(users.map((u) => (u._id === id ? { ...u, isActive: !u.isActive, status: u.isActive ? 'banned' : 'active' } : u))); toast.success('Status toggled'); } catch (err) { toast.error('Failed'); }
  };

  const adjustBalance = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.adjustBalance(selectedUser._id, { amount: parseFloat(adjustAmount), reason: adjustReason });
      toast.success('Balance adjusted');
      setSelectedUser(null); setAdjustAmount(''); setAdjustReason('');
      const res = await adminAPI.getUsers({ page, search, sort, limit: 20 });
      setUsers(res.data.users);
    } catch (err) { toast.error('Failed'); }
  };

  const handleBan = async (id, isActive) => {
    try { isActive ? await adminAPI.banUser(id) : await adminAPI.unbanUser(id); setUsers(users.map((u) => (u._id === id ? { ...u, isActive: !isActive, status: isActive ? 'banned' : 'active' } : u))); toast.success(isActive ? 'Banned' : 'Unbanned'); } catch (err) { toast.error('Failed'); }
    setShowBanConfirm(null);
  };

  const handleDelete = async (id) => {
    try { await adminAPI.deleteUser(id); setUsers(users.filter((u) => u._id !== id)); toast.success('Deleted'); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="admin-page">
      <h1>Manage Users</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>View, search, and manage all platform users</p>

      <div className="admin-toolbar">
        <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
          <FiSearch size={16} />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="admin-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="on_hold">On Hold</option>
            <option value="suspicious">Suspicious</option>
          </select>
          <select value={trustFilter} onChange={(e) => setTrustFilter(e.target.value)}>
            <option value="">All Trust</option>
            <option value="new">New</option>
            <option value="regular">Regular</option>
            <option value="trusted">Trusted</option>
            <option value="banned">Banned</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="-balance">Highest Balance</option>
            <option value="balance">Lowest Balance</option>
            <option value="-totalEarned">Most Earned</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <Skeleton type="table" count={6} /> : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th>Earned</th>
                  <th>Trust</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={u.status === 'suspicious' ? { borderLeft: '3px solid #ef4444' } : u.status === 'on_hold' ? { borderLeft: '3px solid #3b82f6' } : {}}>
                    <td><Link to={`/admin/users/${u._id}`} className="user-link" style={{ fontWeight: 500 }}>{u.username}</Link></td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>{u.balance?.toFixed(0)} coins</td>
                    <td>{u.totalEarned?.toFixed(0)} coins</td>
                    <td><TrustBadge level={u.trustLevel} /></td>
                    <td><span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>{u.status || (u.isActive ? 'Active' : 'Banned')}</span></td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <Link to={`/admin/users/${u._id}`} className="btn btn-sm">View</Link>
                        <button className="btn btn-sm" onClick={() => setSelectedUser(u)}>Balance</button>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => setShowBanConfirm(u)}>{u.isActive ? 'Ban' : 'Unban'}</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setShowDeleteConfirm(u)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="empty-state"><h3>No users found</h3></div>}
          </div>
        )}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: Math.min(pagination.pages, 20) }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Adjust Balance">
        {selectedUser && <form onSubmit={adjustBalance}>
          <p style={{ marginBottom: 16 }}>User: <strong>{selectedUser.username}</strong><br />Current balance: <strong>{selectedUser.balance} coins</strong></p>
          <div className="form-group"><label>Amount (use negative for deduction)</label><input type="number" step="any" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} required /></div>
          <div className="form-group"><label>Reason</label><input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} required placeholder="Why?" /></div>
          <button type="submit" className="btn btn-primary btn-full">Apply</button>
        </form>}
      </Modal>

      <ConfirmationModal isOpen={!!showBanConfirm} onClose={() => setShowBanConfirm(null)} onConfirm={() => handleBan(showBanConfirm._id, showBanConfirm.isActive)} title={showBanConfirm?.isActive ? 'Ban User' : 'Unban User'} message={`${showBanConfirm?.isActive ? 'Ban' : 'Unban'} "${showBanConfirm?.username}"?`} confirmText={showBanConfirm?.isActive ? 'Ban' : 'Unban'} confirmVariant={showBanConfirm?.isActive ? 'danger' : 'primary'} />
      <ConfirmationModal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} onConfirm={() => handleDelete(showDeleteConfirm._id)} title="Delete User" message={`Permanently delete "${showDeleteConfirm?.username}"? This cannot be undone.`} confirmText="Delete" confirmVariant="danger" />
    </div>
  );
};

export default ManageUsers;
