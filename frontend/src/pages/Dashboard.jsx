import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiGrid, FiUsers, FiAward, FiTrendingUp, FiGift } from 'react-icons/fi';
import StatCard from '../components/dashboard/StatCard';
import TransactionItem from '../components/wallet/TransactionItem';
import { walletAPI, referralsAPI, levelsAPI, bonusesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [levelProgress, setLevelProgress] = useState(null);
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, txnRes, refRes, levelRes, bonusRes] = await Promise.all([
          walletAPI.getBalance(),
          walletAPI.getTransactions({ limit: 5 }),
          referralsAPI.getStats(),
          levelsAPI.getProgress(),
          bonusesAPI.check(),
        ]);
        setData(walletRes.data);
        setRecentTxns(txnRes.data.transactions);
        setReferralStats(refRes.data);
        setLevelProgress(levelRes.data);
        setBonus(bonusRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const claimDaily = async () => {
    try {
      const res = await bonusesAPI.claimDaily();
      toast.success(res.data.message);
      updateUser({ ...user, dailyStreak: res.data.streak });
      setBonus({ canClaim: false, streak: res.data.streak });
      const walletRes = await walletAPI.getBalance();
      setData(walletRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already claimed today');
    }
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.username}!</h1>
          <p>Here's your earnings overview</p>
        </div>
        {bonus && (
          <button
            className={`btn ${bonus.canClaim ? 'btn-warning' : 'btn-disabled'}`}
            onClick={claimDaily}
            disabled={!bonus.canClaim}
          >
            <FiGift size={18} />
            {bonus.canClaim ? `Daily Bonus (Streak: ${bonus.streak || 0})` : 'Claimed Today'}
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard
          icon={FiDollarSign}
          label="Balance"
          value={`${data?.balance || 0} coins`}
          color="#22c55e"
          subtitle={`$${(data?.balance / 100).toFixed(2)} USD`}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Total Earned"
          value={`${data?.totalEarned || 0} coins`}
          color="#6366f1"
        />
        <StatCard
          icon={FiAward}
          label="Level"
          value={data?.level || 1}
          color="#f59e0b"
          subtitle={`${data?.xp || 0} XP total`}
        />
        <StatCard
          icon={FiUsers}
          label="Referrals"
          value={referralStats?.credited || 0}
          color="#ec4899"
          subtitle={`${referralStats?.total || 0} total`}
        />
      </div>

      {levelProgress && (
        <div className="xp-bar-container">
          <div className="xp-bar-header">
            <span>Level {levelProgress.current?.level} - {levelProgress.current?.name}</span>
            {levelProgress.next && (
              <span>{levelProgress.progress}% to Level {levelProgress.next.level}</span>
            )}
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${levelProgress.progress}%` }} />
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <Link to="/offers" className="quick-action">
              <FiGrid size={24} />
              <span>Browse Offers</span>
            </Link>
            <Link to="/withdraw" className="quick-action">
              <FiDollarSign size={24} />
              <span>Withdraw</span>
            </Link>
            <Link to="/referrals" className="quick-action">
              <FiUsers size={24} />
              <span>Refer Friends</span>
            </Link>
            <Link to="/achievements" className="quick-action">
              <FiAward size={24} />
              <span>Achievements</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to="/wallet" className="card-link">View all</Link>
          </div>
          <div className="transactions-list">
            {recentTxns.length > 0 ? (
              recentTxns.map((txn) => <TransactionItem key={txn._id} transaction={txn} />)
            ) : (
              <p className="empty-state">No transactions yet. Start earning!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
