import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiTrendingUp, FiUsers, FiClock, FiCheckCircle, FiBarChart2, FiMapPin, FiSmartphone } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminAPI.getAnalytics().then(r => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div className="page admin-page"><div className="loading">Loading analytics...</div></div>;

  const { overview, dailyData, topOffers, deviceBreakdown, countryBreakdown } = data;

  const lineCfg = {
    labels: dailyData.map(d => d.date.slice(5)),
    datasets: [
      { label: 'Earnings (coins)', data: dailyData.map(d => d.earnings), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
      { label: 'New Users', data: dailyData.map(d => d.registrations), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 },
    ],
  };

  const barCfg = {
    labels: dailyData.map(d => d.date.slice(5)),
    datasets: [
      { label: 'Completions', data: dailyData.map(d => d.completions), backgroundColor: '#6366f1', borderRadius: 4 },
      { label: 'Active Users', data: dailyData.map(d => d.users), backgroundColor: '#22c55e', borderRadius: 4 },
    ],
  };

  const devCfg = {
    labels: Object.keys(deviceBreakdown),
    datasets: [{
      data: Object.values(deviceBreakdown),
      backgroundColor: ['#6366f1', '#22c55e', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  const countryCfg = {
    labels: Object.keys(countryBreakdown),
    datasets: [{
      data: Object.values(countryBreakdown),
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#64748b'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1><FiBarChart2 style={{ marginRight: 8 }} />Analytics</h1>
        <p>Deep insights into platform performance & user behavior</p>
      </div>

      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/analytics" className="active">Analytics</Link>
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

      <div className="analytics-overview-grid">
        <div className="card metric-card">
          <FiUsers size={24} color="#6366f1" />
          <div className="metric-value">{overview.totalUsers.toLocaleString()}</div>
          <div className="metric-label">Total Users</div>
          <div className="metric-change positive">+{overview.activeToday} today</div>
        </div>
        <div className="card metric-card">
          <FiTrendingUp size={24} color="#22c55e" />
          <div className="metric-value">{overview.totalEarnings.toLocaleString()}</div>
          <div className="metric-label">Total Earnings (coins)</div>
          <div className="metric-change positive">+{Math.floor(overview.totalEarnings / 30)}/day avg</div>
        </div>
        <div className="card metric-card">
          <FiClock size={24} color="#f59e0b" />
          <div className="metric-value">{overview.avgSessionTime}</div>
          <div className="metric-label">Avg Session Time</div>
          <div className="metric-change">{overview.bounceRate} bounce rate</div>
        </div>
        <div className="card metric-card">
          <FiCheckCircle size={24} color="#3b82f6" />
          <div className="metric-value">{overview.completionRate}</div>
          <div className="metric-label">Task Completion Rate</div>
          <div className="metric-change">{overview.avgTaskTime} avg time</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="card chart-card">
          <h3>Earnings & User Growth</h3>
          <Line data={lineCfg} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' } }, y: { ticks: { color: '#64748b' } } } }} />
        </div>
        <div className="card chart-card">
          <h3>Completions & Active Users</h3>
          <Bar data={barCfg} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' } }, y: { ticks: { color: '#64748b' } } } }} />
        </div>
      </div>

      <div className="charts-row three-col">
        <div className="card chart-card">
          <h3><FiSmartphone /> Devices</h3>
          <Doughnut data={devCfg} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
        </div>
        <div className="card chart-card">
          <h3><FiMapPin /> Countries</h3>
          <Doughnut data={countryCfg} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
        </div>
        <div className="card chart-card">
          <h3>Top Offers</h3>
          <div className="top-offers-list">
            {topOffers.map((o, i) => (
              <div key={i} className="top-offer-item">
                <div className="top-offer-rank">#{i + 1}</div>
                <div className="top-offer-info">
                  <div className="top-offer-name">{o.name}</div>
                  <div className="top-offer-stats">{o.completions} completions</div>
                </div>
                <div className="top-offer-revenue">{o.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Activity Log</h3>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Task</th>
                <th>Time Taken</th>
                <th>Steps</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Detailed activity tracking available on the Activity Monitor page</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;