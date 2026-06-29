import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
          <h1 style={{ marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Refresh Page
            </button>
            <Link to="/" className="btn btn-outline">Go Home</Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ marginTop: 24, padding: 16, background: 'var(--bg-input)', borderRadius: 8, fontSize: 12, maxWidth: '100%', overflow: 'auto', textAlign: 'left' }}>
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
