import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { REPORT_TYPES, UI_MESSAGES } from '../utils/constants';
import ReportTabs     from '../components/reports/ReportTabs';
import ReportTable    from '../components/reports/ReportTable';
import ReportSkeleton from '../components/reports/ReportSkeleton';

// Map each tab key to its backend endpoint path. Namespaced under /reports/*
// (rather than the original bare /utilization etc.) to avoid colliding with
// the real /api/maintenance and /api/allocations resource routes.
const ENDPOINT_MAP = {
  [REPORT_TYPES.UTILIZATION]: '/reports/utilization',
  [REPORT_TYPES.MAINTENANCE]: '/reports/maintenance',
  [REPORT_TYPES.ALLOCATIONS]: '/reports/allocations'
};

export default function Reports() {
  const [activeTab,   setActiveTab]   = useState(REPORT_TYPES.UTILIZATION);
  const [reportData,  setReportData]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [retrying,    setRetrying]    = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchReport(activeTab);
    return () => {
      isMounted.current = false;
    };
  }, [activeTab]);

  const fetchReport = async (tabKey, isRetry = false) => {
    try {
      if (isMounted.current) {
        if (isRetry) setRetrying(true);
        setLoading(true);
        setError(null);
      }
      // TODO (Phase 4): Each endpoint will execute a real Mongoose aggregate query.
      const response = await axiosInstance.get(ENDPOINT_MAP[tabKey]);
      if (isMounted.current) setReportData(response.data);
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err.response?.data?.message || err.message || UI_MESSAGES.REPORTS_LOAD_ERROR;
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRetrying(false);
      }
    }
  };

  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    setActiveTab(tabKey);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Operational insights and summaries</p>
        </div>
      </div>

      <ReportTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center shadow-sm" role="alert">
          <p className="text-rose-600 font-medium mb-6">{error}</p>
          <button
            onClick={() => fetchReport(activeTab, true)}
            disabled={retrying}
            className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retrying ? 'Retrying…' : 'Retry Connection'}
          </button>
        </div>
      ) : loading ? (
        <ReportSkeleton />
      ) : (
        <ReportTable data={reportData} />
      )}
    </div>
  );
}
