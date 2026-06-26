import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiRefreshCw, FiDollarSign, FiGlobe, FiCreditCard } from 'react-icons/fi';

const AdminLiveFeed = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await adminAPI.getLiveFeed();
      setPayments(res.data.payments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchFeed, 15000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getMethodIcon = (method) => {
    switch (method) {
      case 'PayPal': return '💳';
      case 'Gift Card': return '🎁';
      case 'BTC': case 'Crypto': return '₿';
      default: return '💰';
    }
  };

  const getFlag = (country) => {
    const flags = { US: '🇺🇸', UK: '🇬🇧', DE: '🇩🇪', CA: '🇨🇦', FR: '🇫🇷', AU: '🇦🇺', IN: '🇮🇳', BR: '🇧🇷' };
    return flags[country] || '🌍';
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1><FiDollarSign style={{ marginRight: 8 }} />Live Payment Feed</h1>
        <p>Real-time payouts happening right now on your platform</p>
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
        <Link to="/admin/live-feed" className="active">Live Feed</Link>
        <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
      </nav>

      <div className="live-feed-controls">
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE — Payments are processing</span>
        </div>
        <label className="toggle-label">
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
          <span>Auto-refresh (15s)</span>
        </label>
        <button className="btn btn-sm" onClick={fetchFeed}><FiRefreshCw size={14} /> Refresh</button>
      </div>

      <div className="live-feed-grid">
        {loading ? (
          <div className="loading">Loading feed...</div>
        ) : (
          payments.map((p, i) => (
            <div key={i} className="live-feed-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feed-avatar">{p.avatar}</div>
              <div className="feed-info">
                <div className="feed-user">{p.user} {getFlag(p.country)}</div>
                <div className="feed-method">{getMethodIcon(p.method)} {p.method}</div>
              </div>
              <div className="feed-amount">${p.amount}</div>
              <div className="feed-time">{p.time}</div>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3>Payment Stats</h3>
        </div>
        <div className="platform-stats-grid">
          <div className="platform-stat">
            <span className="ps-label">Total Paid Today</span>
            <span className="ps-value">${payments.reduce((s, p) => s + p.amount, 0)}</span>
          </div>
          <div className="platform-stat">
            <span className="ps-label">Payouts Today</span>
            <span className="ps-value">{payments.length}</span>
          </div>
          <div className="platform-stat">
            <span className="ps-label">Most Used Method</span>
            <span className="ps-value">
              {(() => {
                const counts = {};
                payments.forEach(p => { counts[p.method] = (counts[p.method] || 0) + 1; });
                return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
              })()}
            </span>
          </div>
          <div className="platform-stat">
            <span className="ps-label">Avg Payout</span>
            <span className="ps-value">${(payments.reduce((s, p) => s + p.amount, 0) / Math.max(payments.length, 1)).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveFeed;