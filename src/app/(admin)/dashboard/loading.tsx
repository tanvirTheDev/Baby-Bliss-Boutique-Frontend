export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
        <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-4 w-64 animate-pulse rounded" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
            </div>
            <div className="bg-muted h-7 w-20 animate-pulse rounded" />
            <div className="bg-muted h-3 w-32 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-card rounded-lg border">
        <div className="border-b p-4">
          <div className="bg-muted h-5 w-32 animate-pulse rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted h-4 flex-1 animate-pulse rounded" />
            <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            <div className="bg-muted h-6 w-16 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
