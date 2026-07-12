export default function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-4 card p-5">
        <div className="h-4 bg-slate-200 rounded w-1/6 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-4 bg-slate-200 rounded w-32 flex-shrink-0"></div>
            <div className="h-2.5 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 rounded w-10 flex-shrink-0"></div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="h-14 bg-slate-50 border-b border-slate-100"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
