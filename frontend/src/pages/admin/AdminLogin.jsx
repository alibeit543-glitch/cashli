import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const { adminLogin, user } = useAuth();
  const navigate = useNavigate();

  if (user && ['admin', 'super_admin', 'moderator'].includes(user.role)) return <Navigate to="/admin" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(form.email, form.password, remember);
      toast.success('Welcome back, admin!');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials and make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="brand-icon">C</span>
          <span className="brand-text">Cashli Admin</span>
        </div>
        <h2>Admin Sign In</h2>
        <p className="auth-subtitle">Enter your credentials to access the admin panel</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@cashli.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
