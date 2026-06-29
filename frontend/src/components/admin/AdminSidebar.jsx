import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiGrid, FiUsers, FiGift, FiDollarSign, FiShield, FiBell, FiSettings, FiLogOut, FiX, FiActivity } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

const menuItems = [
  { path: '/admin', icon: FiGrid, label: 'Dashboard' },
  { path: '/admin/users', icon: FiUsers, label: 'Users' },
  { path: '/admin/offers', icon: FiGift, label: 'Offers' },
  { path: '/admin/withdrawals', icon: FiDollarSign, label: 'Withdrawals', badgeKey: 'pendingCount' },
  { path: '/admin/security', icon: FiShield, label: 'Security', badgeKey: 'suspiciousCount' },
  { path: '/admin/announcements', icon: FiBell, label: 'Announcements' },
  { path: '/admin/activity', icon: FiActivity, label: 'Activity' },
  { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState({ pendingCount: 0, suspiciousCount: 0 });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await adminAPI.getWithdrawals({ limit: 1, status: 'pending' });
        const susRes = await adminAPI.getWithdrawals({ limit: 1, status: 'suspicious' });
        setBadges({
          pendingCount: res.data?.stats?.pending?.count || 0,
          suspiciousCount: susRes.data?.stats?.suspicious?.count || 0,
        });
      } catch {}
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">C</span>
            <span className="brand-text">Cashli</span>
          </div>
          <button className="sidebar-close" onClick={onClose}><FiX /></button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badgeKey && badges[item.badgeKey] > 0 && (
                <span className={`sidebar-badge ${item.badgeKey === 'suspiciousCount' ? 'danger' : ''}`}>
                  {badges[item.badgeKey]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link logout" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
