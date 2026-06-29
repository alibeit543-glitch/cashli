import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import Skeleton from '../../components/admin/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const emptyOffer = {
  title: '', description: '', shortDescription: '', category: 'survey', reward: '',
  xpReward: 10, difficulty: 'medium', maxCompletionsPerUser: 1, timeToComplete: 5,
  requirements: '', instructions: '', url: '', status: 'draft', totalSlots: 1000,
  device: 'all', isFeatured: false, minAccountAge: 0, trustLevelRequired: 'all',
  countries: [],
};

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyOffer);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getOffers({ page, status: statusFilter || undefined, search, limit: 20 });
        setOffers(res.data.offers);
        setPagination(res.data.pagination);
        setTotalCompletions(res.data.totalCompletions || 0);
        setTotalRevenue(res.data.totalRevenue || 0);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, [page, statusFilter, search]);

  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const openCreate = () => { setForm(emptyOffer); setEditingId(null); setShowForm(true); };
  const openEdit = (offer) => { setForm({ ...offer }); setEditingId(offer._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAPI.updateOffer(editingId, form);
        toast.success('Offer updated');
      } else {
        await adminAPI.createOffer(form);
        toast.success('Offer created');
      }
      setShowForm(false);
      const res = await adminAPI.getOffers({ page, status: statusFilter || undefined, limit: 20 });
      setOffers(res.data.offers);
    } catch (err) { toast.error('Failed to save'); }
  };

  const toggleStatus = async (offer) => {
    try {
      const newStatus = offer.status === 'active' ? 'paused' : 'active';
      await adminAPI.updateOffer(offer._id, { status: newStatus });
      setOffers(offers.map(o => o._id === offer._id ? { ...o, status: newStatus } : o));
      toast.success(`Offer ${newStatus}`);
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try { await adminAPI.deleteOffer(id); setOffers(offers.filter(o => o._id !== id)); toast.success('Deleted'); } catch (err) { toast.error('Failed'); }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1>Manage Offers</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create and manage offers, surveys, and tasks</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus size={16} /> New Offer</button>
      </div>

      <div className="admin-toolbar">
        <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
          <FiSearch size={16} />
          <input type="text" placeholder="Search offers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><FiPlus size={24} style={{ color: '#6366f1' }} /></div>
          <div className="stat-info"><span className="stat-label">Total Offers</span><span className="stat-value">{pagination?.total || 0}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)' }}><FiPlus size={24} style={{ color: '#22c55e' }} /></div>
          <div className="stat-info"><span className="stat-label">Completions</span><span className="stat-value">{totalCompletions.toLocaleString()}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><FiPlus size={24} style={{ color: '#f59e0b' }} /></div>
          <div className="stat-info"><span className="stat-label">Revenue</span><span className="stat-value">${totalRevenue.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="card">
        {loading ? <Skeleton type="table" count={6} /> : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Reward</th>
                  <th>Completions</th>
                  <th>Avg Time</th>
                  <th>Difficulty</th>
                  <th>Trust</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</td>
                    <td><span className="category-tag">{o.category}</span></td>
                    <td style={{ fontWeight: 600, color: '#22c55e' }}>${o.reward}</td>
                    <td>{o.completedSlots || 0}/{o.totalSlots || '∞'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{o.timeToComplete || '-'}m</td>
                    <td><span style={{ color: o.difficulty === 'easy' ? '#22c55e' : o.difficulty === 'medium' ? '#f59e0b' : '#ef4444', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.8rem' }}>{o.difficulty}</span></td>
                    <td><span style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 4, color: 'var(--primary)' }}>{o.trustLevelRequired || 'all'}</span></td>
                    <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" onClick={() => openEdit(o)}><FiEdit2 size={14} /></button>
                        <button className={`btn btn-sm ${o.status === 'active' ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleStatus(o)}>
                          {o.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => setShowDeleteConfirm(o)}><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {offers.length === 0 && <div className="empty-state"><h3>No offers yet</h3><button className="btn btn-primary" onClick={openCreate}>Create First Offer</button></div>}
          </div>
        )}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: Math.min(pagination.pages, 20) }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit Offer' : 'Create Offer'} width="large">
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group"><label>Short Description</label><input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} maxLength={200} /></div>
          <div className="form-group"><label>Full Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="survey">Survey</option><option value="task">Task</option><option value="app-download">App Download</option><option value="signup">Sign Up</option><option value="purchase">Purchase</option><option value="video">Video</option><option value="offer">Offer</option></select></div>
            <div className="form-group"><label>Reward ($)</label><input type="number" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} min="1" required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>XP Reward</label><input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })} min="0" /></div>
            <div className="form-group"><label>Difficulty</label><select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Max Completions/User</label><select value={form.maxCompletionsPerUser} onChange={(e) => setForm({ ...form, maxCompletionsPerUser: parseInt(e.target.value) })}><option value="1">1</option><option value="3">3</option><option value="999">Unlimited</option></select></div>
            <div className="form-group"><label>Time to Complete (min)</label><input type="number" value={form.timeToComplete} onChange={(e) => setForm({ ...form, timeToComplete: parseInt(e.target.value) || 5 })} min="1" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Device</label><select value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })}><option value="all">All</option><option value="ios">iOS</option><option value="android">Android</option></select></div>
            <div className="form-group"><label>Trust Level Required</label><select value={form.trustLevelRequired} onChange={(e) => setForm({ ...form, trustLevelRequired: e.target.value })}><option value="all">All</option><option value="regular">Regular+</option><option value="trusted">Trusted Only</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Min Account Age (days)</label><input type="number" value={form.minAccountAge} onChange={(e) => setForm({ ...form, minAccountAge: parseInt(e.target.value) || 0 })} min="0" /></div>
            <div className="form-group"><label>Total Slots</label><input type="number" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: parseInt(e.target.value) || 1000 })} min="1" /></div>
          </div>
          <div className="form-group"><label>External URL</label><input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
          <div className="form-group"><label>Requirements</label><textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={2} /></div>
          <div className="form-group"><label>Instructions</label><textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2} /></div>
          <div className="form-row">
            <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="draft">Draft</option><option value="paused">Paused</option><option value="inactive">Inactive</option></select></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
              <label className="checkbox-label"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured Offer</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update Offer' : 'Create Offer'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} onConfirm={() => handleDelete(showDeleteConfirm._id)} title="Delete Offer" message={`Delete "${showDeleteConfirm?.title}"? This cannot be undone.`} confirmText="Delete" confirmVariant="danger" />
    </div>
  );
};

export default ManageOffers;
