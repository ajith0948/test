import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import ActivityLogList from '../components/activityLogs/ActivityLogList';
import ActivityLogSkeleton from '../components/activityLogs/ActivityLogSkeleton';
import { UI_MESSAGES, ACTIVITY_MODULES } from '../utils/constants';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(ACTIVITY_MODULES.ALL);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchLogs(activeFilter);
    return () => {
      isMounted.current = false;
    };
  }, [activeFilter]);

  const fetchLogs = async (moduleFilter) => {
    try {
      if (isMounted.current) setLoading(true);
      if (isMounted.current) setError(null);

      const queryParams = moduleFilter !== ACTIVITY_MODULES.ALL ? `?module=${moduleFilter}` : '';
      const response = await axiosInstance.get(`/logs${queryParams}`);

      if (isMounted.current) setLogs(response.data);
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err.response?.data?.message || err.message || UI_MESSAGES.ACTIVITY_LOGS_LOAD_ERROR;
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activity Logs</h1>
          <p className="text-slate-500 font-medium mt-1">Audit trail of actions performed within the system.</p>
        </div>
      </div>

      <div className="mb-8 flex space-x-2 overflow-x-auto pb-2">
        {Object.values(ACTIVITY_MODULES).map((moduleName) => (
          <button
            key={moduleName}
            onClick={() => handleFilterChange(moduleName)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap focus:outline-none ${
              activeFilter === moduleName
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {moduleName}
          </button>
        ))}
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center shadow-sm" role="alert">
          <p className="text-rose-600 font-medium mb-6">{error}</p>
          <button
            onClick={() => fetchLogs(activeFilter)}
            className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <ActivityLogSkeleton />
      ) : (
        <ActivityLogList logs={logs} />
      )}
    </div>
  );
}
