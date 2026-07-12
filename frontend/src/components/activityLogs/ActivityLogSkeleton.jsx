export default function ActivityLogSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="card overflow-hidden divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-start space-x-3.5 relative">
            {i !== 4 && <div className="absolute left-[35px] top-12 bottom-0 w-px bg-slate-100"></div>}

            <div className="h-9 w-9 bg-slate-200 rounded-md flex-shrink-0 z-10"></div>
            <div className="flex-1 space-y-2.5 pt-0.5">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
