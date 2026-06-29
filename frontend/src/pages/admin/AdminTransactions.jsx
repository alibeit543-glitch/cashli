import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiFilter, FiSearch } from 'react-icons/fi';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', search: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getPlatformStats();
        // Try getting real transactions
        try {
          const txnRes = await adminAPI.getAdminTransactions({ type: filters.type || undefined });
          setTransactions(txnRes.data.transactions);
        } catch {
          // fallback to mock data
          setTransactions([
            { _id: '1', user: { username: 'DemoUser' }, type: 'earning', amount: 200, description: 'Completed: Download App', status: 'completed', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { _id: '2', user: { username: 'Alice' }, type: 'earning', amount: 50, description: 'Completed: 5-min Survey', status: 'completed', createdAt: new Date(Date.now() - 7200000).toISOString() },
            { _id: '3', user: { username: 'Bob' }, type: 'withdrawal', amount: -500, description: 'Withdrawal via PayPal', status: 'completed', createdAt: new Date(Date.now() - 14400000).toISOString() },
            { _id: '9', user: { username: 'DemoUser' }, type: 'bonus', amount: 100, description: 'Welcome bonus', status: 'completed', createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters.type]);

  const filtered = transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.search && !t.user?.username?.toLowerCase().includes(filters.search.toLowerCase()) && !t.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'earning' && t.amount > 0) acc.totalEarnings += t.amount;
    if (t.type === 'withdrawal') acc.totalWithdrawals += Math.abs(t.amount);
    if (t.type === 'bonus') acc.totalBonuses += t.amount;
    if (t.type === 'referral') acc.totalReferrals += t.amount;
    return acc;
  }, { totalEarnings: 0, totalWithdrawals: 0, totalBonuses: 0, totalReferrals: 0 });

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>All Transactions</h1>
        <p>Complete financial audit trail across the entire platform</p>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/analytics">Analytics</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/offers">Offers</Link>
          <Link to="/admin/withdrawals">Withdrawals</Link>
          <Link to="/admin/transactions" className="active">Transactions</Link>
          <Link to="/admin/completions">Completions</Link>
                  <Link to="/admin/referrals">Referrals</Link>
        <Link to="/admin/activity">Activity</Link>
          <Link to="/admin/live-feed">Live Feed</Link>
          <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
        </nav>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#22c55e20', color: '#22c55e' }}>💰</div>
          <div className="stat-info">
            <span className="stat-label">Total Earnings</span>
            <span className="stat-value">{totals.totalEarnings.toLocaleString()} coins</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}>💸</div>
          <div className="stat-info">
            <span className="stat-label">Total Withdrawn</span>
            <span className="stat-value">{totals.totalWithdrawals.toLocaleString()} coins</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#6366f120', color: '#6366f1' }}>🎁</div>
          <div className="stat-info">
            <span className="stat-label">Bonuses Given</span>
            <span className="stat-value">{totals.totalBonuses.toLocaleString()} coins</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>👥</div>
          <div className="stat-info">
            <span className="stat-label">Referrals Paid</span>
            <span className="stat-value">{totals.totalReferrals.toLocaleString()} coins</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Search by user or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group" style={{ marginBottom: 0 }}>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All Types</option>
              <option value="earning">Earnings</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="bonus">Bonuses</option>
              <option value="referral">Referrals</option>
            </select>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="empty-state">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">No transactions match your filters</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.user?.username}</strong></td>
                    <td><span className="category-tag">{t.type}</span></td>
                    <td style={{ color: t.amount > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                      {t.amount > 0 ? '+' : ''}{t.amount.toFixed(0)}
                    </td>
                    <td>{t.description}</td>
                    <td><span className={`status-badge ${t.status}`}>{t.status}</span></td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
