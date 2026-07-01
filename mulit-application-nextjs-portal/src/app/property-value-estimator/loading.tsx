import { FormSkeleton, ResultSkeleton } from "../components/Skeleton";

export default function Loading() {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <FormSkeleton />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <ResultSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
