import { useState, useEffect } from 'react';
import { levelsAPI } from '../services/api';
import { FiAward, FiCheck, FiLock } from 'react-icons/fi';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await levelsAPI.getAchievements();
        setAchievements(res.data.achievements);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="page achievements-page">
      <div className="page-header">
        <h1>Achievements</h1>
        <p>Unlock achievements and earn bonus rewards</p>
      </div>

      <div className="achievement-progress">
        <span>{unlocked} / {achievements.length} Unlocked</span>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${(unlocked / achievements.length) * 100}%` }} />
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <div className="achievements-grid">
          {achievements.map((ach, i) => (
            <div key={i} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">
                {ach.unlocked ? ach.icon : <FiLock size={24} />}
              </div>
              <div className="achievement-info">
                <h3>{ach.name}</h3>
                <p>{ach.description}</p>
              </div>
              <div className="achievement-reward">
                {ach.unlocked ? (
                  <FiCheck size={20} color="#22c55e" />
                ) : (
                  <div className="reward-preview">
                    <span>+{ach.reward.coins}</span>
                    <span>+{ach.reward.xp}XP</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
