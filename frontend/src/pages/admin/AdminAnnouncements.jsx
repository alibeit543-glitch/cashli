import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import toast from 'react-hot-toast';
import { FiPlus, FiBell, FiInfo, FiAlertTriangle, FiCheckCircle, FiAlertOctagon } from 'react-icons/fi';

const typeConfig = {
  info: { icon: FiInfo, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  warning: { icon: FiAlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  success: { icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  urgent: { icon: FiAlertOctagon, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const emptyAnnouncement = {
  title: '', message: '', type: 'info', isActive: true,
  target: 'all', startDate: '', endDate: '',
};

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAnnouncement);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    adminAPI.getAnnouncements().then(res => {
      setAnnouncements(res.data.announcements);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(emptyAnnouncement); setEditingId(null); setShowForm(true); };
  const openEdit = (a) => {
    setForm({
      title: a.title, message: a.message, type: a.type, isActive: a.isActive,
      target: a.target || 'all',
      startDate: a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : '',
      endDate: a.endDate ? new Date(a.endDate).toISOString().split('T')[0] : '',
    });
    setEditingId(a._id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      if (editingId) {
        await adminAPI.updateAnnouncement(editingId, payload);
        toast.success('Updated');
      } else {
        await adminAPI.createAnnouncement(payload);
        toast.success('Created');
      }
      setShowForm(false);
      const res = await adminAPI.getAnnouncements();
      setAnnouncements(res.data.announcements);
    } catch (err) { toast.error('Failed'); }
  };

  const toggleActive = async (a) => {
    try {
      await adminAPI.updateAnnouncement(a._id, { isActive: !a.isActive });
      setAnnouncements(announcements.map(x => x._id === a._id ? { ...x, isActive: !x.isActive } : x));
      toast.success(!a.isActive ? 'Enabled' : 'Disabled');
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try { await adminAPI.deleteAnnouncement(id); setAnnouncements(announcements.filter(a => a._id !== id)); toast.success('Deleted'); } catch (err) { toast.error('Failed'); }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1>Announcements</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create site-wide banners and notifications</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus size={16} /> New Announcement</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map(a => {
              const config = typeConfig[a.type] || typeConfig.info;
              const Icon = config.icon;
              return (
                <div key={a._id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                  background: config.bg, borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${config.color}30`, opacity: a.isActive ? 1 : 0.5,
                }}>
                  <Icon size={24} style={{ color: config.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.95rem' }}>{a.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 4 }}>{a.target || 'all'}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.message}</p>
                    {a.startDate && <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: 4 }}>{new Date(a.startDate).toLocaleDateString()} - {a.endDate ? new Date(a.endDate).toLocaleDateString() : 'No end'}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <span className={`status-badge ${a.isActive ? 'active' : 'inactive'}`} style={{ fontSize: '0.7rem' }}>{a.isActive ? 'Active' : 'Disabled'}</span>
                    <button className={`btn btn-sm ${a.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleActive(a)} style={{ fontSize: '0.7rem' }}>{a.isActive ? 'Disable' : 'Enable'}</button>
                    <button className="btn btn-sm" onClick={() => openEdit(a)} style={{ fontSize: '0.7rem' }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setShowDeleteConfirm(a)} style={{ fontSize: '0.7rem' }}>Delete</button>
                  </div>
                </div>
              );
            })}
            {announcements.length === 0 && <div className="empty-state"><h3>No announcements</h3><p>Create your first announcement</p></div>}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit Announcement' : 'New Announcement'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Maintenance scheduled" /></div>
          <div className="form-group"><label>Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="urgent">Urgent</option>
            </select></div>
            <div className="form-group"><label>Target Audience</label><select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
              <option value="all">All Users</option><option value="new">New Users</option><option value="trusted">Trusted Users</option>
            </select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} onConfirm={() => handleDelete(showDeleteConfirm._id)} title="Delete Announcement" message={`Delete "${showDeleteConfirm?.title}"?`} confirmText="Delete" confirmVariant="danger" />
    </div>
  );
};

export default AdminAnnouncements;
