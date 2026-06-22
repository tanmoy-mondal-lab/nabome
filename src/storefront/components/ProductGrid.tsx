import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Record<string, unknown>[];
  columns?: number;
  isLoading?: boolean;
  view?: "grid" | "list";
  onQuickView?: (product: Record<string, unknown>) => void;
}

export function ProductGrid({ products, columns = 4, isLoading, view = "grid", onQuickView }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" : "space-y-4"}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={view === "list" ? "flex gap-6 p-4 border border-neutral-100" : "space-y-3"}>
            <div className={`${view === "list" ? "w-32 h-44" : "aspect-[3/4]"} bg-neutral-100 animate-pulse rounded`} />
            {view === "list" ? (
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-neutral-100 animate-pulse rounded w-1/3" />
                <div className="h-4 bg-neutral-100 animate-pulse rounded w-2/3" />
                <div className="h-4 bg-neutral-100 animate-pulse rounded w-1/4" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-3 bg-neutral-100 animate-pulse rounded w-1/3" />
                <div className="h-4 bg-neutral-100 animate-pulse rounded w-2/3" />
                <div className="h-4 bg-neutral-100 animate-pulse rounded w-1/4" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard
            key={product.id as string}
            product={product}
            view="list"
            onQuickView={() => onQuickView?.(product)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id as string}
          product={product}
          onQuickView={() => onQuickView?.(product)}
        />
      ))}
    </div>
  );
}
