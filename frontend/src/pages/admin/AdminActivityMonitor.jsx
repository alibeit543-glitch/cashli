import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiActivity, FiClock, FiMousePointer, FiMonitor, FiSearch, FiRefreshCw } from 'react-icons/fi';

const AdminActivityMonitor = () => {
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data);
      setActivities([
        { user: 'DemoUser', task: 'Download & Install App', time: '4m 32s', steps: 12, status: 'completed', date: new Date(Date.now() - 3600000).toISOString() },
        { user: 'Alice', task: 'Complete a 5-min Survey', time: '5m 10s', steps: 8, status: 'completed', date: new Date(Date.now() - 7200000).toISOString() },
        { user: 'Bob', task: 'Sign Up for Service', time: '2m 45s', steps: 6, status: 'completed', date: new Date(Date.now() - 10800000).toISOString() },
        { user: 'Charlie', task: 'Watch Video Offer', time: '1m 20s', steps: 3, status: 'completed', date: new Date(Date.now() - 14400000).toISOString() },
        { user: 'DemoUser', task: 'iOS Exclusive Survey', time: '0m 00s', steps: 0, status: 'abandoned', date: new Date(Date.now() - 18000000).toISOString() },
        { user: 'Eve', task: 'Make a Purchase Offer', time: '8m 15s', steps: 15, status: 'completed', date: new Date(Date.now() - 21600000).toISOString() },
        { user: 'Alice', task: 'Download & Install App', time: '3m 05s', steps: 9, status: 'pending', date: new Date(Date.now() - 25200000).toISOString() },
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = activities.filter(a =>
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.task.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (s) => {
    switch (s) {
      case 'completed': return '●';
      case 'pending': return '◌';
      case 'abandoned': return '✕';
      case 'in-progress': return '▶';
      default: return '○';
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1><FiActivity style={{ marginRight: 8 }} />Activity Monitor</h1>
        <p>Real-time view of user actions, task completions & session behavior</p>
      </div>

      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/analytics">Analytics</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/offers">Offers</Link>
        <Link to="/admin/withdrawals">Withdrawals</Link>
        <Link to="/admin/transactions">Transactions</Link>
        <Link to="/admin/completions">Completions</Link>
                <Link to="/admin/referrals">Referrals</Link>
        <Link to="/admin/activity" className="active">Activity</Link>
        <Link to="/admin/live-feed">Live Feed</Link>
        <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
      </nav>

      {analytics && (
        <div className="activity-stats-row">
          <div className="activity-stat">
            <FiMonitor />
            <div>
              <strong>{analytics.overview.activeToday}</strong>
              <span>Active Today</span>
            </div>
          </div>
          <div className="activity-stat">
            <FiClock />
            <div>
              <strong>{analytics.overview.avgSessionTime}</strong>
              <span>Avg Session</span>
            </div>
          </div>
          <div className="activity-stat">
            <FiActivity />
            <div>
              <strong>{analytics.overview.completionRate}</strong>
              <span>Completion Rate</span>
            </div>
          </div>
          <div className="activity-stat">
            <FiMousePointer />
            <div>
              <strong>{analytics.overview.avgTaskTime}</strong>
              <span>Avg Task Time</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>User Activity Log</h3>
          <div className="card-actions">
            <div className="search-box">
              <FiSearch size={16} />
              <input
                type="text"
                placeholder="Search user or task..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-sm" onClick={fetchData}>
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>User</th>
                <th>Task / Page</th>
                <th>Time Taken</th>
                <th>Steps / Clicks</th>
                <th>Time per Step</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No activity found</td></tr>
              ) : (
                filtered.map((a, i) => (
                  <tr key={i}>
                    <td><span className={`status-dot status-${a.status}`} title={a.status}>{getStatusIcon(a.status)}</span></td>
                    <td><Link to={`/admin/users/${a.user}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{a.user}</Link></td>
                    <td>{a.task}</td>
                    <td><span className="time-badge">{a.time}</span></td>
                    <td>{a.steps} steps</td>
                    <td>{a.time === '0m 00s' ? '—' : `${(parseInt(a.time.split('m')[0]) * 60 + parseInt(a.time.split('m ')[1]?.replace('s', '') || '0')) / Math.max(a.steps, 1)}s`}</td>
                    <td>{new Date(a.date).toLocaleDateString()} {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Real-time Activity Explanation</h3>
        </div>
        <div className="activity-explain">
          <div className="explain-item">
            <h4>⚡ How Activity Tracking Works</h4>
            <p>Every user action is tracked: page views, task starts, clicks per step, and time spent on each task. This gives you full visibility into user behavior.</p>
          </div>
          <div className="explain-item">
            <h4>📊 What You Can See</h4>
            <ul>
              <li><strong>Time Taken</strong> — How long a user spent completing each task</li>
              <li><strong>Steps/Clicks</strong> — Number of actions the user took during the task</li>
              <li><strong>Time per Step</strong> — Average time between actions (helps detect bots)</li>
              <li><strong>Status</strong> — Completed, Pending, Abandoned, or In Progress</li>
              <li><strong>Session Duration</strong> — How long users stay on the app</li>
              <li><strong>Page Flow</strong> — Which pages users visit and in what order</li>
            </ul>
          </div>
          <div className="explain-item">
            <h4>🛡️ Fraud Detection Signals</h4>
            <ul>
              <li>❌ Time per step &lt; 0.5s = likely bot automation</li>
              <li>❌ 100+ tasks completed in 1 hour = suspicious activity</li>
              <li>❌ All steps at exact same interval = scripted behavior</li>
              <li>✅ Natural variance in timing = real human user</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityMonitor;