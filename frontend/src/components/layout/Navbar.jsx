import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiGrid, FiDollarSign, FiUsers, FiAward, FiUser, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/offers', label: 'Offers', icon: FiGrid },
    { to: '/wallet', label: 'Wallet', icon: FiDollarSign },
    { to: '/referrals', label: 'Referrals', icon: FiUsers },
    { to: '/levels', label: 'Levels', icon: FiAward },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: FiShield }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">C</span>
          <span className="brand-text">Cashli</span>
        </Link>

        <div className="navbar-links-desktop">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <Link to="/profile" className="user-badge">
            <div className="avatar-small">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-balance">{(user?.balance || 0).toFixed(0)} coins</span>
            </div>
          </Link>
          <button className="btn-icon logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut size={18} />
          </button>
          <button className="btn-icon mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link-mobile ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </Link>
          ))}
          <button className="nav-link-mobile logout-btn-mobile" onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
