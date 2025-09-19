"use client";
import ErrorPage from '@/components/error/ErrorBoundary';

export default function NotFound() {
  return (
    <ErrorPage
      error={{ message: "I couldn't find that page in my database." }}
      resetError={() => window.location.href = '/'}
      title="404 - Lost in Cyberspace"
      subtitle="Let me help you navigate back to safety"
      showDetails={false}
    />
  );
}
