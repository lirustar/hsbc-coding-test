"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8" role="alert">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400/50 focus:ring-offset-2"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
