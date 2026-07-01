import LoadingSpinner from "../components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label="Loading market data..." />
    </div>
  );
}
