import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const categories = ['survey', 'offer', 'video', 'app-download', 'signup', 'purchase'];

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '', category: 'survey',
    reward: '', xpReward: '10', requirements: '', instructions: '',
    url: '', totalSlots: '1000', device: 'all', isFeatured: false,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminAPI.getOffers({ page, limit: 20 });
        setOffers(res.data.offers);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [page]);

  const openCreate = () => {
    setEditOffer(null);
    setForm({ title: '', description: '', shortDescription: '', category: 'survey', reward: '', xpReward: '10', requirements: '', instructions: '', url: '', totalSlots: '1000', device: 'all', isFeatured: false });
    setShowForm(true);
  };

  const openEdit = (offer) => {
    setEditOffer(offer);
    setForm({ title: offer.title, description: offer.description, shortDescription: offer.shortDescription || '', category: offer.category, reward: offer.reward.toString(), xpReward: offer.xpReward.toString(), requirements: offer.requirements || '', instructions: offer.instructions || '', url: offer.url || '', totalSlots: offer.totalSlots.toString(), device: offer.device, isFeatured: offer.isFeatured });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, reward: parseFloat(form.reward), xpReward: parseInt(form.xpReward), totalSlots: parseInt(form.totalSlots) };
      if (editOffer) {
        await adminAPI.updateOffer(editOffer._id, data);
        toast.success('Offer updated');
      } else {
        await adminAPI.createOffer(data);
        toast.success('Offer created');
      }
      setShowForm(false);
      const res = await adminAPI.getOffers({ page, limit: 20 });
      setOffers(res.data.offers);
    } catch (err) {
      toast.error('Failed to save offer');
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>Manage Offers</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Offer</button>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/analytics">Analytics</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/offers" className="active">Offers</Link>
          <Link to="/admin/withdrawals">Withdrawals</Link>
          <Link to="/admin/transactions">Transactions</Link>
          <Link to="/admin/completions">Completions</Link>
                  <Link to="/admin/referrals">Referrals</Link>
        <Link to="/admin/activity">Activity</Link>
          <Link to="/admin/live-feed">Live Feed</Link>
          <Link to="/admin/protection-fund">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
        </nav>
      </div>

      <div className="card">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Slots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o._id}>
                  <td>{o.title}</td>
                  <td><span className="category-tag">{o.category}</span></td>
                  <td>{o.reward} coins</td>
                  <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                  <td>{o.completedSlots}/{o.totalSlots}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openEdit(o)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editOffer ? 'Edit Offer' : 'Create Offer'}>
        <form onSubmit={handleSubmit} className="offer-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Reward (coins)</label>
              <input type="number" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>XP Reward</label>
              <input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Total Slots</label>
              <input type="number" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Device</label>
              <select value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })}>
                <option value="all">All</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
              </select>
            </div>
            <div className="form-group">
              <label>URL</label>
              <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Requirements</label>
            <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured Offer
          </label>
          <button type="submit" className="btn btn-primary btn-full">
            {editOffer ? 'Update Offer' : 'Create Offer'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageOffers;
