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
      <div className="mb-6">
        <p className="page-eyebrow">Insights</p>
        <h1 className="page-title">Reports &amp; analytics</h1>
        <p className="page-subtitle">Operational insights and summaries.</p>
      </div>

      <ReportTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {error ? (
        <div className="card border-rose-200 bg-rose-50 p-8 text-center" role="alert">
          <p className="mb-4 text-sm font-medium text-rose-700">{error}</p>
          <button onClick={() => fetchReport(activeTab, true)} disabled={retrying} className="btn-danger-solid">
            {retrying ? 'Retrying…' : 'Retry connection'}
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
