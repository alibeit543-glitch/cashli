import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('cashli_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('cashli_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const offersAPI = {
  getAll: (params) => api.get('/offers', { params }),
  getById: (id) => api.get(`/offers/${id}`),
  startOffer: (id) => api.post(`/offers/${id}/start`),
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
};

export const levelsAPI = {
  getProgress: () => api.get('/levels/progress'),
  getAchievements: () => api.get('/levels/achievements'),
};

export const bonusesAPI = {
  check: () => api.get('/bonuses/check'),
  claimDaily: () => api.post('/bonuses/daily'),
};

export default api;
