import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';
import Tracker from '../services/analyticsTracker';

const AuthContext = createContext(null);
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const getToken = () => localStorage.getItem('cashli_token') || sessionStorage.getItem('cashli_token');
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch { return true; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout();
      window.location.href = '/admin/login';
    }, INACTIVITY_TIMEOUT);
  }, []);

  const logout = useCallback(() => {
    Tracker.endSession();
    localStorage.removeItem('cashli_token');
    sessionStorage.removeItem('cashli_token');
    setUser(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('cashli_token');
      sessionStorage.removeItem('cashli_token');
      setLoading(false);
      return;
    }
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          if (!['admin', 'super_admin', 'moderator'].includes(res.data.user.role)) {
            Tracker.init(res.data.user._id, res.data.user.username);
            Tracker.startSession();
            Tracker.onPageEnter(window.location.pathname);
          }
          resetInactivityTimer();
        })
        .catch(() => {
          localStorage.removeItem('cashli_token');
          sessionStorage.removeItem('cashli_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [resetInactivityTimer]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, [user, resetInactivityTimer]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('cashli_token', res.data.token);
    setUser(res.data.user);
    if (!['admin', 'super_admin', 'moderator'].includes(res.data.user.role)) {
      Tracker.init(res.data.user._id, res.data.user.username);
      Tracker.startSession();
      Tracker.onPageEnter(window.location.pathname);
    }
    resetInactivityTimer();
    return res.data;
  };

  const adminLogin = async (email, password, remember = false) => {
    const module = await import('axios');
    const API_URL = process.env.REACT_APP_API_URL || '/api';
    const res = await module.default.post(`${API_URL}/admin/login`, { email, password });
    if (remember) {
      localStorage.setItem('cashli_token', res.data.token);
    } else {
      sessionStorage.setItem('cashli_token', res.data.token);
    }
    setUser(res.data.user);
    resetInactivityTimer();
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

  const updateUser = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
