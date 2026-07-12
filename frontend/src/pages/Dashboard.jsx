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
        <p className="page-eyebrow">Overview</p>
        <h1 className="page-title !text-2xl mb-6">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="page-eyebrow">Overview</p>
        <h1 className="page-title !text-2xl mb-6">Dashboard</h1>
        <div className="card border-rose-200 bg-rose-50 p-8 text-center">
          <p className="mb-4 text-sm font-medium text-rose-700">{error}</p>
          <button onClick={fetchDashboardData} className="btn-danger-solid">
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.kpis) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="page-eyebrow">Overview</p>
        <h1 className="page-title !text-2xl mb-6">Dashboard</h1>
        <div className="card p-16 text-center text-sm font-medium text-slate-500">
          {UI_MESSAGES.DASHBOARD_EMPTY}
        </div>
      </div>
    );
  }

  const { kpis, returns } = data;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="page-eyebrow">Overview</p>
          <h1 className="page-title !text-2xl">Dashboard</h1>
          <p className="page-subtitle">Real-time asset intelligence</p>
        </div>
        <button onClick={fetchDashboardData} className="btn-secondary">
          Refresh data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KPICard title="Assets Available" value={kpis.assetsAvailable} />
        <KPICard title="Assets Allocated" value={kpis.assetsAllocated} />
        <KPICard title="Maintenance Today" value={kpis.maintenanceToday} urgent={kpis.maintenanceToday > 0} />
        <KPICard title="Active Bookings" value={kpis.activeBookings} />
        <KPICard title="Pending Transfers" value={kpis.pendingTransfers} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Returns & Allocations</h2>
        <ReturnsList returns={returns} />
      </div>
    </div>
  );
}
