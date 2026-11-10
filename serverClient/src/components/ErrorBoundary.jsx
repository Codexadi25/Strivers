import React from 'react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="sc-error-boundary-wrapper">
          <div className="sc-error-card">
            <div className="sc-error-icon">⚠️</div>
            <h2 className="sc-error-title">Strivers Server GUI Encountered an Issue</h2>
            <p className="sc-error-desc">
              The application encountered a render or initialization error. The diagnostics below can help resolve it.
            </p>
            {this.state.error && (
              <div className="sc-error-details">
                <strong>Error:</strong> {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <>
                    <br /><br />
                    <strong>Component Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </div>
            )}
            <div className="sc-error-actions">
              <button
                type="button"
                className="sc-error-reload-btn"
                onClick={this.handleReload}
              >
                Reload Server GUI
              </button>
              <button
                type="button"
                className="sc-error-secondary-btn"
                onClick={this.handleResetState}
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

