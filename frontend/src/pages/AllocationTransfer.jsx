import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import StatusBadge from '../components/common/StatusBadge';

const emptyAllocation = { assetId: '', recipientType: 'employee', recipientId: '', expectedReturnDate: '' };
const emptyManagerTransfer = { assetId: '', requestedBy: '', recipientType: 'employee', recipientId: '', reason: '' };
const emptySelfTransfer = { assetId: '', reason: '' };
const emptyAllocationRequest = { assetId: '', recipientType: 'self', reason: '' };

const inputClass =
    'mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

function Field({ label, required, hint, children }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}{required && <span className="ml-1 text-rose-500">*</span>}
            {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
            {children}
        </label>
    );
}

function Card({ title, children }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
            <div className="mt-5 space-y-4">{children}</div>
        </div>
    );
}

function ListCard({ title, children, empty }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="font-bold text-slate-900">{title}</h3>
            </div>
            {children}
            {empty}
        </div>
    );
}

function EmptyState({ title, text }) {
    return (
        <div className="px-5 py-10 text-center">
            <p className="font-medium text-slate-700">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{text}</p>
        </div>
    );
}

function Row({ children }) {
    return <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0">{children}</div>;
}

function ReviewButtons({ onReject, onApprove, approveLabel = 'Approve' }) {
    return (
        <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50" onClick={onReject}>
                Reject
            </button>
            <button type="button" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700" onClick={onApprove}>
                {approveLabel}
            </button>
        </div>
    );
}

const ROLE_COPY = {
    Employee: {
        eyebrow: 'Self-service',
        subtitle: 'View what’s allocated to you and request assets that are currently held by someone else.',
    },
    'Department Head': {
        eyebrow: 'Department-scoped approvals',
        subtitle: 'Review transfer and return requests for assets currently held within your department.',
    },
    'Asset Manager': {
        eyebrow: 'Conflict-safe workflow',
        subtitle: 'Allocate assets, and review every transfer and return request org-wide.',
    },
    Admin: {
        eyebrow: 'Conflict-safe workflow',
        subtitle: 'Allocate assets, and review every transfer and return request org-wide.',
    },
};

