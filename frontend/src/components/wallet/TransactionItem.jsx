import { FiArrowUpRight, FiArrowDownLeft, FiCheck, FiX, FiClock } from 'react-icons/fi';

const typeConfig = {
  earning: { icon: FiArrowDownLeft, color: '#22c55e', label: 'Earning' },
  withdrawal: { icon: FiArrowUpRight, color: '#ef4444', label: 'Withdrawal' },
  bonus: { icon: FiArrowDownLeft, color: '#6366f1', label: 'Bonus' },
  referral: { icon: FiArrowDownLeft, color: '#f59e0b', label: 'Referral' },
  purchase: { icon: FiArrowUpRight, color: '#ec4899', label: 'Purchase' },
};

const TransactionItem = ({ transaction }) => {
  const config = typeConfig[transaction.type] || typeConfig.earning;
  const Icon = config.icon;
  const isPositive = transaction.amount > 0;

  return (
    <div className="transaction-item">
      <div className="transaction-icon" style={{ background: config.color + '20', color: config.color }}>
        <Icon size={18} />
      </div>
      <div className="transaction-info">
        <span className="transaction-desc">{transaction.description}</span>
        <span className="transaction-date">
          {new Date(transaction.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="transaction-amount">
        <span style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
          {isPositive ? '+' : ''}{transaction.amount.toFixed(0)}
        </span>
        <span className="transaction-type">{config.label}</span>
      </div>
    </div>
  );
};

export default TransactionItem;
