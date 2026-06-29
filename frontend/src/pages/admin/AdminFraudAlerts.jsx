import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiAlertTriangle, FiShield, FiClock, FiUserX, FiRefreshCw, FiActivity, FiSearch, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AdminFraudAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState('alerts');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertRes, flagRes] = await Promise.all([
        adminAPI.getFraudAlerts({ status: filter || undefined }),
        adminAPI.getFlaggedUsers(),
      ]);
      setAlerts(alertRes.data.alerts);
      setNewCount(alertRes.data.newCount);
      setFlaggedUsers(flagRes.data.users);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const updateAlert = async (id, status) => {
    try {
      await adminAPI.updateFraudAlert(id, { status });
      setAlerts(alerts.map(a => a._id === id ? { ...a, status } : a));
      if (status === 'new') {
        setNewCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) { console.error(err); }
  };

  const viewUserActivity = async (userId) => {
    try {
      const res = await adminAPI.getUserActivityDetail(userId);
      setUserDetail(res.data);
      setSelectedUser(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityColor = (s) => {
    switch (s) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'bot': return '🤖';
      case 'velocity': return '⚡';
      case 'multi-account': return '👥';
      case 'vpn': return '🔒';
      case 'time-anomaly': return '🌙';
      case 'session': return '⏱️';
      default: return '⚠️';
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1><FiShield style={{ marginRight: 8 }} />Fraud Detection</h1>
        <p>Real-time AI fraud monitoring — bot detection, velocity checks, multi-account farming & VPN/proxy alerts</p>
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
        <Link to="/admin/activity">Activity</Link>
        <Link to="/admin/live-feed">Live Feed</Link>
        <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud" className="active">Fraud AI</Link>
      </nav>

      <div className="fraud-stats-row">
        <div className="fraud-stat critical">
          <FiAlertTriangle size={20} />
          <div>
            <strong>{alerts.filter(a => a.severity === 'critical').length}</strong>
            <span>Critical</span>
          </div>
        </div>
        <div className="fraud-stat warn">
          <FiClock size={20} />
          <div>
            <strong>{alerts.filter(a => a.severity === 'high').length}</strong>
            <span>High Risk</span>
          </div>
        </div>
        <div className="fraud-stat info">
          <FiUserX size={20} />
          <div>
            <strong>{flaggedUsers.length}</strong>
            <span>Flagged Users</span>
          </div>
        </div>
        <div className="fraud-stat new">
          <FiActivity size={20} />
          <div>
            <strong>{newCount}</strong>
            <span>New Alerts</span>
          </div>
        </div>
      </div>

      <div className="fraud-tabs">
        <button className={`fraud-tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
          <FiAlertTriangle size={14} /> Live Alerts {newCount > 0 && <span className="alert-badge">{newCount}</span>}
        </button>
        <button className={`fraud-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          <FiUserX size={14} /> Flagged Users ({flaggedUsers.length})
        </button>
      </div>

      {tab === 'alerts' && (
        <div className="card">
          <div className="card-header">
            <h3>Real-time Fraud Alerts</h3>
            <div className="card-actions">
              <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="dismissed">Dismissed</option>
                <option value="resolved">Resolved</option>
              </select>
              <button className="btn btn-sm" onClick={fetchData}><FiRefreshCw size={14} /> Refresh</button>
            </div>
          </div>
          <div className="fraud-alerts-list">
            {alerts.length === 0 ? (
              <div className="empty-state">No alerts match this filter</div>
            ) : (
              alerts.map(alert => (
                <div key={alert._id} className={`fraud-alert-card severity-${alert.severity} status-${alert.status}`}>
                  <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <strong>{alert.title}</strong>
                      <span className="alert-user">{alert.user}</span>
                    </div>
                    <p className="alert-desc">{alert.description}</p>
                    <div className="alert-meta">
                      <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="alert-type">{alert.type}</span>
                      <span className="alert-time">{new Date(alert.createdAt || alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="alert-actions">
                    {alert.status === 'new' && (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => updateAlert(alert._id, 'reviewing')}>
                          <FiEye size={12} /> Review
                        </button>
                        <button className="btn btn-sm" onClick={() => updateAlert(alert._id, 'dismissed')}>
                          <FiXCircle size={12} /> Dismiss
                        </button>
                      </>
                    )}
                    {alert.status === 'reviewing' && (
                      <>
                        <button className="btn btn-sm btn-success" onClick={() => updateAlert(alert._id, 'resolved')}>
                          <FiCheckCircle size={12} /> Resolve
                        </button>
                        <button className="btn btn-sm" onClick={() => updateAlert(alert._id, 'dismissed')}>
                          <FiXCircle size={12} /> Dismiss
                        </button>
                      </>
                    )}
                    <button className="btn btn-sm" onClick={() => viewUserActivity(alert.userId || alert.user)} title="Investigate">
                      <FiSearch size={12} /> Investigate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3>Flagged Users — Risk Score Rankings</h3>
          </div>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>User</th>
                  <th>Risk Score</th>
                  <th>Actions Tracked</th>
                  <th>Detection Reasons</th>
                  <th>Investigate</th>
                </tr>
              </thead>
              <tbody>
                {flaggedUsers.map(u => (
                  <tr key={u.userId}>
                    <td>
                      <div className="risk-bar-container">
                        <div className="risk-bar" style={{
                          width: `${u.riskScore}%`,
                          background: u.riskScore > 70 ? '#ef4444' : u.riskScore > 40 ? '#f59e0b' : '#3b82f6'
                        }}></div>
                      </div>
                    </td>
                    <td><strong>{u.username}</strong></td>
                    <td><span className={`risk-score ${u.riskScore > 70 ? 'high' : u.riskScore > 40 ? 'mid' : 'low'}`}>{u.riskScore}%</span></td>
                    <td>{u.totalActions}</td>
                    <td>
                      <ul className="fraud-reasons">
                        {u.reasons.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}
                        {u.reasons.length > 2 && <li className="more">+{u.reasons.length - 2} more</li>}
                      </ul>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => viewUserActivity(u.userId)}>
                        <FiSearch size={12} /> View Activity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && userDetail && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <h3>Investigation: {userDetail.userId}</h3>
            <button className="btn btn-sm" onClick={() => { setSelectedUser(null); setUserDetail(null); }}>
              <FiXCircle size={12} /> Close
            </button>
          </div>
          <div className="investigation-grid">
            <div className="invest-item">
              <strong>User ID</strong>
              <span>{userDetail.userId}</span>
            </div>
            <div className="invest-item">
              <strong>IP Address</strong>
              <span>{userDetail.ip}</span>
            </div>
            <div className="invest-item">
              <strong>Total Actions</strong>
              <span>{userDetail.totalActions}</span>
            </div>
            <div className="invest-item">
              <strong>Session Start</strong>
              <span>{new Date(userDetail.sessionStart).toLocaleString()}</span>
            </div>
            {userDetail.fraudFlags && (
              <div className="invest-item full-width">
                <strong>Fraud Flags</strong>
                <ul className="fraud-reasons">
                  {userDetail.fraudFlags.reasons.map((r, i) => <li key={i}>🚨 {r}</li>)}
                </ul>
              </div>
            )}
          </div>
          <div className="admin-table" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Detail</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {userDetail.actions.slice(-30).reverse().map((a, i) => (
                  <tr key={i}>
                    <td>{userDetail.actions.length - i - 30 + 1}</td>
                    <td><span className="action-type-badge">{a.type}</span></td>
                    <td style={{ fontSize: '0.8rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.page || a.taskName || a.action || `Step ${a.step || ''}`}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(a.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3>Fraud Detection Rules — Active</h3></div>
        <div className="fraud-rules-grid">
          <div className="fraud-rule">
            <div className="rule-icon critical">🤖</div>
            <h4>Bot Detection</h4>
            <p>Flags users when time between consecutive actions is <strong>&lt;500ms</strong>. Also detects identical click intervals (scripted automation).</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon warn">⚡</div>
            <h4>Velocity Check</h4>
            <p>Flags users completing <strong>&gt;20 tasks/hour</strong> or <strong>&gt;100 tasks/day</strong>. Normal humans cannot sustain this rate.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon warn">👥</div>
            <h4>Multi-Account Farm</h4>
            <p>Detects <strong>&gt;3 accounts</strong> sharing the same IP address. Common pattern for farming operations.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon info">🔒</div>
            <h4>VPN/Proxy Detection</h4>
            <p>Identifies connections routing through known VPNs, proxies, or datacenter IPs — often used to bypass geo-restrictions.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon info">🌙</div>
            <h4>Time Anomaly</h4>
            <p>Flags users whose <strong>&gt;80% of activity</strong> occurs between midnight and 6 AM — unusual for legitimate users.</p>
          </div>
          <div className="fraud-rule">
            <div className="rule-icon info">⏱️</div>
            <h4>Session Analysis</h4>
            <p>Detects sessions lasting <strong>&lt;3 seconds</strong>. Legitimate users cannot meaningfully interact in under 3 seconds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFraudAlerts;