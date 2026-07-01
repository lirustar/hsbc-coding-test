import { HistoryListSkeleton } from "../../components/Skeleton";

export default function Loading() {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <HistoryListSkeleton />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <div className="space-y-4">
              <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" aria-hidden="true" />
              <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
