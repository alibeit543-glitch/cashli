import { useLocation, Link } from 'react-router-dom';
import { FiMenu, FiLogOut, FiBell, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/offers': 'Offers',
  '/admin/withdrawals': 'Withdrawals',
  '/admin/announcements': 'Announcements',
  '/admin/settings': 'Settings',
  '/admin/transactions': 'Transactions',
  '/admin/completions': 'Completions',
  '/admin/analytics': 'Analytics',
  '/admin/activity': 'Activity Monitor',
  '/admin/live-feed': 'Live Feed',
  '/admin/protection-fund': 'Protection Fund',
  '/admin/fraud': 'Fraud Alerts',
  '/admin/referrals': 'Referral Monitor',
};

const AdminTopbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  let currentPath = '';
  for (const part of pathParts) {
    currentPath += `/${part}`;
    const label = breadcrumbMap[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
    breadcrumbs.push({ path: currentPath, label });
  }

  return (
    <header className="admin-topbar">
      <button className="admin-topbar-toggle" onClick={onMenuToggle}>
        <FiMenu size={20} />
      </button>
      <div className="admin-topbar-breadcrumbs">
        <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Admin</Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path}>
            <span style={{ color: 'var(--text-dark)', margin: '0 4px' }}>/</span>
            {i === breadcrumbs.length - 1 ? (
              <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.85rem' }}>{crumb.label}</span>
            ) : (
              <Link to={crumb.path} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{crumb.label}</Link>
            )}
          </span>
        ))}
      </div>
      <div className="admin-topbar-right">
        <button className="btn-icon" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>
        <button className="btn-icon" title="Notifications">
          <FiBell size={16} />
        </button>
        <div className="admin-topbar-user">
          <div className="avatar-small">{user?.username?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-balance">admin</span>
          </div>
        </div>
        <button className="btn-icon" onClick={handleLogout} title="Logout">
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
