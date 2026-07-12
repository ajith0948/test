import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import KPICard from '../components/dashboard/KPICard';
import ReturnsList from '../components/dashboard/ReturnsList';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import { UI_MESSAGES } from '../utils/constants';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchDashboardData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (isMounted.current) setLoading(true);
      if (isMounted.current) setError(null);
      // TODO (Phase 4): This calls the mock endpoint. Will fetch from real DB aggregations later.
      const response = await axiosInstance.get('/dashboard/kpis');
      if (isMounted.current) setData(response.data);
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err.response?.data?.message || err.message || UI_MESSAGES.DASHBOARD_LOAD_ERROR;
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Dashboard</h1>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-rose-600 font-medium mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.kpis) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Dashboard</h1>
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 shadow-sm font-medium">
          {UI_MESSAGES.DASHBOARD_EMPTY}
        </div>
      </div>
    );
  }

  const { kpis, returns } = data;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time asset intelligence</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        <KPICard title="Assets Available" value={kpis.assetsAvailable} />
        <KPICard title="Assets Allocated" value={kpis.assetsAllocated} />
        <KPICard title="Maintenance Today" value={kpis.maintenanceToday} urgent={kpis.maintenanceToday > 0} />
        <KPICard title="Active Bookings" value={kpis.activeBookings} />
        <KPICard title="Pending Transfers" value={kpis.pendingTransfers} />
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-5">Returns & Allocations</h2>
        <ReturnsList returns={returns} />
      </div>
    </div>
  );
}
