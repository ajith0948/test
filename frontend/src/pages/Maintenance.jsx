import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';

const emptyForm = { assetId: '', issueDescription: '', priority: 'Medium' };
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const inputClass = 'field-input mt-1.5';

function Field({ label, required, children }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}{required && <span className="ml-1 text-rose-500">*</span>}
            {children}
        </label>
    );
}

export default function Maintenance() {
    const [me, setMe] = useState(null);
    const [assets, setAssets] = useState([]);
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/auth/me').then(({ data }) => setMe(data)).catch(() => setMe(null));
    }, []);

    const loadData = useCallback(async () => {
        try {
            setError('');
            const [assetResponse, requestResponse] = await Promise.all([
                api.get('/assets', { params: { limit: 100 } }),
                api.get('/maintenance'),
            ]);
            setAssets(assetResponse.data.assets);
            setRequests(requestResponse.data.requests);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not reach the AssetFlow API.');
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const showNotice = (message) => { setNotice(message); setError(''); setTimeout(() => setNotice(''), 3500); };

    const canReview = me?.role === 'Admin' || me?.role === 'Asset Manager' || me?.role === 'Department Head';
    const canResolve = me?.role === 'Admin' || me?.role === 'Asset Manager';

    const kpis = useMemo(() => {
        const pending = requests.filter((request) => request.status === 'Pending').length;
        const inProgress = requests.filter((request) => ['Approved', 'TechnicianAssigned', 'InProgress'].includes(request.status)).length;
        const resolved = requests.filter((request) => request.status === 'Resolved').length;
        return { total: requests.length, pending, inProgress, resolved };
    }, [requests]);

    const update = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post('/maintenance', {
                assetId: form.assetId,
                issueDescription: form.issueDescription,
                priority: form.priority,
            });
            setForm(emptyForm);
            setShowForm(false);
            showNotice('Maintenance request raised successfully.');
            loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Error raising request.');
        } finally {
            setSubmitting(false);
        }
    };

    const review = async (id, decision) => {
        try {
            const technician = decision === 'Approved' ? (window.prompt('Assign a technician (optional):') || undefined) : undefined;
            const rejectionReason = decision === 'Rejected' ? (window.prompt('Reason for rejecting (optional):') || undefined) : undefined;
            await api.patch(`/maintenance/${id}/approve`, { decision, technician, rejectionReason });
            showNotice(`Request ${decision.toLowerCase()}.`);
            loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not review request.');
        }
    };

    const resolve = async (id) => {
        const resolutionNotes = window.prompt('Resolution notes (optional):') || undefined;
        try {
            await api.patch(`/maintenance/${id}/resolve`, { resolutionNotes });
            showNotice('Request marked resolved.');
            loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not resolve request.');
        }
    };

    const columns = [
        {
            key: 'asset',
            header: 'Asset',
            render: (request) => (
                <div>
                    <p className="font-semibold text-slate-800">{request.asset?.name || request.asset}</p>
                    {request.asset?.assetTag && <p className="mt-0.5 font-mono text-xs text-slate-400">{request.asset.assetTag}</p>}
                </div>
            ),
        },
        { key: 'issueDescription', header: 'Issue' },
        { key: 'priority', header: 'Priority' },
        { key: 'status', header: 'Status', render: (request) => <StatusBadge value={request.status} /> },
        { key: 'technician', header: 'Technician', render: (request) => request.technician || '—' },
        {
            key: 'actions',
            header: '',
            render: (request) => (
                <div className="flex gap-2">
                    {request.status === 'Pending' && canReview && (
                        <>
                            <button type="button" className="btn-danger !px-3 !py-1.5 !text-xs" onClick={() => review(request._id, 'Rejected')}>
                                Reject
                            </button>
                            <button type="button" className="btn-primary !px-3 !py-1.5 !text-xs" onClick={() => review(request._id, 'Approved')}>
                                Approve
                            </button>
                        </>
                    )}
                    {['Approved', 'TechnicianAssigned', 'InProgress'].includes(request.status) && canResolve && (
                        <button type="button" className="btn !px-3 !py-1.5 !text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => resolve(request._id)}>
                            Mark resolved
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="page-eyebrow">Keep assets in service</p>
                    <h1 className="page-title">Maintenance management</h1>
                    <p className="page-subtitle">Raise issues, approve repairs, and track resolution.</p>
                </div>
                <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
                    + Raise request
                </button>
            </div>

            {notice && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
            {error && <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KPICard label="Total requests" value={kpis.total} />
                <KPICard label="Pending" value={kpis.pending} />
                <KPICard label="In progress" value={kpis.inProgress} />
                <KPICard label="Resolved" value={kpis.resolved} />
            </div>

            <Table
                columns={columns}
                rows={requests}
                emptyTitle="No maintenance requests"
                emptyText="Raise a request when an asset needs attention."
            />

            {showForm && (
                <Modal title="Raise a maintenance request" onClose={() => setShowForm(false)}>
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Asset" required>
                            <select className={inputClass} name="assetId" value={form.assetId} onChange={update} required disabled={!assets.length}>
                                <option value="">{assets.length ? 'Select an asset' : 'No assets yet'}</option>
                                {assets.map((asset) => (
                                    <option key={asset._id} value={asset._id}>{asset.assetTag} — {asset.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Priority">
                            <select className={inputClass} name="priority" value={form.priority} onChange={update}>
                                {PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
                            </select>
                        </Field>
                        <Field label="Issue description" required>
                            <textarea className={inputClass} name="issueDescription" value={form.issueDescription} onChange={update} rows="4" required />
                        </Field>
                        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="btn-primary">
                                {submitting ? 'Submitting…' : 'Submit request'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
