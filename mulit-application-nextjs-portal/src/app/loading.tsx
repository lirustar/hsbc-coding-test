import LoadingSpinner from "./components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label="Loading page..." />
    </div>
  );
}
