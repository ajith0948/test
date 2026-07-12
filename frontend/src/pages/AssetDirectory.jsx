import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import AssetForm from '../components/assets/AssetForm';

const STATUS_OPTIONS = ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'];

const inputClass =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function AssetDirectory() {
    const [assets, setAssets] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [showRegistration, setShowRegistration] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [role, setRole] = useState(null);

    // Only Admins and Asset Managers may register assets - not Employees, and
    // not Department Heads either. The backend already enforces this
    // (assetRoutes.js), this just keeps the button/form from being shown to
    // people who'd get a 403 anyway.
    useEffect(() => {
        api.get('/auth/me').then(({ data }) => setRole(data.role)).catch(() => setRole(null));
    }, []);
    const canRegisterAsset = role === 'Admin' || role === 'Asset Manager';

    const loadData = useCallback(async () => {
        try {
            setError('');
            const [assetResponse, allocationResponse] = await Promise.all([
                api.get('/assets', { params: { search: search || undefined, status: status || undefined } }),
                api.get('/allocations', { params: { status: 'Active' } }),
            ]);
            setAssets(assetResponse.data.assets);
            setAllocations(allocationResponse.data.allocations);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not reach the AssetFlow API.');
        }
    }, [search, status]);

    useEffect(() => {
        const timer = setTimeout(loadData, 250); // small debounce for the search box
        return () => clearTimeout(timer);
    }, [loadData]);

    const activeByAsset = useMemo(
        () => new Map(allocations.map((item) => [String(item.asset), item])),
        [allocations]
    );

    const kpis = useMemo(() => {
        const total = assets.length;
        const available = assets.filter((asset) => asset.status === 'Available').length;
        const allocated = assets.filter((asset) => asset.status === 'Allocated').length;
        const maintenance = assets.filter((asset) => asset.status === 'Under Maintenance').length;
        return { total, available, allocated, maintenance };
    }, [assets]);

    const showNotice = (message) => {
        setNotice(message);
        setError('');
        setTimeout(() => setNotice(''), 3500);
    };

    const registerCreated = (asset) => {
        setShowRegistration(false);
        showNotice(`${asset.assetTag} registered successfully.`);
        loadData();
    };

    const columns = [
        {
            key: 'name',
            header: 'Asset',
            render: (asset) => (
                <div>
                    <p className="font-semibold text-slate-800">{asset.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-400">
                        {asset.assetTag}{asset.serialNumber && ` · ${asset.serialNumber}`}
                    </p>
                </div>
            ),
        },
        { key: 'status', header: 'Status', render: (asset) => <StatusBadge value={asset.status} /> },
        { key: 'category', header: 'Category', render: (asset) => asset.category?.name || '—' },
        { key: 'location', header: 'Location' },
        {
            key: 'holder',
            header: 'Holder',
            render: (asset) => {
                const allocation = activeByAsset.get(String(asset._id));
                return <span className="font-mono text-xs text-slate-500">{allocation ? (allocation.employee || allocation.department) : '—'}</span>;
            },
        },
        { key: 'condition', header: 'Condition' },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Core asset management</p>
                    <h1 className="text-2xl font-bold text-slate-900">Asset directory</h1>
                    <p className="mt-1 text-sm text-slate-500">Register, locate, and monitor every physical asset.</p>
                </div>
                {canRegisterAsset && (
                    <button
                        type="button"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        onClick={() => setShowRegistration(true)}
                    >
                        + Register asset
                    </button>
                )}
            </div>

            {notice && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
            {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KPICard label="Total assets" value={kpis.total} />
                <KPICard label="Available" value={kpis.available} />
                <KPICard label="Allocated" value={kpis.allocated} />
                <KPICard label="Under maintenance" value={kpis.maintenance} />
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
                <input
                    className={inputClass}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, asset tag or serial number"
                />
                <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="">All lifecycle states</option>
                    {STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
                </select>
            </div>

            <Table
                columns={columns}
                rows={assets}
                emptyTitle="No assets match this view"
                emptyText="Register your first asset to start tracking its lifecycle."
            />

            {showRegistration && canRegisterAsset && (
                <Modal title="Register a new asset" onClose={() => setShowRegistration(false)}>
                    <AssetForm onCreated={registerCreated} onCancel={() => setShowRegistration(false)} />
                </Modal>
            )}
        </div>
    );
}
