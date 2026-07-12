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
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="page-eyebrow">Audit trail</p>
          <h1 className="page-title">Activity logs</h1>
          <p className="page-subtitle">Record of actions performed within the system.</p>
        </div>
      </div>

      <div className="mb-6 flex space-x-2 overflow-x-auto pb-1">
        {Object.values(ACTIVITY_MODULES).map((moduleName) => (
          <button
            key={moduleName}
            onClick={() => handleFilterChange(moduleName)}
            className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
              activeFilter === moduleName
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {moduleName}
          </button>
        ))}
      </div>

      {error ? (
        <div className="card border-rose-200 bg-rose-50 p-8 text-center" role="alert">
          <p className="mb-4 text-sm font-medium text-rose-700">{error}</p>
          <button onClick={() => fetchLogs(activeFilter)} className="btn-danger-solid">
            Retry connection
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
