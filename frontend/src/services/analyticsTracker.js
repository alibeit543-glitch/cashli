import { analyticsAPI } from './api';

let userId = null;
let username = null;
let sessionStarted = false;

const Tracker = {
  init: (uid, uname) => {
    userId = uid;
    username = uname;
    sessionStarted = false;
  },

  startSession: async () => {
    if (!userId || sessionStarted) return;
    sessionStarted = true;
    try {
      await analyticsAPI.startSession(userId);
      Tracker.trackEvent('session_start');
    } catch (e) {}
  },

  endSession: async () => {
    if (!userId || !sessionStarted) return;
    sessionStarted = false;
    try {
      await analyticsAPI.endSession(userId);
    } catch (e) {}
  },

  trackEvent: async (type, data = {}) => {
    if (!userId) return;
    try {
      if (type === 'pageview') {
        await analyticsAPI.trackPageview(userId, window.location.pathname);
      } else if (type === 'task_start' || type === 'task_step') {
        await analyticsAPI.trackTaskStep(userId, data.taskId, data.step || 0, type);
      } else if (type === 'task_complete') {
        const res = await analyticsAPI.trackTaskComplete(userId, data.taskId, data.taskName, data.timeSpent, data.stepsCount);
        if (res.data?.fraudCheck?.riskLevel === 'critical' || res.data?.fraudCheck?.riskLevel === 'suspicious') {
          console.warn('[Fraud Warning]', res.data.fraudCheck);
        }
      }
    } catch (e) {}
  },

  onPageEnter: (pageName) => {
    Tracker.trackEvent('pageview', { page: pageName });
  },
};

// Auto-track page views
let lastPage = '';
const origPushState = window.history.pushState;
window.history.pushState = function () {
  origPushState.apply(this, arguments);
  setTimeout(() => {
    const path = window.location.pathname;
    if (path !== lastPage && userId) {
      lastPage = path;
      analyticsAPI.trackPageview(userId, path).catch(() => {});
    }
  }, 500);
};

window.addEventListener('popstate', () => {
  setTimeout(() => {
    const path = window.location.pathname;
    if (path !== lastPage && userId) {
      lastPage = path;
      analyticsAPI.trackPageview(userId, path).catch(() => {});
    }
  }, 500);
});

export default Tracker;