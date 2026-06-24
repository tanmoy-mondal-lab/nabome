export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="h-10 w-64 bg-neutral-100 rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-neutral-100 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-5 w-5 bg-neutral-100 rounded animate-pulse" />
            <div className="h-10 w-10 bg-neutral-100 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
            <div className="h-6 w-16 bg-neutral-100 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
