interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export default function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "relative overflow-hidden after:absolute after:inset-0 after:translate-x-[-100%] after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`bg-zinc-200 dark:bg-zinc-700 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Common skeleton patterns
export function FormSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton width={150} height={20} />
        <Skeleton width="100%" height={44} />
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton width={120} height={16} />
            <Skeleton width="100%" height={44} />
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <Skeleton width={140} height={44} variant="rectangular" />
        <Skeleton width={100} height={44} variant="rectangular" />
      </div>
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton width={180} height={24} />
      <Skeleton width={120} height={40} />
      <div className="space-y-3 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryListSkeleton() {
  return (
    <div className="space-y-3 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <Skeleton width={120} height={24} />
          <Skeleton width={180} height={16} />
        </div>
        <Skeleton width={100} height={32} variant="rectangular" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton width={100} height={24} />
              <Skeleton width={140} height={14} />
            </div>
            <div className="flex gap-2">
              <Skeleton width={32} height={32} variant="circular" />
              <Skeleton width={32} height={32} variant="circular" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton width={80} height={24} variant="rectangular" />
            <Skeleton width={80} height={24} variant="rectangular" />
            <Skeleton width={80} height={24} variant="rectangular" />
          </div>
        </div>
      ))}
    </div>
  );
}
