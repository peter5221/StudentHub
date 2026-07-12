export function CardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="stat-card animate-pulse">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-7 w-16 rounded mt-1" />
    </div>
  );
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}
