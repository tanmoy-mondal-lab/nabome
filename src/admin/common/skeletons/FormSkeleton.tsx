export function FormSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="h-6 w-48 bg-neutral-100 rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse mb-2" />
            <div className="h-10 w-full bg-neutral-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200">
        <div className="h-10 w-24 bg-neutral-100 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
