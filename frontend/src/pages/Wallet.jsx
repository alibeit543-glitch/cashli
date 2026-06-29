import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TransactionItem from '../components/wallet/TransactionItem';
import { walletAPI } from '../services/api';
import { FiDollarSign, FiArrowUpRight, FiFilter } from 'react-icons/fi';

const Wallet = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [balRes, txnRes] = await Promise.all([
          walletAPI.getBalance(),
          walletAPI.getTransactions({ type: filter || undefined }),
        ]);
        setBalance(balRes.data);
        setTransactions(txnRes.data.transactions);
        setPagination(txnRes.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter]);

  return (
    <div className="page wallet-page">
      <div className="page-header">
        <h1>Wallet</h1>
        <p>Your earnings and transaction history</p>
      </div>

      {balance && balance.balance != null && (
        <div className="balance-card">
          <div className="balance-icon">
            <FiDollarSign size={32} />
          </div>
          <div className="balance-info">
            <span className="balance-label">Available Balance</span>
            <span className="balance-amount">{(balance.balance || 0).toFixed(0)} coins</span>
            <span className="balance-usd">≈ ${((balance.balance || 0) / 100).toFixed(2)} USD</span>
          </div>
          <Link to="/withdraw" className="btn btn-primary">
            <FiArrowUpRight size={18} /> Withdraw
          </Link>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Transaction History</h3>
          <div className="filter-group">
            <FiFilter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="earning">Earnings</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="bonus">Bonuses</option>
              <option value="referral">Referrals</option>
            </select>
          </div>
        </div>
        <div className="transactions-list">
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="empty-state">No transactions yet</p>
          ) : (
            transactions.map((txn) => <TransactionItem key={txn._id} transaction={txn} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
