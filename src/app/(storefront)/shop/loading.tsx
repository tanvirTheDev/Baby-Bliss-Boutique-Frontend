export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title skeleton */}
      <div className="mb-6 space-y-2">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-60 shrink-0 space-y-6 lg:block">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="bg-muted h-3 w-full animate-pulse rounded" />
              ))}
            </div>
          ))}
        </aside>

        {/* Products grid skeleton */}
        <div className="flex-1">
          <div className="mb-6 flex justify-end">
            <div className="bg-muted h-8 w-44 animate-pulse rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card overflow-hidden rounded-xl border">
                <div className="bg-muted aspect-square animate-pulse" />
                <div className="space-y-2 p-4">
                  <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
                  <div className="bg-muted h-5 w-1/3 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
