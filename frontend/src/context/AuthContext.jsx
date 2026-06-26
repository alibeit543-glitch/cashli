import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import Tracker from '../services/analyticsTracker';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cashli_token');
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          Tracker.init(res.data.user._id, res.data.user.username);
          Tracker.startSession();
          Tracker.onPageEnter(window.location.pathname);
        })
        .catch(() => localStorage.removeItem('cashli_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('cashli_token', res.data.token);
    setUser(res.data.user);
    Tracker.init(res.data.user._id, res.data.user.username);
    Tracker.startSession();
    Tracker.onPageEnter(window.location.pathname);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('cashli_token', res.data.token);
    setUser(res.data.user);
    Tracker.init(res.data.user._id, res.data.user.username);
    Tracker.startSession();
    return res.data;
  };

  const logout = () => {
    Tracker.endSession();
    localStorage.removeItem('cashli_token');
    setUser(null);
  };

  const updateUser = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
