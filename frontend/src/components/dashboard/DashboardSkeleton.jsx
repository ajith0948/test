export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between h-[132px]">
            <div className="flex justify-between items-start">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-9 w-9 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="h-10 bg-slate-200 rounded w-1/3 mt-4"></div>
          </div>
        ))}
      </div>

      <div>
        <div className="h-7 bg-slate-200 rounded w-1/4 mb-5"></div>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
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
