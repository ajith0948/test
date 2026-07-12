export default function NotificationSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="card overflow-hidden divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-start space-x-3.5">
            <div className="h-9 w-9 bg-slate-200 rounded-md flex-shrink-0"></div>
            <div className="flex-1 space-y-2.5 pt-0.5">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 w-4 bg-slate-200 rounded-full flex-shrink-0 mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
