"use client";

import ErrorBoundary from "./ErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
