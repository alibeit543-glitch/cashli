import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/admin/Skeleton';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiShield, FiAlertTriangle, FiGlobe, FiUsers, FiClock, FiCheckCircle, FiXCircle, FiSearch } from 'react-icons/fi';

const TABS = ['Overview', 'Fraud Flags', 'Flagged Users', 'IP Management', 'Audit Trail'];

const AdminSecurity = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [overview, setOverview] = useState(null);
  const [fraudFlags, setFraudFlags] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [ipData, setIpData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockIpModal, setBlockIpModal] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditPagination, setAuditPagination] = useState(null);
  const [flagFilter, setFlagFilter] = useState('false');

  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      try {
        if (activeTab === 'Overview') {
          const res = await adminAPI.getSecurityOverview();
          setOverview(res.data);
        } else if (activeTab === 'Fraud Flags') {
          const res = await adminAPI.getFraudFlags({ resolved: flagFilter || undefined, limit: 50 });
          setFraudFlags(res.data.flags || []);
        } else if (activeTab === 'Flagged Users') {
          const res = await adminAPI.getFlaggedUsers();
          setFlaggedUsers(res.data.users || []);
        } else if (activeTab === 'IP Management') {
          const res = await adminAPI.getIpManagement();
          setIpData(res.data);
        } else if (activeTab === 'Audit Trail') {
          const res = await adminAPI.getAuditLog({ page: auditPage, limit: 20 });
          setAuditLogs(res.data.logs || []);
          setAuditPagination(res.data.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [activeTab, flagFilter, auditPage]);

  const handleResolveFlag = async (id) => {
    try {
      await adminAPI.resolveFraudFlag(id);
      toast.success('Flag resolved');
      setFraudFlags(fraudFlags.filter(f => f._id !== id));
    } catch (err) {
      toast.error('Failed to resolve');
    }
  };

  const handleBlockIp = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.blockIp({ ipAddress: newIp, reason: newReason });
      toast.success('IP blocked');
      setBlockIpModal(false);
      setNewIp('');
      setNewReason('');
      const res = await adminAPI.getIpManagement();
      setIpData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block IP');
    }
  };

  const handleUnblockIp = async (ip) => {
    try {
      await adminAPI.unblockIp(ip);
      toast.success('IP unblocked');
      const res = await adminAPI.getIpManagement();
      setIpData(res.data);
    } catch (err) {
      toast.error('Failed to unblock');
    }
  };

  return (
    <div className="admin-page">
      <h1>Security Center</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Fraud detection, IP management, and audit trail</p>

      <div className="fraud-tabs" style={{ marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab} className={`fraud-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'Fraud Flags' && <FiAlertTriangle size={14} />}
            {tab === 'Flagged Users' && <FiUsers size={14} />}
            {tab === 'IP Management' && <FiGlobe size={14} />}
            {tab === 'Audit Trail' && <FiClock size={14} />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          {loading ? <Skeleton type="card" count={4} /> : (
            <div className="fraud-stats-row">
              <div className="fraud-stat critical">
                <FiAlertTriangle size={24} />
                <div><strong>{overview?.totalFraudAttempts || 0}</strong><span>Total Fraud Attempts</span></div>
              </div>
              <div className="fraud-stat warn">
                <FiAlertTriangle size={24} />
                <div><strong>{overview?.unresolvedFlags || 0}</strong><span>Unresolved Flags</span></div>
              </div>
              <div className="fraud-stat">
                <FiUsers size={24} />
                <div><strong>{overview?.suspiciousAccounts || 0}</strong><span>Suspicious Accounts</span></div>
              </div>
              <div className="fraud-stat info">
                <FiGlobe size={24} />
                <div><strong>{overview?.blockedIps || 0}</strong><span>Blocked IPs</span></div>
              </div>
            </div>
          )}
          <div className="card">
            <div className="card-header"><h3>Security Summary</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Critical Flags</span>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{overview?.criticalFlags || 0}</p>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reviewed This Month</span>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{overview?.reviewedThisMonth || 0}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Fraud Flags' && (
        <div className="card">
          <div className="card-header">
            <h3>Fraud Flags</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="filter-select" value={flagFilter} onChange={(e) => setFlagFilter(e.target.value)}>
                <option value="false">Unresolved</option>
                <option value="true">Resolved</option>
                <option value="">All</option>
              </select>
            </div>
          </div>
          {loading ? <Skeleton type="table" count={5} /> : (
            <div className="fraud-alerts-list">
              {fraudFlags.map(flag => (
                <div key={flag._id} className={`fraud-alert-card severity-${flag.severity} ${flag.resolved ? 'status-dismissed' : ''}`}>
                  <div className="alert-icon"><FiAlertTriangle style={{ color: flag.severity === 'critical' ? '#ef4444' : flag.severity === 'high' ? '#f59e0b' : '#6366f1' }} /></div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <strong>{flag.user?.username || 'Unknown'}</strong>
                      <span className="alert-severity" style={{ color: flag.severity === 'critical' ? '#ef4444' : flag.severity === 'high' ? '#f59e0b' : '#6366f1' }}>{flag.severity}</span>
                      <span className="alert-type">{flag.flagType}</span>
                    </div>
                    <p className="alert-desc">{flag.detail}</p>
                    {flag.recommendation && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>→ {flag.recommendation}</p>}
                    <div className="alert-meta">
                      <span>{flag.withdrawal?.amount ? `$${flag.withdrawal.amount}` : ''}</span>
                      <span className="alert-time">{new Date(flag.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="alert-actions">
                    {!flag.resolved && (
                      <button className="btn btn-sm btn-success" onClick={() => handleResolveFlag(flag._id)}><FiCheckCircle size={14} /> Resolve</button>
                    )}
                  </div>
                </div>
              ))}
              {fraudFlags.length === 0 && <div className="empty-state"><h3>No flags</h3><p>All clear</p></div>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Flagged Users' && (
        <div className="card">
          <div className="card-header"><h3>Suspicious Accounts ({flaggedUsers.length})</h3></div>
          {loading ? <Skeleton type="table" count={5} /> : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Trust Level</th>
                    <th>Flags</th>
                    <th>Max Severity</th>
                    <th>Earned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedUsers.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 500 }}>{u.username}</td>
                      <td>{u.email}</td>
                      <td><span className={`status-badge ${u.trustLevel}`}>{u.trustLevel}</span></td>
                      <td><span style={{ color: '#ef4444', fontWeight: 700 }}>{u.flagCount || 0}</span></td>
                      <td><span style={{ color: u.maxSeverity === 'critical' ? '#ef4444' : '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>{u.maxSeverity || '-'}</span></td>
                      <td>${u.totalEarned?.toLocaleString() || 0}</td>
                      <td>
                        <Link to={`/admin/users/${u._id}`} className="btn btn-sm">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {flaggedUsers.length === 0 && <div className="empty-state"><h3>No flagged users</h3></div>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'IP Management' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <h3>Blocked IPs ({ipData?.blocklist?.length || 0})</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setBlockIpModal(true)}>+ Block IP</button>
            </div>
            {ipData?.blocklist?.length > 0 ? (
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>IP Address</th>
                      <th>Reason</th>
                      <th>Blocked By</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipData.blocklist.map(b => (
                      <tr key={b._id}>
                        <td style={{ fontFamily: 'monospace' }}>{b.ipAddress}</td>
                        <td>{b.reason}</td>
                        <td>{b.blockedBy?.username || 'System'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td><button className="btn btn-sm btn-success" onClick={() => handleUnblockIp(b.ipAddress)}>Unblock</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty-state"><h3>No blocked IPs</h3></div>}
          </div>

          <div className="card">
            <div className="card-header"><h3>IPs with Multiple Accounts</h3></div>
            {ipData?.ipGroups?.length > 0 ? (
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>IP Address</th>
                      <th>Account Count</th>
                      <th>Accounts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipData.ipGroups.map(g => (
                      <tr key={g._id}>
                        <td style={{ fontFamily: 'monospace' }}>{g._id}</td>
                        <td><span style={{ color: g.count > 3 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{g.count}</span></td>
                        <td style={{ fontSize: '0.8rem' }}>{g.users.map(u => u.username).join(', ')}</td>
                        <td>
                          <button className="btn btn-sm btn-warning" onClick={() => { setNewIp(g._id); setNewReason('Multiple accounts from same IP'); setBlockIpModal(true); }}>Block</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty-state"><h3>No IP groups found</h3></div>}
          </div>
        </div>
      )}

      {activeTab === 'Audit Trail' && (
        <div className="card">
          <div className="card-header"><h3>Audit Trail</h3></div>
          {loading ? <Skeleton type="table" count={5} /> : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                    <th>IP</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log._id}>
                      <td style={{ fontWeight: 500 }}>{log.admin?.username || 'System'}</td>
                      <td><span className="action-type-badge">{log.action}</span></td>
                      <td>{log.resource}</td>
                      <td style={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.ip || '-'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && <div className="empty-state"><h3>No logs</h3></div>}
            </div>
          )}
          {auditPagination && auditPagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: auditPagination.pages }, (_, i) => (
                <button key={i} className={`btn btn-sm ${auditPage === i + 1 ? 'btn-primary' : ''}`} onClick={() => setAuditPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={blockIpModal} onClose={() => setBlockIpModal(false)} title="Block IP Address">
        <form onSubmit={handleBlockIp}>
          <div className="form-group">
            <label>IP Address</label>
            <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="e.g. 192.168.1.100" required />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea value={newReason} onChange={(e) => setNewReason(e.target.value)} rows={2} placeholder="Why is this IP being blocked?" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Block IP</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSecurity;
