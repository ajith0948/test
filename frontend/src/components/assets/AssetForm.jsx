import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';

const initialForm = {
    name: '',
    category: '',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: 'Good',
    location: '',
    department: '',
    isShared: false,
};

const inputClass =
    'mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

function Field({ label, hint, required, children }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
            {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
            <div>{children}</div>
        </label>
    );
}

// Registers a new asset. Loads categories/departments for the pickers and
// uploads up to 3 attachments (images/pdf/doc/docx) via multipart form-data.
export default function AssetForm({ onCreated, onCancel }) {
    const [form, setForm] = useState(initialForm);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [masterDataError, setMasterDataError] = useState('');
    // Values for the selected category's custom fields, keyed by field name.
    const [customFieldValues, setCustomFieldValues] = useState({});

    const selectedCategory = categories.find((category) => category._id === form.category);
    const categoryFields = selectedCategory?.customFields || [];

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [departmentResponse, categoryResponse] = await Promise.all([
                    api.get('/departments'),
                    api.get('/categories'),
                ]);
                setDepartments(departmentResponse.data.departments || []);
                setCategories(categoryResponse.data.categories || []);
            } catch {
                setMasterDataError('Categories and departments could not be loaded. Ask the admin to create them first.');
            }
        };
        loadMasterData();
    }, []);

    const update = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
        // Custom fields belong to a category - drop any values that were
        // entered for the previously selected category's fields.
        if (name === 'category') setCustomFieldValues({});
    };

    const updateCustomField = (key, valueType) => (event) => {
        const raw = valueType === 'flag' ? event.target.checked : event.target.value;
        setCustomFieldValues((current) => ({ ...current, [key]: raw }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => payload.append(key, value));
            if (categoryFields.length > 0) {
                payload.append('customFields', JSON.stringify(customFieldValues));
            }
            files.forEach((file) => payload.append('attachments', file));
            const { data } = await api.post('/assets', payload);
            onCreated(data.asset);
            setForm(initialForm);
            setCustomFieldValues({});
            setFiles([]);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to register the asset.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Asset name" required>
                    <input className={inputClass} name="name" value={form.name} onChange={update} placeholder="e.g. Dell Latitude 5440" required />
                </Field>
                <Field label="Category" required>
                    <select className={inputClass} name="category" value={form.category} onChange={update} required disabled={!categories.length}>
                        <option value="">{categories.length ? 'Select a category' : 'No active categories'}</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Serial number">
                    <input className={inputClass} name="serialNumber" value={form.serialNumber} onChange={update} placeholder="Serial / chassis number" />
                </Field>
                <Field label="Location" required>
                    <input className={inputClass} name="location" value={form.location} onChange={update} placeholder="e.g. Bengaluru - Floor 2" required />
                </Field>
                <Field label="Acquisition date">
                    <input className={inputClass} name="acquisitionDate" type="date" value={form.acquisitionDate} onChange={update} />
                </Field>
                <Field label="Acquisition cost">
                    <input className={inputClass} name="acquisitionCost" type="number" min="0" value={form.acquisitionCost} onChange={update} placeholder="0.00" />
                </Field>
                <Field label="Condition">
                    <select className={inputClass} name="condition" value={form.condition} onChange={update}>
                        {['Excellent', 'Good', 'Fair', 'Poor'].map((condition) => <option key={condition}>{condition}</option>)}
                    </select>
                </Field>
                <Field label="Department" hint="Optional owner department">
                    <select className={inputClass} name="department" value={form.department} onChange={update} disabled={!departments.length}>
                        <option value="">{departments.length ? 'No department' : 'No active departments'}</option>
                        {departments.map((department) => (
                            <option key={department._id} value={department._id}>{department.name}</option>
                        ))}
                    </select>
                </Field>
            </div>

            {categoryFields.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">{selectedCategory.name} details</p>
                    <div className="grid gap-4 md:grid-cols-2">
                        {categoryFields.map((field) => (
                            <Field key={field.key} label={field.key}>
                                {field.valueType === 'flag' ? (
                                    <span className="mt-1.5 flex items-center gap-2 text-sm font-normal text-slate-700">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 accent-indigo-600"
                                            checked={Boolean(customFieldValues[field.key])}
                                            onChange={updateCustomField(field.key, 'flag')}
                                        />
                                        Yes
                                    </span>
                                ) : (
                                    <input
                                        className={inputClass}
                                        type={field.valueType === 'int' ? 'number' : 'text'}
                                        value={customFieldValues[field.key] ?? ''}
                                        onChange={updateCustomField(field.key, field.valueType)}
                                    />
                                )}
                            </Field>
                        ))}
                    </div>
                </div>
            )}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input className="h-4 w-4 accent-indigo-600" type="checkbox" name="isShared" checked={form.isShared} onChange={update} />
                Make this asset a shared, bookable resource
            </label>

            <label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50/50">
                <span className="font-medium text-slate-700">Add photos or documents</span><br />
                Up to 3 files, 10 MB each
                <input
                    className="sr-only"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(event) => setFiles(Array.from(event.target.files).slice(0, 3))}
                />
            </label>
            {files.length > 0 && <p className="text-xs text-slate-500">{files.map((file) => file.name).join(', ')}</p>}
            {masterDataError && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{masterDataError}</p>}
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {submitting ? 'Registering…' : 'Register asset'}
                </button>
            </div>
        </form>
    );
}
