import { Link } from 'react-router-dom';
import { FiClock, FiSmartphone, FiAward } from 'react-icons/fi';

const categoryIcons = {
  survey: '📋',
  offer: '🎯',
  video: '🎬',
  'app-download': '📱',
  signup: '✍️',
  purchase: '🛒',
};

const OfferCard = ({ offer }) => (
  <Link to={`/offers/${offer._id}`} className="offer-card">
    <div className="offer-card-header">
      <span className="offer-category-badge">
        {categoryIcons[offer.category] || '📌'} {offer.category}
      </span>
      {offer.isFeatured && <span className="offer-featured-badge">Featured</span>}
    </div>
    <h3 className="offer-title">{offer.title}</h3>
    <p className="offer-description">{offer.shortDescription || offer.description?.slice(0, 80)}</p>
    <div className="offer-card-footer">
      <div className="offer-reward">
        <FiAward size={16} />
        <span className="reward-amount">+{offer.reward} coins</span>
      </div>
      <div className="offer-meta">
        <span><FiSmartphone size={14} /> {offer.device}</span>
        <span><FiClock size={14} /> {offer.totalSlots - offer.completedSlots} left</span>
      </div>
    </div>
  </Link>
);

export default OfferCard;
