import React from 'react';

/**
 * Error Boundary — catches React rendering errors.
 * Prevents the entire app from crashing if a component fails.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center" style={{ padding: '6rem 2rem', minHeight: '60vh' }}>
          <div className="glass-panel p-5" style={{ borderRadius: 'var(--radius-xl)', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
              style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
