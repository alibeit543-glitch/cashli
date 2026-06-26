import { useState, useEffect } from 'react';
import OfferCard from '../components/offers/OfferCard';
import { offersAPI } from '../services/api';
import { FiFilter, FiSearch } from 'react-icons/fi';

const categories = ['all', 'survey', 'offer', 'video', 'app-download', 'signup', 'purchase'];

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const res = await offersAPI.getAll({
          category: category === 'all' ? undefined : category,
          page: 1,
          limit: 50,
        });
        setOffers(res.data.offers);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [category]);

  const filtered = offers.filter(
    (o) => o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page offers-page">
      <div className="page-header">
        <h1>Earn Offers</h1>
        <p>Complete offers and earn coins instantly</p>
      </div>

      <div className="offers-toolbar">
        <div className="search-bar">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading offers...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No offers found</h3>
          <p>Check back later for new earning opportunities</p>
        </div>
      ) : (
        <div className="offers-grid">
          {filtered.map((offer) => (
            <OfferCard key={offer._id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
