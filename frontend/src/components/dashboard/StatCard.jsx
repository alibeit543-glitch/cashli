const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>
      <Icon size={24} />
    </div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  </div>
);

export default StatCard;
