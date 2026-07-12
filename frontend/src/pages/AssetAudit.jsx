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
  const [role, setRole] = useState(null);

  const isMounted = useRef(true);

  // Only Admins and Asset Managers may create/manage audit cycles - the
  // backend already enforces this (auditRoutes.js), but the button was
  // showing for Employees too and just 403'ing on click.
  const canManageAudits = role === 'Admin' || role === 'Asset Manager';

  const confirmAction = (message) => {
    return window.confirm(message); // Fallback for mock phase until a custom modal is built
  };

  useEffect(() => {
    isMounted.current = true;
    fetchAudits();
    axiosInstance.get('/auth/me').then(({ data }) => {
      if (isMounted.current) setRole(data.role);
    }).catch(() => {
      if (isMounted.current) setRole(null);
    });
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

  const handleCreateAudit = async () => {
    if (isMounted.current) setActionError(null);

    const name = window.prompt('Audit cycle name (e.g. "Q3 Electronics Audit"):');
    if (!name) return;

    const scopeType = window.prompt('Scope - type one of: Organization, Department, Location', 'Organization');
    if (!scopeType || !['Organization', 'Department', 'Location'].includes(scopeType)) {
      setActionError('Scope must be exactly "Organization", "Department", or "Location".');
      return;
    }

    let scopeValue = 'All';
    if (scopeType === 'Department') {
      scopeValue = window.prompt('Department ID (Mongo ObjectId) to audit:');
    } else if (scopeType === 'Location') {
      scopeValue = window.prompt('Location (must match asset location exactly):');
    }
    if (!scopeValue) return;

    const startDate = window.prompt('Start date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    const endDate = window.prompt('End date (YYYY-MM-DD):');
    if (!startDate || !endDate) return;

    try {
      await axiosInstance.post('/audits', { name, scopeType, scopeValue, startDate, endDate });
      await fetchAudits();
    } catch (err) {
      if (isMounted.current) {
        setActionError(err.response?.data?.message || 'Failed to create audit cycle.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Asset Audit</h1>
          <p className="text-slate-500 font-medium mt-1">Manage physical asset verification cycles</p>
        </div>
        {canManageAudits && (
          <button
            onClick={handleCreateAudit}
            className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
          >
            Create Audit Cycle
          </button>
        )}
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
          canManage={canManageAudits}
        />
      )}
    </div>
  );
}
