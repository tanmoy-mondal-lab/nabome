export function ProductTableSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-neutral-100">
        <div className="h-10 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-5 h-5 bg-neutral-100 rounded animate-pulse" />
            <div className="w-11 h-11 bg-neutral-100 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-100 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-neutral-100 rounded w-1/4 animate-pulse" />
            </div>
            <div className="h-4 bg-neutral-100 rounded w-16 animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded w-12 animate-pulse" />
            <div className="h-6 bg-neutral-100 rounded-full w-16 animate-pulse" />
            <div className="h-4 bg-neutral-100 rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="aspect-[3/4] bg-neutral-100 animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-neutral-100 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-neutral-100 rounded w-1/2 animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="h-4 bg-neutral-100 rounded w-16 animate-pulse" />
              <div className="h-5 bg-neutral-100 rounded-full w-12 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