export default function AllocationTransfer() {
    const [me, setMe] = useState(null);
    const [loadingMe, setLoadingMe] = useState(true);
    const [assets, setAssets] = useState([]);
    const [myAllocations, setMyAllocations] = useState([]); // "mine" active allocations
    const [pendingTransfers, setPendingTransfers] = useState([]); // to review
    const [pendingReturns, setPendingReturns] = useState([]); // to review
    const [myTransferRequests, setMyTransferRequests] = useState([]); // submitted by me
    const [myAllocationRequests, setMyAllocationRequests] = useState([]); // asset requests submitted by me
    const [pendingAllocationRequests, setPendingAllocationRequests] = useState([]); // asset requests to review

    const [allocationForm, setAllocationForm] = useState(emptyAllocation);
    const [managerTransferForm, setManagerTransferForm] = useState(emptyManagerTransfer);
    const [selfTransferForm, setSelfTransferForm] = useState(emptySelfTransfer);
    const [allocationRequestForm, setAllocationRequestForm] = useState(emptyAllocationRequest);
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');

    const role = me?.role;
    const isManager = role === 'Admin' || role === 'Asset Manager';
    const isDeptHead = role === 'Department Head';
    const isEmployee = role === 'Employee';
    const canReview = isManager || isDeptHead;
    const canSelfRequest = isEmployee || isDeptHead;

    useEffect(() => {
        api.get('/auth/me')
            .then(({ data }) => setMe(data))
            .catch(() => setError('Could not load your account details.'))
            .finally(() => setLoadingMe(false));
    }, []);

    const loadData = useCallback(async () => {
        if (!role) return;
        try {
            setError('');
            const calls = [api.get('/assets', { params: { limit: 100 } })];

            if (isManager) {
                calls.push(api.get('/allocations', { params: { status: 'Active' } }));
                calls.push(api.get('/allocations/transfers', { params: { status: 'Requested' } }));
                calls.push(api.get('/allocations', { params: { status: 'Return Requested' } }));
                calls.push(api.get('/allocations/requests', { params: { status: 'Requested' } }));
            } else if (isDeptHead) {
                calls.push(api.get('/allocations', { params: { status: 'Active', mine: true } }));
                calls.push(api.get('/allocations/transfers', { params: { status: 'Requested' } })); // dept-scoped by backend
                calls.push(api.get('/allocations', { params: { status: 'Return Requested' } })); // dept-scoped by backend
                calls.push(api.get('/allocations/transfers', { params: { mine: true } }));
                calls.push(api.get('/allocations/requests', { params: { status: 'Requested' } })); // dept-scoped by backend
                calls.push(api.get('/allocations/requests', { params: { mine: true } }));
            } else {
                calls.push(api.get('/allocations', { params: { status: 'Active', mine: true } }));
                calls.push(api.get('/allocations/transfers', { params: { mine: true } }));
                calls.push(api.get('/allocations/requests', { params: { mine: true } }));
            }

            const responses = await Promise.all(calls);
            setAssets(responses[0].data.assets);

            if (isManager) {
                setMyAllocations(responses[1].data.allocations);
                setPendingTransfers(responses[2].data.transfers);
                setPendingReturns(responses[3].data.allocations);
                setPendingAllocationRequests(responses[4].data.requests);
            } else if (isDeptHead) {
                setMyAllocations(responses[1].data.allocations);
                setPendingTransfers(responses[2].data.transfers);
                setPendingReturns(responses[3].data.allocations);
                setMyTransferRequests(responses[4].data.transfers);
                setPendingAllocationRequests(responses[5].data.requests);
                setMyAllocationRequests(responses[6].data.requests);
            } else {
                setMyAllocations(responses[1].data.allocations);
                setMyTransferRequests(responses[2].data.transfers);
                setMyAllocationRequests(responses[3].data.requests);
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not reach the AssetFlow API.');
        }
    }, [role, isManager, isDeptHead]);

    useEffect(() => { loadData(); }, [loadData]);

    const showNotice = (message) => { setNotice(message); setError(''); setTimeout(() => setNotice(''), 3500); };
    const showError = (message) => setError(message);

    const assetById = useMemo(() => new Map(assets.map((asset) => [asset._id, asset])), [assets]);
    const availableAssets = assets.filter((asset) => asset.status === 'Available');

    // Assets held by someone else, i.e. candidates for "request this to me".
    const myAllocatedAssetIds = useMemo(() => new Set(myAllocations.map((allocation) => allocation.asset)), [myAllocations]);
    const requestableAssets = assets.filter((asset) => asset.status === 'Allocated' && !myAllocatedAssetIds.has(asset._id));
    const allocatedAssets = assets.filter((asset) => asset.status === 'Allocated');

    const updateAllocationForm = (event) => {
        const { name, value } = event.target;
        setAllocationForm((current) => ({ ...current, [name]: value }));
    };
    const updateManagerTransferForm = (event) => {
        const { name, value } = event.target;
        setManagerTransferForm((current) => ({ ...current, [name]: value }));
    };
    const updateSelfTransferForm = (event) => {
        const { name, value } = event.target;
        setSelfTransferForm((current) => ({ ...current, [name]: value }));
    };
    const updateAllocationRequestForm = (event) => {
        const { name, value } = event.target;
        setAllocationRequestForm((current) => ({ ...current, [name]: value }));
    };

    const allocate = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/allocations', {
                assetId: allocationForm.assetId,
                [allocationForm.recipientType]: allocationForm.recipientId,
                expectedReturnDate: allocationForm.expectedReturnDate || undefined,
            });
            setAllocationForm(emptyAllocation);
            showNotice('Allocation created.');
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Allocation failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const returnNow = async (allocationId) => {
        try {
            await api.patch(`/allocations/${allocationId}/return`, {});
            showNotice('Asset returned.');
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Return failed.');
        }
    };

    const requestReturn = async (allocationId) => {
        const checkInNotes = window.prompt('Condition check-in notes (optional):') || undefined;
        try {
            await api.post(`/allocations/${allocationId}/return-request`, { checkInNotes });
            showNotice('Return requested.');
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Return request failed.');
        }
    };

    const reviewReturn = async (allocationId, decision) => {
        try {
            await api.patch(`/allocations/${allocationId}/return-review`, { decision });
            showNotice(`Return ${decision.toLowerCase()}.`);
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Could not review return.');
        }
    };

    const submitManagerTransfer = async (event) => {
        event.preventDefault();
        try {
            await api.post('/allocations/transfers', {
                assetId: managerTransferForm.assetId,
                requestedBy: managerTransferForm.requestedBy || undefined,
                [managerTransferForm.recipientType === 'employee' ? 'toEmployee' : 'toDepartment']: managerTransferForm.recipientId,
                reason: managerTransferForm.reason,
            });
            setManagerTransferForm(emptyManagerTransfer);
            showNotice('Transfer request submitted.');
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Transfer request failed.');
        }
    };

    const submitSelfTransfer = async (event) => {
        event.preventDefault();
        try {
            // requestedBy/toEmployee are forced to the current user server-side
            // regardless of what's sent - see allocationController.createTransferRequest.
            await api.post('/allocations/transfers', {
                assetId: selfTransferForm.assetId,
                reason: selfTransferForm.reason,
            });
            setSelfTransferForm(emptySelfTransfer);
            showNotice('Transfer request submitted for approval.');
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Transfer request failed.');
        }
    };

    const reviewTransfer = async (transferId, decision) => {
        try {
            await api.patch(`/allocations/transfers/${transferId}/review`, { decision });
            showNotice(`Transfer ${decision.toLowerCase()}.`);
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Could not review transfer.');
        }
    };

    const submitAllocationRequest = async (event) => {
        event.preventDefault();
        try {
            await api.post('/allocations/requests', {
                assetId: allocationRequestForm.assetId,
                recipientType: allocationRequestForm.recipientType === 'department' ? 'department' : 'self',
                reason: allocationRequestForm.reason,
            });
            setAllocationRequestForm(emptyAllocationRequest);
            showNotice('Asset request submitted for approval.');
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Asset request failed.');
        }
    };

    const reviewAllocationRequest = async (requestId, decision) => {
        try {
            await api.patch(`/allocations/requests/${requestId}/review`, { decision });
            showNotice(`Asset request ${decision.toLowerCase()}.`);
            loadData();
        } catch (requestError) {
            showError(requestError.response?.data?.message || 'Could not review asset request.');
        }
    };

    if (loadingMe) {
        return <div className="py-16 text-center text-sm text-slate-500">Loading…</div>;
    }

    if (!role) {
        return <div className="py-16 text-center text-sm text-rose-600">{error || 'Could not determine your role.'}</div>;
    }

    const copy = ROLE_COPY[role] || ROLE_COPY.Employee;

    return (
        <div>
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{copy.eyebrow}</p>
                <h1 className="text-2xl font-bold text-slate-900">Allocation &amp; transfer</h1>
                <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
                <p className="mt-1 text-xs text-slate-400">Signed in as {role}</p>
            </div>

            {notice && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
            {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

            {/* Admin / Asset Manager: allocate assets + see everything they hold out */}
            {isManager && (
                <div className="mb-8 grid gap-6 xl:grid-cols-[380px_1fr]">
                    <Card title="Allocate an asset">
                        <form onSubmit={allocate} className="space-y-4">
                            <Field label="Available asset" required>
                                <select className={inputClass} name="assetId" value={allocationForm.assetId} onChange={updateAllocationForm} required>
                                    <option value="">Select asset</option>
                                    {availableAssets.map((asset) => (
                                        <option key={asset._id} value={asset._id}>{asset.assetTag} — {asset.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Allocate to" required>
                                <select className={inputClass} name="recipientType" value={allocationForm.recipientType} onChange={updateAllocationForm}>
                                    <option value="employee">Employee</option>
                                    <option value="department">Department</option>
                                </select>
                            </Field>
                            <Field label={`${allocationForm.recipientType === 'employee' ? 'Employee' : 'Department'} ID`} required>
                                <input className={inputClass} name="recipientId" value={allocationForm.recipientId} onChange={updateAllocationForm} placeholder={`MongoDB ${allocationForm.recipientType} ID`} required />
                            </Field>
                            <Field label="Expected return date">
                                <input className={inputClass} name="expectedReturnDate" type="date" value={allocationForm.expectedReturnDate} onChange={updateAllocationForm} />
                            </Field>
                            <button type="submit" disabled={submitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                                {submitting ? 'Allocating…' : 'Confirm allocation'}
                            </button>
                        </form>
                    </Card>

                    <ListCard title="Active allocations (all)" empty={myAllocations.length === 0 && <EmptyState title="Nothing allocated" text="Available assets can be assigned from the form." />}>
                        {myAllocations.map((allocation) => {
                            const asset = assetById.get(allocation.asset);
                            const overdue = allocation.expectedReturnDate && new Date(allocation.expectedReturnDate) < new Date();
                            return (
                                <Row key={allocation._id}>
                                    <div>
                                        <p className="font-semibold text-slate-800">{asset?.name || allocation.asset}</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Held by <span className="font-mono text-xs">{allocation.employee || allocation.department}</span>
                                            {allocation.expectedReturnDate && <> · Due {new Date(allocation.expectedReturnDate).toLocaleDateString()}</>}
                                        </p>
                                        {overdue && <p className="mt-1 text-xs font-medium text-rose-600">Overdue return</p>}
                                    </div>
                                    <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => returnNow(allocation._id)}>
                                        Return now
                                    </button>
                                </Row>
                            );
                        })}
                    </ListCard>
                </div>
            )}

            {/* Employee / Department Head: what's mine + request an asset held by someone else,
                or request an unowned (Available) asset be assigned to me / my department */}
            {canSelfRequest && (
                <div className="mb-8 grid gap-6 xl:grid-cols-[380px_1fr]">
                    <div className="space-y-6">
                        <Card title="Request an available asset">
                            <form onSubmit={submitAllocationRequest} className="space-y-4">
                                <Field label="Unowned asset" required hint="Only assets with no current holder are listed">
                                    <select className={inputClass} name="assetId" value={allocationRequestForm.assetId} onChange={updateAllocationRequestForm} required>
                                        <option value="">Select asset</option>
                                        {availableAssets.map((asset) => (
                                            <option key={asset._id} value={asset._id}>{asset.assetTag} — {asset.name}</option>
                                        ))}
                                    </select>
                                </Field>
                                {isDeptHead && (
                                    <Field label="Request for" required>
                                        <select className={inputClass} name="recipientType" value={allocationRequestForm.recipientType} onChange={updateAllocationRequestForm}>
                                            <option value="self">Myself</option>
                                            <option value="department">My department</option>
                                        </select>
                                    </Field>
                                )}
                                <Field label="Reason">
                                    <textarea className={inputClass} name="reason" value={allocationRequestForm.reason} onChange={updateAllocationRequestForm} rows="3" placeholder="Why do you need this asset?" />
                                </Field>
                                <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                    Submit for approval
                                </button>
                            </form>
                        </Card>

                        <Card title="Request a transfer to me">
                            <form onSubmit={submitSelfTransfer} className="space-y-4">
                                <Field label="Allocated asset" required hint="Only assets held by someone else are listed">
                                    <select className={inputClass} name="assetId" value={selfTransferForm.assetId} onChange={updateSelfTransferForm} required>
                                        <option value="">Select asset</option>
                                        {requestableAssets.map((asset) => (
                                            <option key={asset._id} value={asset._id}>{asset.assetTag} — {asset.name}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Reason">
                                    <textarea className={inputClass} name="reason" value={selfTransferForm.reason} onChange={updateSelfTransferForm} rows="3" placeholder="Why do you need this asset?" />
                                </Field>
                                <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                    Submit for approval
                                </button>
                            </form>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <ListCard title="My active allocations" empty={myAllocations.length === 0 && <EmptyState title="Nothing allocated to you" text="Assets given to you will show up here." />}>
                            {myAllocations.map((allocation) => {
                                const asset = assetById.get(allocation.asset);
                                return (
                                    <Row key={allocation._id}>
                                        <div>
                                            <p className="font-semibold text-slate-800">{asset?.name || allocation.asset}</p>
                                            {allocation.expectedReturnDate && (
                                                <p className="mt-1 text-sm text-slate-500">Due {new Date(allocation.expectedReturnDate).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                        <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => requestReturn(allocation._id)}>
                                            Request return
                                        </button>
                                    </Row>
                                );
                            })}
                        </ListCard>

                        <ListCard title="My asset requests" empty={myAllocationRequests.length === 0 && <EmptyState title="No requests yet" text="Unowned assets you request will show up here." />}>
                            {myAllocationRequests.map((request) => {
                                const asset = assetById.get(request.asset);
                                return (
                                    <Row key={request._id}>
                                        <div>
                                            <p className="font-semibold text-slate-800">{asset?.name || request.asset}</p>
                                            <p className="mt-1 text-sm text-slate-500">For {request.department ? 'my department' : 'myself'}</p>
                                            {request.reason && <p className="mt-1 text-sm text-slate-500">{request.reason}</p>}
                                        </div>
                                        <StatusBadge value={request.status} />
                                    </Row>
                                );
                            })}
                        </ListCard>

                        <ListCard title="My transfer requests" empty={myTransferRequests.length === 0 && <EmptyState title="No requests yet" text="Transfer requests you submit will show up here." />}>
                            {myTransferRequests.map((transfer) => {
                                const asset = assetById.get(transfer.asset);
                                return (
                                    <Row key={transfer._id}>
                                        <div>
                                            <p className="font-semibold text-slate-800">{asset?.name || transfer.asset}</p>
                                            {transfer.reason && <p className="mt-1 text-sm text-slate-500">{transfer.reason}</p>}
                                        </div>
                                        <StatusBadge value={transfer.status} />
                                    </Row>
                                );
                            })}
                        </ListCard>
                    </div>
                </div>
            )}

            {/* Asset Manager only: can also file a transfer on behalf of someone, to anyone */}
            {isManager && (
                <div className="mb-8">
                    <Card title="File a transfer on someone's behalf">
                        <form onSubmit={submitManagerTransfer} className="grid gap-4 md:grid-cols-2">
                            <Field label="Allocated asset" required>
                                <select className={inputClass} name="assetId" value={managerTransferForm.assetId} onChange={updateManagerTransferForm} required>
                                    <option value="">Select asset</option>
                                    {allocatedAssets.map((asset) => (
                                        <option key={asset._id} value={asset._id}>{asset.assetTag} — {asset.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Requester employee ID" hint="Defaults to you if left blank">
                                <input className={inputClass} name="requestedBy" value={managerTransferForm.requestedBy} onChange={updateManagerTransferForm} placeholder="MongoDB employee ID" />
                            </Field>
                            <Field label="Transfer to" required>
                                <select className={inputClass} name="recipientType" value={managerTransferForm.recipientType} onChange={updateManagerTransferForm}>
                                    <option value="employee">Employee</option>
                                    <option value="department">Department</option>
                                </select>
                            </Field>
                            <Field label={`${managerTransferForm.recipientType === 'employee' ? 'Employee' : 'Department'} ID`} required>
                                <input className={inputClass} name="recipientId" value={managerTransferForm.recipientId} onChange={updateManagerTransferForm} placeholder={`MongoDB ${managerTransferForm.recipientType} ID`} required />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Reason">
                                    <textarea className={inputClass} name="reason" value={managerTransferForm.reason} onChange={updateManagerTransferForm} rows="2" />
                                </Field>
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 md:w-auto md:px-6">
                                    Submit for approval
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Asset Manager / Admin (org-wide) and Department Head (dept-scoped) reviews */}
            {canReview && (
                <div className="grid gap-6 xl:grid-cols-2">
                    <ListCard title={isDeptHead ? 'Asset request approvals (your department)' : 'Asset request approvals'} empty={pendingAllocationRequests.length === 0 && <EmptyState title="No asset requests" text="Requests for unowned assets will appear here." />}>
                        {pendingAllocationRequests.map((request) => {
                            const asset = assetById.get(request.asset);
                            return (
                                <Row key={request._id}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{asset?.name || request.asset}</span>
                                            <StatusBadge value={request.status} />
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">
                                            For: <span className="font-mono text-xs">{request.employee || request.department}</span>
                                        </p>
                                        {request.reason && <p className="mt-1 text-xs text-slate-500">{request.reason}</p>}
                                    </div>
                                    <ReviewButtons onReject={() => reviewAllocationRequest(request._id, 'Rejected')} onApprove={() => reviewAllocationRequest(request._id, 'Approved')} />
                                </Row>
                            );
                        })}
                    </ListCard>

                    <ListCard title={isDeptHead ? 'Transfer approvals (your department)' : 'Transfer approvals'} empty={pendingTransfers.length === 0 && <EmptyState title="No transfer requests" text="Requests for currently held assets will appear here." />}>
                        {pendingTransfers.map((transfer) => {
                            const asset = assetById.get(transfer.asset);
                            return (
                                <Row key={transfer._id}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{asset?.name || transfer.asset}</span>
                                            <StatusBadge value={transfer.status} />
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">
                                            To: <span className="font-mono text-xs">{transfer.toEmployee || transfer.toDepartment}</span>
                                        </p>
                                        {transfer.reason && <p className="mt-1 text-xs text-slate-500">{transfer.reason}</p>}
                                    </div>
                                    <ReviewButtons onReject={() => reviewTransfer(transfer._id, 'Rejected')} onApprove={() => reviewTransfer(transfer._id, 'Approved')} />
                                </Row>
                            );
                        })}
                    </ListCard>

                    <ListCard title={isDeptHead ? 'Return approvals (your department)' : 'Return approvals'} empty={pendingReturns.length === 0 && <EmptyState title="No return requests" text="Condition check-in notes will be reviewed here." />}>
                        {pendingReturns.map((allocation) => {
                            const asset = assetById.get(allocation.asset);
                            return (
                                <Row key={allocation._id}>
                                    <div>
                                        <p className="font-medium text-slate-800">{asset?.name || allocation.asset}</p>
                                        <p className="mt-1 text-sm text-slate-600">{allocation.checkInNotes || 'No condition notes supplied'}</p>
                                    </div>
                                    <ReviewButtons onReject={() => reviewReturn(allocation._id, 'Rejected')} onApprove={() => reviewReturn(allocation._id, 'Approved')} approveLabel="Approve return" />
                                </Row>
                            );
                        })}
                    </ListCard>
                </div>
            )}
        </div>
    );
}
