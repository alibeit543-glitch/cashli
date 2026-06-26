import { useState, useEffect } from 'react';
import { withdrawalsAPI } from '../services/api';
import Modal from '../components/common/Modal';
import { FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const methodIcons = { paypal: '💸', crypto: '₿', giftcard: '🎁' };

const Withdraw = () => {
  const [methods, setMethods] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [methRes, wdRes] = await Promise.all([
          withdrawalsAPI.getMethods(),
          withdrawalsAPI.getAll(),
        ]);
        setMethods(methRes.data.methods);
        setWithdrawals(wdRes.data.withdrawals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await withdrawalsAPI.request({
        amount: parseFloat(amount),
        method: selectedMethod.id,
        accountDetails,
      });
      setWithdrawals([res.data.withdrawal, ...withdrawals]);
      toast.success('Withdrawal request submitted!');
      setAmount('');
      setAccountDetails({});
      setSelectedMethod(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAccountFields = () => {
    if (!selectedMethod) return null;
    switch (selectedMethod.id) {
      case 'paypal':
        return (
          <div className="form-group">
            <label>PayPal Email</label>
            <input
              type="email"
              placeholder="your@paypal.com"
              value={accountDetails.email || ''}
              onChange={(e) => setAccountDetails({ ...accountDetails, email: e.target.value })}
              required
            />
          </div>
        );
      case 'crypto':
        return (
          <>
            <div className="form-group">
              <label>Cryptocurrency</label>
              <select
                value={accountDetails.currency || ''}
                onChange={(e) => setAccountDetails({ ...accountDetails, currency: e.target.value })}
                required
              >
                <option value="">Select currency</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Wallet Address</label>
              <input
                type="text"
                placeholder="Your wallet address"
                value={accountDetails.address || ''}
                onChange={(e) => setAccountDetails({ ...accountDetails, address: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'giftcard':
        return (
          <>
            <div className="form-group">
              <label>Gift Card Type</label>
              <select
                value={accountDetails.brand || ''}
                onChange={(e) => setAccountDetails({ ...accountDetails, brand: e.target.value })}
                required
              >
                <option value="">Select brand</option>
                <option value="amazon">Amazon</option>
                <option value="google_play">Google Play</option>
                <option value="steam">Steam</option>
                <option value="itunes">iTunes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email for delivery</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={accountDetails.email || ''}
                onChange={(e) => setAccountDetails({ ...accountDetails, email: e.target.value })}
                required
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="page withdraw-page">
      <div className="page-header">
        <h1>Withdraw Funds</h1>
        <p>Cash out your earnings via your preferred method</p>
      </div>

      <div className="withdraw-grid">
        <div className="card">
          <h3>Select Withdrawal Method</h3>
          <div className="methods-list">
            {methods.map((method) => (
              <button
                key={method.id}
                className={`method-card ${selectedMethod?.id === method.id ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(method)}
              >
                <span className="method-icon">{methodIcons[method.id]}</span>
                <div className="method-info">
                  <span className="method-name">{method.name}</span>
                  <span className="method-desc">{method.description}</span>
                </div>
                <span className="method-min">Min: {method.minAmount} coins</span>
              </button>
            ))}
          </div>

          {selectedMethod && (
            <form onSubmit={handleSubmit} className="withdraw-form">
              <div className="form-group">
                <label>Amount (coins)</label>
                <input
                  type="number"
                  min={selectedMethod.minAmount}
                  placeholder={`Min ${selectedMethod.minAmount} coins`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <small>Minimum: {selectedMethod.minAmount} coins (5% fee applies)</small>
              </div>
              {renderAccountFields()}
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? 'Processing...' : `Withdraw ${amount || '0'} Coins`}
              </button>
            </form>
          )}
        </div>

        <div className="card">
          <h3>Withdrawal History</h3>
          <div className="withdrawals-list">
            {withdrawals.length === 0 ? (
              <p className="empty-state">No withdrawals yet</p>
            ) : (
              withdrawals.map((wd) => (
                <div key={wd._id} className="withdrawal-item">
                  <div className="wd-method">{methodIcons[wd.method]} {wd.method}</div>
                  <div className="wd-amount">{wd.amount} coins</div>
                  <span className={`status-badge ${wd.status}`}>{wd.status}</span>
                  <div className="wd-date">
                    {new Date(wd.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
