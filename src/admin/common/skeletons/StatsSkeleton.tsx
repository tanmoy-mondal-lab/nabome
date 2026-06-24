export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
            <div className="h-8 w-8 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-neutral-100 rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
