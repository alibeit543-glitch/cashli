import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiUsers, FiShield, FiAlertTriangle, FiCheckCircle, FiClock, FiRefreshCw, FiSearch, FiXCircle } from 'react-icons/fi';

const FlagIcon = ({ code }) => {
  const colors = { legitimate: '#22c55e', fraud: '#ef4444', flagged: '#f59e0b', pending: '#3b82f6' };
  return <span style={{ color: colors[code] || '#64748b', fontWeight: 700 }}>{code === 'legitimate' ? '✓' : code === 'fraud' ? '✗' : code === 'flagged' ? '!' : '?'}</span>;
};

const AdminReferralMonitor = () => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReferralMonitor({ status: filter === 'all' ? undefined : filter });
      setData(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  if (!data) return <div className="page admin-page"><div className="loading">Loading referral monitor...</div></div>;

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1><FiUsers style={{ marginRight: 8 }} />Referral Monitor</h1>
        <p>Detect fake referrals, self-referrals, and referral farming</p>
      </div>

      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/analytics">Analytics</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/offers">Offers</Link>
        <Link to="/admin/withdrawals">Withdrawals</Link>
        <Link to="/admin/transactions">Transactions</Link>
        <Link to="/admin/completions">Completions</Link>
        <Link to="/admin/activity">Activity</Link>
        <Link to="/admin/referrals" className="active">Referrals</Link>
        <Link to="/admin/live-feed">Live Feed</Link>
        <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
      </nav>

      <div className="fraud-stats-row">
        <div className="fraud-stat info">
          <FiUsers size={20} />
          <div><strong>{data.stats.total}</strong><span>Total Referrals</span></div>
        </div>
        <div className="fraud-stat critical">
          <FiAlertTriangle size={20} />
          <div><strong>{data.stats.fraud}</strong><span>Fraud</span></div>
        </div>
        <div className="fraud-stat warn">
          <FiXCircle size={20} />
          <div><strong>{data.stats.flagged}</strong><span>Flagged</span></div>
        </div>
        <div className="fraud-stat info">
          <FiShield size={20} />
          <div><strong>{data.stats.totalRewardsAtRisk} coins</strong><span>Rewards at Risk</span></div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Referral Status Breakdown</h3></div>
          <div className="referral-breakdown">
            <div className="breakdown-row">
              <span className="breakdown-label"><FiCheckCircle size={14} color="#22c55e" /> Legitimate</span>
              <span className="breakdown-value">{data.stats.legitimate}</span>
              <div className="breakdown-bar"><div style={{ width: `${(data.stats.legitimate / Math.max(data.stats.total, 1)) * 100}%`, background: '#22c55e', height: '100%', borderRadius: 4 }}></div></div>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label"><FiAlertTriangle size={14} color="#ef4444" /> Fraud</span>
              <span className="breakdown-value">{data.stats.fraud}</span>
              <div className="breakdown-bar"><div style={{ width: `${(data.stats.fraud / Math.max(data.stats.total, 1)) * 100}%`, background: '#ef4444', height: '100%', borderRadius: 4 }}></div></div>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label"><FiXCircle size={14} color="#f59e0b" /> Flagged</span>
              <span className="breakdown-value">{data.stats.flagged}</span>
              <div className="breakdown-bar"><div style={{ width: `${(data.stats.flagged / Math.max(data.stats.total, 1)) * 100}%`, background: '#f59e0b', height: '100%', borderRadius: 4 }}></div></div>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label"><FiClock size={14} color="#3b82f6" /> Pending</span>
              <span className="breakdown-value">{data.stats.pending}</span>
              <div className="breakdown-bar"><div style={{ width: `${(data.stats.pending / Math.max(data.stats.total, 1)) * 100}%`, background: '#3b82f6', height: '100%', borderRadius: 4 }}></div></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Top Fraud Referrers</h3></div>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Fraud Count</th>
                  <th>Total Refs</th>
                  <th>Legit Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.stats.topFraudReferrers.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.referrer}</strong></td>
                    <td><span style={{ color: '#ef4444', fontWeight: 700 }}>{r.fraudCount}</span></td>
                    <td>{r.totalReferrals}</td>
                    <td>{r.legitRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Referral Activity Log</h3>
          <div className="card-actions">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
              <option value="all">All</option>
              <option value="legitimate">Legitimate</option>
              <option value="fraud">Fraud</option>
              <option value="flagged">Flagged</option>
              <option value="pending">Pending</option>
            </select>
            <button className="btn btn-sm" onClick={fetchData}><FiRefreshCw size={14} /> Refresh</button>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Referrer</th>
                <th>Referee</th>
                <th>Time Diff</th>
                <th>Same IP?</th>
                <th>Referee Activity</th>
                <th>Tasks Done</th>
                <th>Flags</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              {data.referrals.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No referrals match this filter</td></tr>
              ) : (
                data.referrals.map((r, i) => (
                  <tr key={i} style={{ opacity: r.status === 'fraud' ? 0.85 : 1 }}>
                    <td><FlagIcon code={r.status} /></td>
                    <td><Link to={`/admin/users/${r.referrerId}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{r.referrer}</Link></td>
                    <td><Link to={`/admin/users/${r.refereeId}`} style={{ color: 'var(--text)', fontWeight: 500 }}>{r.referee}</Link></td>
                    <td><span className="time-badge">{r.timeDiff}</span></td>
                    <td>{r.ip === '192.168.1.100' && r.referrer === 'DemoUser' || r.flags.includes('SAME_IP') || r.flags.includes('SAME_IP_AS_REFERRER') ? <span style={{ color: '#ef4444' }}>⚠ Same IP</span> : <span style={{ color: '#22c55e' }}>Different</span>}</td>
                    <td><div className="activity-dots">{Array.from({ length: Math.min(r.refereeActivity > 0 ? 5 : 1, 5) }, (_, j) => <span key={j} className={`dot ${j < Math.ceil(r.refereeActivity / 15) ? 'filled' : ''}`}></span>)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>{r.refereeActivity}</span></div></td>
                    <td>{r.refereeTasks > 0 ? <span style={{ color: '#22c55e' }}>{r.refereeTasks}</span> : <span style={{ color: '#ef4444' }}>0</span>}</td>
                    <td>
                      {r.flags.length === 0 ? <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>Clean</span> : (
                        <div className="flag-list">
                          {r.flags.map((f, j) => <span key={j} className="flag-tag">{f}</span>)}
                        </div>
                      )}
                    </td>
                    <td>{r.reward} coins</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Referral Fraud Detection Rules</h3></div>
        <div className="fraud-rules-grid">
          <div className="fraud-rule">
            <div className="rule-icon">⏱️</div>
            <h4>Time Diff Too Short</h4>
            <p>Referee signed up <strong>&lt;1 minute</strong> after referrer shared the link. Automated account creation.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon">🔗</div>
            <h4>Same IP Detection</h4>
            <p>Referrer and referee share the same IP address. Self-referral or alt account farming.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon">📊</div>
            <h4>Zero Activity Check</h4>
            <p>Referred account has <strong>0 tasks completed</strong> and &lt;5 total actions. Dead/fake account.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon">⚡</div>
            <h4>Burst Creation</h4>
            <p>&gt;5 referrals created in a short burst. Pattern matches referral farm automation.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon">📈</div>
            <h4>Conversion Ratio</h4>
            <p>Abnormally high referral-to-earnings ratio compared to platform average (norm: 0.3 referrals/user).</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon">🕵️</div>
            <h4>IP Geolocation</h4>
            <p>Referee located in different country than referrer but signed up seconds later — impossible for real users.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralMonitor;