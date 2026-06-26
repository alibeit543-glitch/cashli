import { useState, useEffect } from 'react';
import { levelsAPI } from '../services/api';
import { FiAward, FiTrendingUp, FiStar } from 'react-icons/fi';

const levelColors = [
  '#8B7355', '#C0C0C0', '#FFD700', '#E5E4E2', '#B9F2FF', '#8A2BE2', '#FF4500', '#FF00FF',
];

const Levels = () => {
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [progRes, lbRes] = await Promise.all([
          levelsAPI.getProgress(),
          levelsAPI.getLeaderboard(),
        ]);
        setProgress(progRes.data);
        setLeaderboard(lbRes.data.leaderboard);
        setUserRank(lbRes.data.userRank);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="page levels-page">
      <div className="page-header">
        <h1>Levels & Leaderboard</h1>
        <p>Climb the ranks and earn rewards</p>
      </div>

      {progress && (
        <div className="current-level-card">
          <div className="level-badge" style={{ background: levelColors[progress.current?.level - 1] || '#6366f1' }}>
            <span className="level-number">{progress.current?.level}</span>
            <span className="level-name">{progress.current?.name}</span>
          </div>
          <div className="level-progress-info">
            <h3>Level {progress.current?.level} - {progress.current?.name}</h3>
            {progress.next && (
              <>
                <div className="xp-bar-container">
                  <div className="xp-bar-header">
                    <span>{progress.progress}% to Level {progress.next.level}</span>
                    <span>{progress.xpToNext} XP needed</span>
                  </div>
                  <div className="xp-bar">
                    <div className="xp-bar-fill" style={{ width: `${progress.progress}%` }} />
                  </div>
                </div>
                <p className="text-muted">Next: Level {progress.next.level} - {progress.next.name}</p>
              </>
            )}
            {!progress.next && <p className="text-muted">Maximum level reached!</p>}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3><FiStar /> Leaderboard</h3>
          </div>
          <div className="leaderboard-list">
            {leaderboard.map((entry, i) => (
              <div key={entry._id} className={`leaderboard-item ${i + 1 === userRank ? 'highlight' : ''}`}>
                <span className={`lb-rank ${i < 3 ? 'top' : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div className="lb-avatar">
                  {entry.username?.charAt(0).toUpperCase()}
                </div>
                <div className="lb-info">
                  <span className="lb-name">{entry.username}</span>
                  <span className="lb-level">Level {entry.level}</span>
                </div>
                <span className="lb-xp">{entry.xp.toLocaleString()} XP</span>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="empty-state">No data yet</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><FiTrendingUp /> All Levels</h3>
          </div>
          <div className="levels-list">
            {[
              { level: 1, name: 'Bronze', reward: 0 },
              { level: 2, name: 'Silver', reward: 10 },
              { level: 3, name: 'Gold', reward: 25 },
              { level: 4, name: 'Platinum', reward: 50 },
              { level: 5, name: 'Diamond', reward: 100 },
              { level: 6, name: 'Elite', reward: 200 },
              { level: 7, name: 'Legend', reward: 500 },
              { level: 8, name: 'Mythic', reward: 1000 },
            ].map((lvl) => (
              <div key={lvl.level} className={`level-item ${progress?.current?.level === lvl.level ? 'active' : ''}`}>
                <div className="level-icon" style={{ background: levelColors[lvl.level - 1] }}>
                  {lvl.level}
                </div>
                <div className="level-item-info">
                  <span className="level-item-name">{lvl.name}</span>
                  <span className="level-item-xp">{lvl.level === 1 ? '0' : `${[0, 500, 1500, 4000, 10000, 25000, 50000, 100000][lvl.level - 1]}+`} XP</span>
                </div>
                {lvl.reward > 0 && <span className="level-reward">+{lvl.reward} coins</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Levels;
