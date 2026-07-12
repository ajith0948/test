import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import AuditCycleList from '../components/audit/AuditCycleList';
import AuditDetailModal from '../components/audit/AuditDetailModal';
import AuditSkeleton from '../components/audit/AuditSkeleton';
import { UI_MESSAGES } from '../utils/constants';

export default function AssetAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const isMounted = useRef(true);

  const confirmAction = (message) => {
    return window.confirm(message); // Fallback for mock phase until a custom modal is built
  };

  useEffect(() => {
    isMounted.current = true;
    fetchAudits();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAudits = async () => {
    try {
      if (isMounted.current) setLoading(true);
      if (isMounted.current) setError(null);
      // TODO (Phase 4): Fetch from real MongoDB backend via GET /audits endpoint
      const response = await axiosInstance.get('/audits');
      if (isMounted.current) setAudits(response.data);
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err.response?.data?.message || err.message || UI_MESSAGES.AUDIT_LOAD_ERROR;
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleUpdateItem = async (auditId, assetTag, newResult) => {
    if (isMounted.current) setActionError(null);
    const previousAudits = [...audits];
    const previousSelectedAudit = selectedAudit ? { ...selectedAudit } : null;

    try {
      if (isMounted.current) {
        setAudits(prev => prev.map(a => {
          if (a.id === auditId) {
            return {
              ...a,
              items: a.items.map(item => item.assetTag === assetTag ? { ...item, result: newResult } : item)
            };
          }
          return a;
        }));

        if (selectedAudit && selectedAudit.id === auditId) {
          setSelectedAudit(prev => ({
            ...prev,
            items: prev.items.map(item => item.assetTag === assetTag ? { ...item, result: newResult } : item)
          }));
        }
      }

      // Phase 4: PUT /audits/:id/items to update AuditItem document
      await axiosInstance.put(`/audits/${auditId}/items`, { assetTag, result: newResult });
    } catch (err) {
      if (isMounted.current) {
        setAudits(previousAudits);
        if (previousSelectedAudit) setSelectedAudit(previousSelectedAudit);
        setActionError(UI_MESSAGES.AUDIT_UPDATE_ERROR);
      }
    }
  };

  const handleCloseAudit = async (auditId) => {
    if (isMounted.current) setActionError(null);
    if (!confirmAction(UI_MESSAGES.AUDIT_CLOSE_CONFIRM)) return;

    try {
      // TODO (Phase 4): POST /audits/:id/close to update AuditCycle status and cascade 'Lost' status to Asset models.
      await axiosInstance.post(`/audits/${auditId}/close`);

      await fetchAudits();
      if (isMounted.current) setSelectedAudit(null);
    } catch (err) {
      if (isMounted.current) setActionError(UI_MESSAGES.AUDIT_CLOSE_ERROR);
    }
  };

  const handleCreateMockAudit = () => {
    if (isMounted.current) setActionError(UI_MESSAGES.AUDIT_CREATE_MOCK);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Asset Audit</h1>
          <p className="text-slate-500 font-medium mt-1">Manage physical asset verification cycles</p>
        </div>
        <button
          onClick={handleCreateMockAudit}
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
        >
          Create Audit Cycle
        </button>
      </div>

      {actionError && (
        <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl relative shadow-sm" role="alert">
          <span className="block sm:inline font-medium">{actionError}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-6 py-4"
            onClick={() => setActionError(null)}
          >
            <span className="text-amber-800 hover:text-amber-900 text-2xl font-bold transition-colors">&times;</span>
          </button>
        </div>
      )}

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center shadow-sm" role="alert">
          <p className="text-rose-600 font-medium mb-6">{error}</p>
          <button
            onClick={fetchAudits}
            className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <AuditSkeleton />
      ) : (
        <AuditCycleList
          audits={audits}
          onViewDetails={(audit) => {
            setActionError(null);
            setSelectedAudit(audit);
          }}
        />
      )}

      {selectedAudit && (
        <AuditDetailModal
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
          onUpdateItem={handleUpdateItem}
          onCloseAudit={handleCloseAudit}
        />
      )}
    </div>
  );
}
