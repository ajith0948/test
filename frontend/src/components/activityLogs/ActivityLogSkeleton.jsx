export default function ActivityLogSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 flex items-start space-x-5 relative">
            {i !== 4 && <div className="absolute left-12 top-16 bottom-0 w-0.5 bg-slate-100"></div>}

            <div className="h-12 w-12 bg-slate-200 rounded-2xl flex-shrink-0 z-10"></div>
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
