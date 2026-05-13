import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="glass-panel rounded-xl px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <Skeleton className="mt-1 h-3 w-3 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-64 max-w-full" />
            <Skeleton className="h-3.5 w-48 max-w-full" />
          </div>
          <div className="shrink-0 space-y-1 text-right">
            <Skeleton className="ml-auto h-3 w-12" />
            <Skeleton className="ml-auto h-5 w-16" />
          </div>
        </div>
      </div>

      {/* Service rows */}
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-2xl px-3 py-2.5 sm:px-3.5 sm:py-3">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-x-2 sm:gap-x-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-md sm:h-9 sm:w-9 sm:rounded-lg" />
              <div className="min-w-0 space-y-1.5">
                <Skeleton className="h-3.5 w-28 max-w-full" />
                <Skeleton className="h-3 w-40 max-w-full" />
              </div>
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    </div>
  );
}
