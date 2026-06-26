import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiShield, FiCheckCircle, FiAlertCircle, FiClock, FiDollarSign } from 'react-icons/fi';

const AdminProtectionFund = () => {
  const [fund, setFund] = useState(null);

  useEffect(() => {
    adminAPI.getProtectionFund().then(r => setFund(r.data)).catch(console.error);
  }, []);

  if (!fund) return <div className="page admin-page"><div className="loading">Loading protection fund data...</div></div>;

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1><FiShield style={{ marginRight: 8 }} />User Protection Fund</h1>
        <p>Fair compensation pool for users affected by advertiser disputes</p>
      </div>

      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/analytics">Analytics</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/offers">Offers</Link>
        <Link to="/admin/withdrawals">Withdrawals</Link>
        <Link to="/admin/transactions">Transactions</Link>
        <Link to="/admin/completions">Completions</Link>
        <Link to="/admin/referrals">Referrals</Link>
        <Link to="/admin/activity">Activity</Link>
        <Link to="/admin/live-feed">Live Feed</Link>
        <Link to="/admin/protection-fund" className="active">Protection</Link>
        <Link to="/admin/fraud">Fraud AI</Link>
      </nav>

      <div className="fund-overview">
        <div className="fund-card card total">
          <FiShield size={32} />
          <div className="fund-value">${fund.totalFund.toLocaleString()}</div>
          <div className="fund-label">Total Fund</div>
        </div>
        <div className="fund-card card paid">
          <FiDollarSign size={32} />
          <div className="fund-value">${fund.paidOut.toLocaleString()}</div>
          <div className="fund-label">Paid to Users</div>
        </div>
        <div className="fund-card card resolved">
          <FiCheckCircle size={32} />
          <div className="fund-value">{fund.resolvedDisputes}/{fund.totalDisputes}</div>
          <div className="fund-label">Disputes Resolved</div>
        </div>
        <div className="fund-card card pending">
          <FiClock size={32} />
          <div className="fund-value">{fund.pendingDisputes}</div>
          <div className="fund-label">Pending Review</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Disputes</h3>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Task</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fund.recentDisputes.map((d, i) => (
                <tr key={i}>
                  <td><strong>{d.user}</strong></td>
                  <td>{d.task}</td>
                  <td>${d.amount}</td>
                  <td>
                    <span className={`badge badge-${d.status === 'paid' ? 'approved' : 'pending'}`}>
                      {d.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm" disabled={d.status === 'paid'}>
                      {d.status === 'paid' ? 'Resolved' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>How the Protection Fund Works</h3>
        </div>
        <div className="fund-explanation">
          <div className="fund-step">
            <div className="fund-step-num">1</div>
            <p>A small percentage (2%) of platform revenue is automatically allocated to the User Protection Fund.</p>
          </div>
          <div className="fund-step">
            <div className="fund-step-num">2</div>
            <p>When an advertiser rejects a completed task through no fault of the user, the user can file a dispute.</p>
          </div>
          <div className="fund-step">
            <div className="fund-step-num">3</div>
            <p>Admin reviews the dispute. If approved, the user is compensated from the fund — keeping their earnings safe.</p>
          </div>
          <div className="fund-step">
            <div className="fund-step-num">4</div>
            <p>Users never lose earnings due to advertiser disputes. This builds trust and reduces frustration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProtectionFund;