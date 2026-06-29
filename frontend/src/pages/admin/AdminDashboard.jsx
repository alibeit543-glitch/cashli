import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Skeleton from '../../components/admin/Skeleton';
import { FiUsers, FiDollarSign, FiClock, FiAlertTriangle, FiTrendingUp, FiUserPlus, FiShield } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboard();
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity || []);
        setRecentUsers(res.data.recentUsers || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '...', change: stats?.userChange || '0%', icon: FiUsers, color: '#6366f1' },
    { label: 'Active Today', value: stats?.usersToday?.toLocaleString() || '...', icon: FiUserPlus, color: '#22c55e' },
    { label: 'Total Earnings', value: `$${stats?.totalEarnings?.toLocaleString() || '...'}`, icon: FiTrendingUp, color: '#22c55e' },
    { label: 'Pending Withdrawals', value: `$${stats?.pendingAmount?.toLocaleString() || '...'}`, sub: `${stats?.pendingWithdrawals || 0} requests`, icon: FiClock, color: '#f59e0b' },
    { label: 'Suspicious', value: stats?.suspiciousWithdrawals || '0', icon: FiAlertTriangle, color: '#ef4444' },
    { label: 'New This Week', value: stats?.signupsThisWeek || '...', icon: FiUserPlus, color: '#3b82f6' },
    { label: 'Fraud Alerts', value: stats?.newFraudAlerts || '0', icon: FiShield, color: '#ef4444' },
    { label: 'Flagged Accounts', value: stats?.flaggedAccounts || '0', icon: FiAlertTriangle, color: '#f59e0b' },
  ];

  const urgentAlerts = [];
  if (stats?.overdue24h > 0) urgentAlerts.push({ type: 'warning', text: `${stats.overdue24h} withdrawals pending >24 hours`, link: '/admin/withdrawals' });
  if (stats?.escalated48h > 0) urgentAlerts.push({ type: 'danger', text: `${stats.escalated48h} withdrawals escalated >48 hours`, link: '/admin/withdrawals' });
  if (stats?.suspiciousWithdrawals > 0) urgentAlerts.push({ type: 'danger', text: `${stats.suspiciousWithdrawals} suspicious withdrawals need review`, link: '/admin/withdrawals?tab=suspicious' });
  if (stats?.flaggedAccounts > 0) urgentAlerts.push({ type: 'warning', text: `${stats.flaggedAccounts} accounts flagged as suspicious`, link: '/admin/security' });

  const signupChartData = [
    { name: 'Week 1', users: 45 }, { name: 'Week 2', users: 52 }, { name: 'Week 3', users: 38 },
    { name: 'Week 4', users: 61 }, { name: 'Week 5', users: 47 }, { name: 'Week 6', users: 73 },
  ];

  const earningsChartData = [
    { name: 'Mon', earnings: 2400 }, { name: 'Tue', earnings: 3200 }, { name: 'Wed', earnings: 2800 },
    { name: 'Thu', earnings: 4100 }, { name: 'Fri', earnings: 3800 }, { name: 'Sat', earnings: 2200 }, { name: 'Sun', earnings: 1900 },
  ];

  const trafficData = [
    { name: 'Offers', value: 45 }, { name: 'Surveys', value: 30 }, { name: 'Tasks', value: 15 }, { name: 'Referrals', value: 10 },
  ];

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Platform overview at a glance</p>
        </div>
      </div>

      {urgentAlerts.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {urgentAlerts.map((alert, i) => (
            <Link key={i} to={alert.link} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px', borderRadius: 'var(--radius-sm)',
              background: alert.type === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${alert.type === 'danger' ? '#ef4444' : '#f59e0b'}`,
              color: alert.type === 'danger' ? '#fca5a5' : '#fbbf24',
              fontWeight: 600, fontSize: '0.9rem',
            }}>
              <FiAlertTriangle size={18} />
              <span>{alert.text}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>View →</span>
            </Link>
          ))}
        </div>
      )}

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: card.color + '15', color: card.color }}><card.icon size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
              {card.change && <span className="stat-subtitle" style={{ color: card.change.startsWith('+') ? '#22c55e' : card.change === '0%' ? 'var(--text-dark)' : '#ef4444' }}>{card.change} this week</span>}
              {card.sub && <span className="stat-subtitle">{card.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row" style={{ marginBottom: 24 }}>
        <div className="card chart-card">
          <h3>User Signups (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={signupChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <h3>Rewards Paid Per Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={earningsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="earnings" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card chart-card" style={{ margin: 0 }}>
          <h3>Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={trafficData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {trafficData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="transactions-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
            {recentActivity.length > 0 ? recentActivity.map((t, i) => (
              <div key={t._id || i} className="transaction-item">
                <div className="transaction-icon" style={{ background: t.type === 'earning' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: t.type === 'earning' ? '#22c55e' : '#ef4444' }}>
                  <FiDollarSign size={16} />
                </div>
                <div className="transaction-info">
                  <span className="transaction-desc" style={{ fontSize: '0.83rem' }}>{t.user?.username}: {t.description}</span>
                  <span className="transaction-date">{new Date(t.createdAt).toLocaleString()}</span>
                </div>
                <div className="transaction-amount">
                  <span style={{ color: (t.amount || 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
                    {(t.amount || 0) >= 0 ? '+' : ''}${Math.abs(t.amount || 0).toFixed(0)}
                  </span>
                </div>
              </div>
            )) : <p className="empty-state">No activity yet</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Users</h3>
          <Link to="/admin/users" className="card-link">View All</Link>
        </div>
        {loading ? <Skeleton type="table" count={3} /> : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th>Earned</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td><Link to={`/admin/users/${u._id}`} style={{ fontWeight: 500, color: 'var(--primary)' }}>{u.username}</Link></td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>{u.balance?.toFixed(0)} coins</td>
                    <td>{u.totalEarned?.toFixed(0)} coins</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
