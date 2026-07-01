interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export default function LoadingSpinner({
  size = "md",
  label = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-live="polite">
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600 dark:text-blue-400`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label && (
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
