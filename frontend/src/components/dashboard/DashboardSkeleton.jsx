export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-5 flex flex-col justify-between h-[124px]">
            <div className="flex justify-between items-start">
              <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-1/3 mt-4"></div>
          </div>
        ))}
      </div>

      <div>
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="card overflow-hidden">
          <div className="h-14 bg-slate-50 border-b border-slate-100"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 border-b border-slate-100 px-6 flex items-center">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
