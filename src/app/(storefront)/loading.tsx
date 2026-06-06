export default function StorefrontLoading() {
  return (
    <div className="flex-1">
      {/* Hero skeleton */}
      <div className="bg-muted h-[480px] w-full animate-pulse" />

      {/* Section skeleton */}
      <div className="container mx-auto space-y-8 px-4 py-16">
        <div className="flex items-center justify-between">
          <div className="bg-muted h-7 w-48 animate-pulse rounded-lg" />
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted aspect-square animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
