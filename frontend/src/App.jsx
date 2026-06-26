import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
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
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOffers from './pages/admin/ManageOffers';
import ManageWithdrawals from './pages/admin/ManageWithdrawals';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminCompletions from './pages/admin/AdminCompletions';
import UserDetail from './pages/admin/UserDetail';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminActivityMonitor from './pages/admin/AdminActivityMonitor';
import AdminLiveFeed from './pages/admin/AdminLiveFeed';
import AdminProtectionFund from './pages/admin/AdminProtectionFund';
import AdminFraudAlerts from './pages/admin/AdminFraudAlerts';
import AdminReferralMonitor from './pages/admin/AdminReferralMonitor';
import SupportChat from './pages/SupportChat';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading fullScreen />;

  return (
    <div className="app">
      {user && <Navbar />}
      {user && <SupportChat />}
      <main className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
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
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/offers" element={<AdminRoute><ManageOffers /></AdminRoute>} />
          <Route path="/admin/withdrawals" element={<AdminRoute><ManageWithdrawals /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
          <Route path="/admin/completions" element={<AdminRoute><AdminCompletions /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/activity" element={<AdminRoute><AdminActivityMonitor /></AdminRoute>} />
          <Route path="/admin/live-feed" element={<AdminRoute><AdminLiveFeed /></AdminRoute>} />
          <Route path="/admin/protection-fund" element={<AdminRoute><AdminProtectionFund /></AdminRoute>} />
          <Route path="/admin/fraud" element={<AdminRoute><AdminFraudAlerts /></AdminRoute>} />
          <Route path="/admin/referrals" element={<AdminRoute><AdminReferralMonitor /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
