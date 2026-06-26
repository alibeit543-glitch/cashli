import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { offersAPI } from '../services/api';
import { FiArrowLeft, FiExternalLink, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Tracker from '../services/analyticsTracker';

const categoryIcons = { survey: '📋', offer: '🎯', video: '🎬', 'app-download': '📱', signup: '✍️', purchase: '🛒' };

const OfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingActive, setTrackingActive] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const startTime = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await offersAPI.getById(id);
        setOffer(res.data.offer);
        setCompletion(res.data.completion);
      } catch (err) {
        toast.error('Offer not found');
        navigate('/offers');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  // Track task steps in real-time when active
  useEffect(() => {
    if (!trackingActive) return;
    const interval = setInterval(() => {
      setStepCount(s => {
        const newStep = s + 1;
        Tracker.trackEvent('task_step', { taskId: id, step: newStep });
        return newStep;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [trackingActive, id]);

  const handleStart = async () => {
    try {
      const res = await offersAPI.startOffer(id);
      setCompletion(res.data.completion);
      startTime.current = Date.now();
      setTrackingActive(true);
      setStepCount(0);
      Tracker.trackEvent('task_step', { taskId: id, step: 0, action: 'task_start' });
      toast.success('Offer started! Tracking your activity...');
      if (offer.url) window.open(offer.url, '_blank');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start offer');
    }
  };

  const handleComplete = async () => {
    setTrackingActive(false);
    const timeSpent = formatDuration(Date.now() - startTime.current);
    Tracker.trackEvent('task_complete', {
      taskId: id,
      taskName: offer.title,
      timeSpent,
      stepsCount: stepCount,
    });
    toast.success(`Task completed in ${timeSpent}!`);
  };

  const formatDuration = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!offer) return null;

  return (
    <div className="page offer-detail-page">
      <button className="btn btn-ghost" onClick={() => navigate('/offers')}>
        <FiArrowLeft size={18} /> Back to Offers
      </button>

      <div className="offer-detail-card">
        <div className="offer-detail-header">
          <span className="offer-category-badge">
            {categoryIcons[offer.category]} {offer.category}
          </span>
          <h1>{offer.title}</h1>
          <div className="offer-reward-badge">
            <span className="reward-amount">+{offer.reward} coins</span>
            <span className="reward-xp">+{offer.xpReward} XP</span>
          </div>
        </div>

        <div className="offer-detail-body">
          <div className="detail-section">
            <h3>Description</h3>
            <p>{offer.description}</p>
          </div>

          {offer.requirements && (
            <div className="detail-section">
              <h3>Requirements</h3>
              <p>{offer.requirements}</p>
            </div>
          )}

          {offer.instructions && (
            <div className="detail-section">
              <h3>Instructions</h3>
              <p>{offer.instructions}</p>
            </div>
          )}

          <div className="offer-meta-grid">
            <div className="meta-item">
              <FiClock size={16} />
              <span>{offer.totalSlots - offer.completedSlots} / {offer.totalSlots} slots left</span>
            </div>
            <div className="meta-item">
              <FiExternalLink size={16} />
              <span>Device: {offer.device}</span>
            </div>
          </div>
        </div>

        <div className="offer-detail-actions">
          {completion ? (
            <div className="completion-status">
              <FiCheckCircle size={20} />
              <span>Status: {completion.status}</span>
              {completion.status === 'pending' && (
                <p className="text-muted">Your completion is being reviewed</p>
              )}
              {completion.status === 'approved' && (
                <p className="text-success">Reward credited! +{offer.reward} coins</p>
              )}
            </div>
          ) : trackingActive ? (
            <div className="tracking-active">
              <div className="tracking-indicator">
                <span className="tracking-dot"></span>
                <span>Tracking activity — {stepCount} steps detected</span>
              </div>
              <button className="btn btn-success btn-lg btn-full" onClick={handleComplete}>
                I Completed This Task
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg btn-full" onClick={handleStart}>
              Start Offer & Earn {offer.reward} Coins
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;
