import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiArrowLeft, FiMail, FiDollarSign, FiAward, FiCalendar, FiCheck, FiX, FiStar } from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [showAdjustXP, setShowAdjustXP] = useState(false);
  const [xpAmount, setXpAmount] = useState('');
  const [levelValue, setLevelValue] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getUsers({ search: id, limit: 1 });
        const found = res.data.users.find(u => u._id === id);
        setUser(found || {
          _id: id, username: 'DemoUser', email: 'demo@cashli.com',
          balance: 1250, totalEarned: 3200, totalWithdrawn: 500,
          level: 3, xp: 850, role: 'user', isActive: true,
          dailyStreak: 5, referralCode: 'DEMO123',
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const toggleStatus = async () => {
    try {
      await adminAPI.toggleUserStatus(id);
      setUser({ ...user, isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.adjustBalance(id, { amount: parseFloat(adjustAmount), reason: adjustReason });
      setUser(res.data.user);
      toast.success('Balance adjusted');
      setShowAdjust(false);
      setAdjustAmount('');
      setAdjustReason('');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleAdjustXP = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.adjustXP(id, { xp: parseInt(xpAmount) || 0, level: parseInt(levelValue) || user.level });
      setUser(res.data.user);
      toast.success('XP/Level updated');
      setShowAdjustXP(false);
      setXpAmount('');
      setLevelValue('');
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="page-loading">Loading user details...</div>;
  if (!user) return <div className="page-loading">User not found</div>;

  const stats = [
    { label: 'Balance', value: `${user.balance.toFixed(0)} coins`, icon: FiDollarSign, color: '#22c55e' },
    { label: 'Total Earned', value: `${user.totalEarned.toFixed(0)} coins`, icon: FiDollarSign, color: '#6366f1' },
    { label: 'Total Withdrawn', value: `${user.totalWithdrawn.toFixed(0)} coins`, icon: FiDollarSign, color: '#ef4444' },
    { label: 'Level', value: user.level, icon: FiAward, color: '#f59e0b' },
    { label: 'XP', value: user.xp, icon: FiAward, color: '#8b5cf6' },
    { label: 'Streak', value: `${user.dailyStreak} days`, icon: FiCalendar, color: '#ec4899' },
  ];

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <Link to="/admin/users" className="btn btn-ghost" style={{ marginBottom: 8 }}>
            <FiArrowLeft size={18} /> Back to Users
          </Link>
          <h1>{user.username}</h1>
          <p>Full user profile and management</p>
        </div>
      </div>

      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/analytics">Analytics</Link>
        <Link to="/admin/users" className="active">Users</Link>
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

      <div className="profile-header-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="profile-avatar-large" style={{ width: 80, height: 80, fontSize: '2.2rem' }}>
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem' }}>{user.username}</h2>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiMail size={14} /> {user.email}
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="profile-badge">{user.role}</span>
            <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="profile-badge">Code: {user.referralCode}</span>
            <span className="profile-badge">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => setShowAdjust(true)}>Adjust Balance</button>
          <button className="btn btn-sm" onClick={() => { setXpAmount(String(user.xp)); setLevelValue(String(user.level)); setShowAdjustXP(true); }}>Adjust XP/Level</button>
          <button className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`} onClick={toggleStatus}>
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>
              <s.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="transactions-list">
            <p className="empty-state">View full transaction log in Transactions panel</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Referrals</h3></div>
          <p className="empty-state">Referral data available in Referrals panel</p>
        </div>
      </div>

      <Modal isOpen={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust User Balance">
        <form onSubmit={handleAdjust}>
          <p style={{ marginBottom: 16 }}>
            Current balance: <strong>{user.balance} coins</strong>
          </p>
          <div className="form-group">
            <label>Amount (positive to add, negative to deduct)</label>
            <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="e.g. 100 or -50" required />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="e.g. Bonus, penalty, correction" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Apply Adjustment</button>
        </form>
      </Modal>

      <Modal isOpen={showAdjustXP} onClose={() => setShowAdjustXP(false)} title="Adjust XP & Level">
        <form onSubmit={handleAdjustXP}>
          <p style={{ marginBottom: 16 }}>
            Current: <strong>Level {user.level}</strong> &middot; <strong>{user.xp} XP</strong>
          </p>
          <div className="form-group">
            <label>Set XP</label>
            <input type="number" value={xpAmount} onChange={(e) => setXpAmount(e.target.value)} placeholder="e.g. 1000" required />
          </div>
          <div className="form-group">
            <label>Set Level</label>
            <input type="number" value={levelValue} onChange={(e) => setLevelValue(e.target.value)} placeholder="e.g. 5" min="1" max="100" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Update XP & Level</button>
        </form>
      </Modal>
    </div>
  );
};

export default UserDetail;
