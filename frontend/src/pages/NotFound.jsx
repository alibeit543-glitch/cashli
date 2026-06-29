import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
      <h1 style={{ marginBottom: 8 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400 }}>
        This page doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
