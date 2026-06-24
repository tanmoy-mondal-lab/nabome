export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-neutral-100 rounded-lg animate-pulse" />
        <div className="h-6 w-48 bg-neutral-100 rounded animate-pulse" />
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse mb-1" />
              <div className="h-5 w-40 bg-neutral-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="h-5 w-32 bg-neutral-100 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-neutral-100 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
