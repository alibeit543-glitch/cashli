import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import OfferDetail from './pages/OfferDetail';
import Wallet from './pages/Wallet';
import Withdraw from './pages/Withdraw';
import Referrals from './pages/Referrals';
import Profile from './pages/Profile';
import Levels from './pages/Levels';
import Achievements from './pages/Achievements';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SupportChat from './pages/SupportChat';
import AdminLogin from './pages/admin/AdminLogin';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageOffers = lazy(() => import('./pages/admin/ManageOffers'));
const ManageWithdrawals = lazy(() => import('./pages/admin/ManageWithdrawals'));
const WithdrawalDetail = lazy(() => import('./pages/admin/WithdrawalDetail'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminCompletions = lazy(() => import('./pages/admin/AdminCompletions'));
const UserDetail = lazy(() => import('./pages/admin/UserDetail'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminActivityMonitor = lazy(() => import('./pages/admin/AdminActivityMonitor'));
const AdminLiveFeed = lazy(() => import('./pages/admin/AdminLiveFeed'));
const AdminProtectionFund = lazy(() => import('./pages/admin/AdminProtectionFund'));
const AdminFraudAlerts = lazy(() => import('./pages/admin/AdminFraudAlerts'));
const AdminReferralMonitor = lazy(() => import('./pages/admin/AdminReferralMonitor'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity'));

const AdminFallback = () => <div className="page-container"><Loading fullScreen /></div>;

const AdminProtectedPage = ({ Component }) => (
  <AdminRoute>
    <AdminLayout>
      <Suspense fallback={<AdminFallback />}>
        <Component />
      </Suspense>
    </AdminLayout>
  </AdminRoute>
);

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading fullScreen />;

  return (
    <ErrorBoundary>
      <div className="app">
        {user && !['admin', 'super_admin', 'moderator'].includes(user.role) && <Navbar />}
        {user && !['admin', 'super_admin', 'moderator'].includes(user.role) && <SupportChat />}
        <main className={user && !['admin', 'super_admin', 'moderator'].includes(user.role) ? 'main-content' : ''}>
          <Routes>
            <Route path="/" element={user ? (['admin', 'super_admin', 'moderator'].includes(user.role) ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
            <Route path="/offers/:id" element={<ProtectedRoute><OfferDetail /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/levels" element={<ProtectedRoute><Levels /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/admin/login" element={user && ['admin', 'super_admin', 'moderator'].includes(user.role) ? <Navigate to="/admin" /> : <AdminLogin />} />
            <Route path="/admin" element={<AdminProtectedPage Component={AdminDashboard} />} />
            <Route path="/admin/users" element={<AdminProtectedPage Component={ManageUsers} />} />
            <Route path="/admin/users/:id" element={<AdminProtectedPage Component={UserDetail} />} />
            <Route path="/admin/offers" element={<AdminProtectedPage Component={ManageOffers} />} />
            <Route path="/admin/withdrawals" element={<AdminProtectedPage Component={ManageWithdrawals} />} />
            <Route path="/admin/withdrawals/:id" element={<AdminProtectedPage Component={WithdrawalDetail} />} />
            <Route path="/admin/security" element={<AdminProtectedPage Component={AdminSecurity} />} />
            <Route path="/admin/announcements" element={<AdminProtectedPage Component={AdminAnnouncements} />} />
            <Route path="/admin/settings" element={<AdminProtectedPage Component={AdminSettings} />} />
            <Route path="/admin/transactions" element={<AdminProtectedPage Component={AdminTransactions} />} />
            <Route path="/admin/completions" element={<AdminProtectedPage Component={AdminCompletions} />} />
            <Route path="/admin/analytics" element={<AdminProtectedPage Component={AdminAnalytics} />} />
            <Route path="/admin/activity" element={<AdminProtectedPage Component={AdminActivityMonitor} />} />
            <Route path="/admin/live-feed" element={<AdminProtectedPage Component={AdminLiveFeed} />} />
            <Route path="/admin/protection-fund" element={<AdminProtectedPage Component={AdminProtectionFund} />} />
            <Route path="/admin/fraud" element={<AdminProtectedPage Component={AdminFraudAlerts} />} />
            <Route path="/admin/referrals" element={<AdminProtectedPage Component={AdminReferralMonitor} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {(!user || !['admin', 'super_admin', 'moderator'].includes(user.role)) && (
          <footer className="app-footer">
            <div className="footer-inner">
              <span className="footer-copyright">© 2026 Cashli. All rights reserved.</span>
              <div className="footer-links">
                <a href="mailto:support@cashli.app">Contact</a>
                <Link to="/privacy-policy">Privacy</Link>
                <Link to="/terms">Terms</Link>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
