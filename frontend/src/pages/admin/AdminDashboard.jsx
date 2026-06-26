import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiUsers, FiGrid, FiDollarSign, FiClock, FiTrendingUp } from 'react-icons/fi';
import StatCard from '../../components/dashboard/StatCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, platRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getPlatformStats(),
        ]);
        setStats(dashRes.data.stats);
        setRecentUsers(dashRes.data.recentUsers);
        setPlatformStats(platRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your platform</p>
      </div>

      <nav className="admin-nav">
        <Link to="/admin" className="active">Dashboard</Link>
        <Link to="/admin/analytics">Analytics</Link>
        <Link to="/admin/users">Users</Link>
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

      {stats && (
        <div className="stats-grid">
          <StatCard icon={FiUsers} label="Total Users" value={stats.totalUsers} color="#6366f1" />
          <StatCard icon={FiGrid} label="Total Offers" value={stats.totalOffers} color="#22c55e" />
          <StatCard icon={FiClock} label="Pending Withdrawals" value={stats.pendingWithdrawals} color="#f59e0b" />
          <StatCard icon={FiClock} label="Pending Reviews" value={stats.pendingCompletions} color="#ef4444" />
        </div>
      )}

      {platformStats && (
        <div className="card">
          <h3>Platform Overview</h3>
          <div className="platform-stats-grid">
            <div className="platform-stat">
              <span className="ps-label">Users Today</span>
              <span className="ps-value">{stats?.usersToday || 0}</span>
            </div>
            <div className="platform-stat">
              <span className="ps-label">Active Today</span>
              <span className="ps-value">{platformStats.activeToday}</span>
            </div>
            <div className="platform-stat">
              <span className="ps-label">Total Earnings</span>
              <span className="ps-value">{platformStats.totalEarned.toLocaleString()} coins</span>
            </div>
            <div className="platform-stat">
              <span className="ps-label">Total Withdrawn</span>
              <span className="ps-value">{platformStats.totalWithdrawn.toLocaleString()} coins</span>
            </div>
            <div className="platform-stat">
              <span className="ps-label">Avg Earnings/User</span>
              <span className="ps-value">{platformStats.avgEarning} coins</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Recent Users</h3>
          <Link to="/admin/users" className="card-link">View all</Link>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Earned</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u._id}>
                  <td><Link to={`/admin/users/${u._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{u.username}</Link></td>
                  <td>{u.email}</td>
                  <td>{u.balance.toFixed(0)}</td>
                  <td>{u.totalEarned.toFixed(0)}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
