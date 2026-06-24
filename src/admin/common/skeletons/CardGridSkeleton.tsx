export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="aspect-square bg-neutral-100 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse mb-2" />
          <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse mb-3" />
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 bg-neutral-100 rounded animate-pulse" />
            <div className="h-6 w-16 bg-neutral-100 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
