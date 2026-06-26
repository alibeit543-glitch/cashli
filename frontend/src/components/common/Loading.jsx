const Loading = ({ fullScreen }) => (
  <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);

export default Loading;
