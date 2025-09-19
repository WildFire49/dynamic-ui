"use client";
import { useEffect, useState } from 'react';
import ErrorPage from './ErrorBoundary';

const GlobalErrorHandler = ({ children }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError({
        message: 'An unexpected error occurred',
        stack: event.reason?.stack || 'No stack trace available'
      });
    };

    // Handle general JavaScript errors
    const handleError = (event) => {
      console.error('Global error:', event.error);
      setError({
        message: event.error?.message || 'An unexpected error occurred',
        stack: event.error?.stack || 'No stack trace available'
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const resetError = () => {
    setError(null);
  };

  if (error) {
    return (
      <ErrorPage
        error={error}
        resetError={resetError}
        title="Oops! Something went wrong"
        subtitle="We'll be right back"
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  return children;
};

export default GlobalErrorHandler;
