export default function NotificationSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 flex items-start space-x-5">
            <div className="h-12 w-12 bg-slate-200 rounded-2xl flex-shrink-0"></div>
            <div className="flex-1 space-y-3 pt-1">
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
