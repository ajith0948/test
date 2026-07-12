export default function AuditSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="card overflow-hidden">
        <div className="h-14 bg-slate-50 border-b border-slate-100"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 border-b border-slate-100 px-6 flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
