import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cashli_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cashli_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const offersAPI = {
  getAll: (params) => api.get('/offers', { params }),
  getById: (id) => api.get(`/offers/${id}`),
  startOffer: (id) => api.post(`/offers/${id}/start`),
  submitProof: (completionId, data) => api.put(`/offers/${completionId}/proof`, data),
  getCompletions: () => api.get('/offers/completions'),
};

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
};

export const withdrawalsAPI = {
  getMethods: () => api.get('/withdrawals/methods'),
  getAll: () => api.get('/withdrawals'),
  request: (data) => api.post('/withdrawals', data),
};

export const referralsAPI = {
  getStats: () => api.get('/referrals'),
  getLeaderboard: (params) => api.get('/referrals/leaderboard', { params }),
};

export const levelsAPI = {
  getProgress: () => api.get('/levels/progress'),
  getLeaderboard: () => api.get('/levels/leaderboard'),
  getAchievements: () => api.get('/levels/achievements'),
};

export const bonusesAPI = {
  check: () => api.get('/bonuses/check'),
  claimDaily: () => api.post('/bonuses/daily'),
  getHistory: () => api.get('/bonuses/history'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPlatformStats: () => api.get('/admin/platform-stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  adjustBalance: (id, data) => api.post(`/admin/users/${id}/adjust-balance`, data),
  adjustXP: (id, data) => api.put(`/admin/users/${id}/adjust-xp`, data),
  getOffers: (params) => api.get('/admin/offers', { params }),
  createOffer: (data) => api.post('/admin/offers', data),
  updateOffer: (id, data) => api.put(`/admin/offers/${id}`, data),
  getWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  processWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}/process`, data),
  getCompletions: (params) => api.get('/admin/completions', { params }),
  processCompletion: (id, data) => api.put(`/admin/completions/${id}/process`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getLiveFeed: () => api.get('/admin/live-feed'),
  getProtectionFund: () => api.get('/admin/protection-fund'),
  getFraudAlerts: (params) => api.get('/admin/fraud-alerts', { params }),
  updateFraudAlert: (id, data) => api.put(`/admin/fraud-alerts/${id}`, data),
  getFlaggedUsers: () => api.get('/admin/flagged-users'),
  getUserActivityDetail: (userId) => api.get(`/admin/analytics/user/${userId}`),
  getReferralMonitor: (params) => api.get('/admin/referral-monitor', { params }),
};

export const supportAPI = {
  chat: (message) => api.post('/support/chat', { message }),
};

export const analyticsAPI = {
  startSession: (userId) => api.post('/analytics/session/start', { userId }),
  endSession: (userId) => api.post('/analytics/session/end', { userId }),
  trackPageview: (userId, page) => api.post('/analytics/pageview', { userId, page }),
  trackTaskStep: (userId, taskId, step, action) => api.post('/analytics/task/step', { userId, taskId, step, action }),
  trackTaskComplete: (userId, taskId, taskName, timeSpent, stepsCount) => api.post('/analytics/task/complete', { userId, taskId, taskName, timeSpent, stepsCount }),
};

export default api;
