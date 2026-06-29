const Skeleton = ({ type = 'text', width, height, count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || (type === 'text' ? 16 : type === 'card' ? 120 : type === 'avatar' ? 40 : 16),
        marginBottom: type === 'text' ? 8 : 12,
        borderRadius: type === 'avatar' ? '50%' : 8,
      }}
    />
  ));

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-row" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {Array.from({ length: count || 5 }, (_, i) => (
            <div key={i} className="skeleton" style={{ flex: 1, height: 32, borderRadius: 8 }} />
          ))}
        </div>
        {Array.from({ length: 5 }, (_, rowIdx) => (
          <div key={rowIdx} className="skeleton-row" style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            {Array.from({ length: count || 5 }, (_, colIdx) => (
              <div key={colIdx} className="skeleton" style={{ flex: 1, height: 20, borderRadius: 6 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return <div className="skeleton-group">{skeletons}</div>;
};

export default Skeleton;
