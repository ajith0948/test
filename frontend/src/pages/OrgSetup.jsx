import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import StatusBadge from '../components/common/StatusBadge';

const TABS = [
    { key: 'departments', label: 'Departments' },
    { key: 'categories', label: 'Asset Categories' },
    { key: 'employees', label: 'Employee Directory' },
];

export default function OrgSetup() {
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);

    // Every write here (and the Employee Directory read) is Admin-only on the
    // backend, so a non-Admin landing on this URL directly would otherwise see
    // a page full of silently-failing forms. The nav link is already hidden
    // for non-Admins (see Layout.jsx) - this covers direct navigation too.
    const isAdmin = localStorage.getItem('userRole') === 'Admin';

    // Fetch data when component mounts
    useEffect(() => {
        if (!isAdmin) return;
        fetchDepartments();
        fetchCategories();
    }, []);

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data.departments || []);
        } catch (error) {
            console.error('Error fetching departments', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <p className="page-eyebrow">Administration</p>
                <h1 className="page-title">Organization setup</h1>
                <p className="page-subtitle">Manage departments, asset categories, and employee access.</p>
            </div>

            <div className="mb-6 flex gap-1 border-b border-slate-200">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={activeTab === tab.key ? 'tab-btn-active' : 'tab-btn-inactive'}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'departments' && <DepartmentTab departments={departments} refresh={fetchDepartments} />}
            {activeTab === 'categories' && <CategoryTab categories={categories} refresh={fetchCategories} />}
            {activeTab === 'employees' && <EmployeeTab departments={departments} />}
        </div>
    );
}

// --- SUB-COMPONENTS FOR TABS ---

function DepartmentTab({ departments, refresh }) {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            await api.post('/departments', data);
            toast.success('Department created!');
            reset();
            refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create department');
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card p-5 md:col-span-1">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Add department</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="field-label">Department name</label>
                        <input {...register('name', { required: true })} className="field-input" placeholder="e.g. IT Support" />
                    </div>
                    <div>
                        <label className="field-label">Status</label>
                        <select {...register('status')} className="field-input">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary w-full">Create</button>
                </form>
            </div>

            <div className="md:col-span-2">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Active departments</h3>
                <div className="card overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departments.length === 0 ? (
                                <tr><td colSpan="2" className="px-4 py-8 text-center text-sm text-slate-500">No departments found.</td></tr>
                            ) : (
                                departments.map(dept => (
                                    <tr key={dept._id} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3 font-medium text-slate-800">{dept.name}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge value={dept.isActive ? 'Active' : 'Inactive'} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const FIELD_TYPES = [
    { value: 'string', label: 'Text' },
    { value: 'int', label: 'Number' },
    { value: 'flag', label: 'Yes/No' },
];

function CategoryTab({ categories, refresh }) {
    const { register, handleSubmit, reset } = useForm();
    // Custom field definitions being built up for the category about to be created.
    const [fieldDrafts, setFieldDrafts] = useState([]);
    const [fieldName, setFieldName] = useState('');
    const [fieldType, setFieldType] = useState('string');

    const addFieldDraft = () => {
        const key = fieldName.trim();
        if (!key) return;
        if (fieldDrafts.some((field) => field.key.toLowerCase() === key.toLowerCase())) {
            toast.error('That field name is already added.');
            return;
        }
        setFieldDrafts((current) => [...current, { key, valueType: fieldType }]);
        setFieldName('');
        setFieldType('string');
    };

    const removeFieldDraft = (key) => {
        setFieldDrafts((current) => current.filter((field) => field.key !== key));
    };

    const onSubmit = async (data) => {
        try {
            await api.post('/categories', { name: data.name, customFields: fieldDrafts });
            toast.success('Category created!');
            reset();
            setFieldDrafts([]);
            refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card p-5 md:col-span-1">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Add category</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="field-label">Category name</label>
                        <input {...register('name', { required: true })} className="field-input" placeholder="e.g. Laptops" />
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <label className="field-label">Custom fields</label>
                        <p className="mb-2 text-xs text-slate-500">
                            Extra fields to capture for assets in this category (e.g. RAM, Warranty Active).
                        </p>

                        {fieldDrafts.length > 0 && (
                            <ul className="mb-3 space-y-1">
                                {fieldDrafts.map((field) => (
                                    <li key={field.key} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm">
                                        <span className="text-slate-700">
                                            {field.key} <span className="text-slate-400">({FIELD_TYPES.find((type) => type.value === field.valueType)?.label})</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFieldDraft(field.key)}
                                            className="text-xs font-medium text-rose-600 hover:text-rose-700"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex gap-2">
                            <input
                                value={fieldName}
                                onChange={(event) => setFieldName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') { event.preventDefault(); addFieldDraft(); }
                                }}
                                className="field-input flex-1"
                                placeholder="Field name, e.g. RAM"
                            />
                            <select
                                value={fieldType}
                                onChange={(event) => setFieldType(event.target.value)}
                                className="field-input !w-auto"
                            >
                                {FIELD_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={addFieldDraft} className="btn-secondary mt-2 w-full !text-brand-700">
                            + Add field
                        </button>
                    </div>

                    <button type="submit" className="btn-primary w-full">Create</button>
                </form>
            </div>

            <div className="md:col-span-2">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Asset categories</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {categories.length === 0 ? (
                        <div className="card col-span-2 p-8 text-center text-sm text-slate-500">No categories found.</div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat._id} className="card p-4 transition-colors hover:border-brand-300">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800">{cat.name}</span>
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                        {cat.customFields?.length || 0} field{cat.customFields?.length === 1 ? '' : 's'}
                                    </span>
                                </div>
                                {cat.customFields?.length > 0 && (
                                    <ul className="mt-2 space-y-0.5">
                                        {cat.customFields.map((field) => (
                                            <li key={field.key} className="text-xs text-slate-500">
                                                {field.key} · {FIELD_TYPES.find((type) => type.value === field.valueType)?.label || field.valueType}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function EmployeeTab({ departments }) {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/employees');
            setUsers(res.data.employees || []);
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    // Load users when tab opens
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/employees/${userId}`, { role: newRole });
            toast.success('Role updated!');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleDeptChange = async (userId, deptId) => {
        try {
            await api.put(`/employees/${userId}`, { department: deptId });
            toast.success('Department updated!');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update department');
        }
    };

    return (
        <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Employee directory</h3>
            <div className="card overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                                <td className="px-4 py-3 text-slate-500">{user.email}</td>
                                <td className="px-4 py-3">
                                    <select
                                        className="field-input !w-auto py-1.5"
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    >
                                        <option value="Employee">Employee</option>
                                        <option value="Department Head">Dept Head</option>
                                        <option value="Asset Manager">Asset Manager</option>
                                        <option value="Admin">Admin</option>
                                        <option value="None">None</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="field-input !w-auto py-1.5"
                                        value={user.department?._id || ''}
                                        onChange={(e) => handleDeptChange(user._id, e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
