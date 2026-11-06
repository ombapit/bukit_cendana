type SkeletonProps = { className?: string };

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-gray-200/70 dark:bg-white/10 ${className}`} />;
}

export function SkeletonList({ rows = 5, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-label="Memuat data">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="glass rounded-xl p-4 space-y-3">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass rounded-2xl overflow-hidden p-4 space-y-3" aria-label="Memuat data">
      <div className="flex gap-4 pb-2 border-b border-gray-200/50 dark:border-white/10">
        {Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-3 flex-1" />)}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-4 items-center">
          {Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={`h-4 ${column === 0 ? "w-1/4" : "flex-1"}`} />)}
        </div>
      ))}
    </div>
  );
}
