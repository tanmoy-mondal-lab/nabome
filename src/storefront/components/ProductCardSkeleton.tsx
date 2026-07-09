import { cn } from "../../lib/utils/cn";

interface ProductCardSkeletonProps {
  view?: "grid" | "list";
}

export function ProductCardSkeleton({ view = "grid" }: ProductCardSkeletonProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg overflow-hidden",
      view === "grid" ? "aspect-[3/4]" : "flex gap-4 p-4"
    )}>
      <div className={cn(
        "bg-neutral-100 animate-pulse",
        view === "grid" ? "w-full h-3/5" : "w-32 h-32 flex-shrink-0 rounded"
      )} />
      <div className={cn(
        "p-4 space-y-3",
        view === "grid" ? "" : "flex-1"
      )}>
        <div className="h-4 bg-neutral-100 animate-pulse rounded w-3/4" />
        <div className="h-3 bg-neutral-100 animate-pulse rounded w-1/2" />
        <div className="h-5 bg-neutral-100 animate-pulse rounded w-1/3" />
        {view === "list" && (
          <div className="h-4 bg-neutral-100 animate-pulse rounded w-1/4" />
        )}
      </div>
    </div>
  );
}
