"use client";
import ErrorPage from '@/components/error/ErrorBoundary';

export default function Error({ error, reset }) {
  return (
    <ErrorPage
      error={error}
      resetError={reset}
      title="Oops! My circuits got tangled"
      subtitle="Let me reboot and get back to helping you"
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}
