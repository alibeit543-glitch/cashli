import { useState, useEffect } from 'react';
import { referralsAPI } from '../services/api';
import { FiCopy, FiCheck, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Referrals = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statRes, lbRes] = await Promise.all([
          referralsAPI.getStats(),
          referralsAPI.getLeaderboard({ limit: 10 }),
        ]);
        setStats(statRes.data);
        setLeaderboard(lbRes.data.leaderboard);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page referrals-page">
      <div className="page-header">
        <h1>Refer & Earn</h1>
        <p>Invite friends and earn 50 coins for each referral</p>
      </div>

      <div className="referral-banner">
        <div className="referral-info">
          <h2>Share your referral link</h2>
          <p>You get 50 coins when your friend completes their first offer!</p>
        </div>
        <div className="referral-code-box">
          <span className="referral-code">{stats?.referralCode || '------'}</span>
          <button className="btn btn-primary" onClick={copyLink}>
            {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#6366f120', color: '#6366f1' }}>
            <FiUsers size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Referrals</span>
            <span className="stat-value">{stats?.total || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#22c55e20', color: '#22c55e' }}>
            <FiAward size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Earned</span>
            <span className="stat-value">{stats?.credited || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
            <FiTrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats?.pending || 0}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Your Referrals</h3>
          </div>
          <div className="referrals-list">
            {stats?.referrals?.length > 0 ? (
              stats.referrals.map((ref) => (
                <div key={ref._id} className="referral-item">
                  <div className="ref-avatar">
                    {ref.referred?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ref-info">
                    <span className="ref-name">{ref.referred?.username}</span>
                    <span className="ref-date">
                      Joined {new Date(ref.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`status-badge ${ref.status}`}>
                    {ref.status === 'credited' ? 'Earned 50' : 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-state">No referrals yet. Share your link!</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Referral Leaderboard</h3>
          </div>
          <div className="leaderboard-list">
            {leaderboard.map((entry, i) => (
              <div key={i} className="leaderboard-item">
                <span className="lb-rank">{i + 1}</span>
                <div className="lb-avatar">
                  {entry.username?.charAt(0).toUpperCase()}
                </div>
                <span className="lb-name">{entry.username}</span>
                <span className="lb-count">{entry.referrals} refs</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="empty-state">Be the first to refer!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
