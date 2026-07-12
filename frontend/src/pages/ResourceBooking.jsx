import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';

const emptyForm = { assetId: '', startTime: '', endTime: '', purpose: '' };

const inputClass = 'field-input mt-1.5';

function Field({ label, required, children }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}{required && <span className="ml-1 text-rose-500">*</span>}
            {children}
        </label>
    );
}

export default function ResourceBooking() {
    const [me, setMe] = useState(null);
    const [assets, setAssets] = useState([]);
    const [bookings, setBookings] = useState([]);
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
            const [assetResponse, bookingResponse] = await Promise.all([
                api.get('/assets', { params: { limit: 100 } }),
                api.get('/bookings'),
            ]);
            setAssets(assetResponse.data.assets);
            setBookings(bookingResponse.data.bookings);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not reach the AssetFlow API.');
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const showNotice = (message) => { setNotice(message); setError(''); setTimeout(() => setNotice(''), 3500); };

    const bookableAssets = useMemo(() => assets.filter((asset) => asset.isShared), [assets]);

    const kpis = useMemo(() => {
        const upcoming = bookings.filter((booking) => booking.status === 'Upcoming').length;
        const ongoing = bookings.filter((booking) => booking.status === 'Ongoing').length;
        const mine = me ? bookings.filter((booking) => booking.bookedBy === me._id).length : 0;
        return { total: bookings.length, upcoming, ongoing, mine };
    }, [bookings, me]);

    const update = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post('/bookings', {
                assetId: form.assetId,
                startTime: form.startTime,
                endTime: form.endTime,
                purpose: form.purpose,
            });
            setForm(emptyForm);
            setShowForm(false);
            showNotice('Booking confirmed.');
            loadData();
        } catch (requestError) {
            if (requestError.response?.status === 409) {
                setError('Time slot overlaps with an existing booking.');
            } else {
                setError(requestError.response?.data?.message || 'Error creating booking.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        try {
            await api.patch(`/bookings/${bookingId}/cancel`);
            showNotice('Booking cancelled.');
            loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not cancel booking.');
        }
    };

    const canCancel = (booking) => {
        if (!me) return false;
        if (me.role === 'Admin' || me.role === 'Asset Manager') return true;
        return booking.bookedBy === me._id && ['Upcoming', 'Ongoing'].includes(booking.status);
    };

    const columns = [
        {
            key: 'asset',
            header: 'Resource',
            render: (booking) => (
                <div>
                    <p className="font-semibold text-slate-800">{booking.asset?.name || booking.asset}</p>
                    {booking.asset?.assetTag && <p className="mt-0.5 font-mono text-xs text-slate-400">{booking.asset.assetTag}</p>}
                </div>
            ),
        },
        { key: 'startTime', header: 'Start', render: (booking) => new Date(booking.startTime).toLocaleString() },
        { key: 'endTime', header: 'End', render: (booking) => new Date(booking.endTime).toLocaleString() },
        { key: 'purpose', header: 'Purpose', render: (booking) => booking.purpose || '—' },
        { key: 'status', header: 'Status', render: (booking) => <StatusBadge value={booking.status} /> },
        {
            key: 'actions',
            header: '',
            render: (booking) =>
                canCancel(booking) ? (
                    <button type="button" className="btn-danger !px-3 !py-1.5 !text-xs" onClick={() => cancelBooking(booking._id)}>
                        Cancel
                    </button>
                ) : null,
        },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="page-eyebrow">Shared resources</p>
                    <h1 className="page-title">Resource booking</h1>
                    <p className="page-subtitle">Reserve conference rooms, projectors, and other shared assets.</p>
                </div>
                <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
                    + Book a resource
                </button>
            </div>

            {notice && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
            {error && <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KPICard label="Total bookings" value={kpis.total} />
                <KPICard label="Upcoming" value={kpis.upcoming} />
                <KPICard label="Happening now" value={kpis.ongoing} />
                <KPICard label="My bookings" value={kpis.mine} />
            </div>

            <Table
                columns={columns}
                rows={bookings}
                emptyTitle="No bookings yet"
                emptyText="Book a shared resource to see it listed here."
            />

            {showForm && (
                <Modal title="Book a shared resource" onClose={() => setShowForm(false)}>
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Resource" required>
                            <select className={inputClass} name="assetId" value={form.assetId} onChange={update} required disabled={!bookableAssets.length}>
                                <option value="">{bookableAssets.length ? 'Select a resource' : 'No shared/bookable assets yet'}</option>
                                {bookableAssets.map((asset) => (
                                    <option key={asset._id} value={asset._id}>{asset.assetTag} — {asset.name}</option>
                                ))}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Start time" required>
                                <input className={inputClass} type="datetime-local" name="startTime" value={form.startTime} onChange={update} required />
                            </Field>
                            <Field label="End time" required>
                                <input className={inputClass} type="datetime-local" name="endTime" value={form.endTime} onChange={update} required />
                            </Field>
                        </div>
                        <Field label="Purpose">
                            <textarea className={inputClass} name="purpose" value={form.purpose} onChange={update} rows="3" placeholder="What's this booking for?" />
                        </Field>
                        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="btn-primary">
                                {submitting ? 'Booking…' : 'Confirm booking'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
