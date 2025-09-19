"use client";
import React from 'react';
import ErrorPage from './ErrorBoundary';

class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          error={this.state.error}
          resetError={this.resetError}
          title="Oops! Something went wrong"
          subtitle="We'll be right back"
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
