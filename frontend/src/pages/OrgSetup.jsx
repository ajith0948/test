import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function OrgSetup() {
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);

    // Fetch data when component mounts
    useEffect(() => {
        fetchDepartments();
        fetchCategories();
    }, []);

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
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b bg-gray-50 flex">
                <button
                    onClick={() => setActiveTab('departments')}
                    className={`px-6 py-4 font-semibold ${activeTab === 'departments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    Departments
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-4 font-semibold ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    Asset Categories
                </button>
                <button
                    onClick={() => setActiveTab('employees')}
                    className={`px-6 py-4 font-semibold ${activeTab === 'employees' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    Employee Directory
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'departments' && <DepartmentTab departments={departments} refresh={fetchDepartments} />}
                {activeTab === 'categories' && <CategoryTab categories={categories} refresh={fetchCategories} />}
                {activeTab === 'employees' && <EmployeeTab departments={departments} />}
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-gray-50 p-4 rounded border">
                <h3 className="font-bold mb-4 text-lg">Add Department</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Department Name</label>
                        <input {...register('name', { required: true })} className="w-full p-2 border rounded" placeholder="e.g. IT Support" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select {...register('status')} className="w-full p-2 border rounded">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Create</button>
                </form>
            </div>

            <div className="md:col-span-2">
                <h3 className="font-bold mb-4 text-lg">Active Departments</h3>
                <div className="overflow-x-auto border rounded">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.length === 0 ? (
                                <tr><td colSpan="2" className="p-4 text-center text-gray-500">No departments found.</td></tr>
                            ) : (
                                departments.map(dept => (
                                    <tr key={dept._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{dept.name}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${dept.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {dept.isActive ? 'Active' : 'Inactive'}
                                            </span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-gray-50 p-4 rounded border">
                <h3 className="font-bold mb-4 text-lg">Add Category</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category Name</label>
                        <input {...register('name', { required: true })} className="w-full p-2 border rounded" placeholder="e.g. Laptops" />
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium mb-1">Custom Fields</label>
                        <p className="text-xs text-gray-500 mb-2">
                            Extra fields to capture for assets in this category (e.g. RAM, Warranty Active).
                        </p>

                        {fieldDrafts.length > 0 && (
                            <ul className="mb-3 space-y-1">
                                {fieldDrafts.map((field) => (
                                    <li key={field.key} className="flex items-center justify-between rounded bg-white border px-2 py-1 text-sm">
                                        <span>
                                            {field.key} <span className="text-gray-400">({FIELD_TYPES.find((type) => type.value === field.valueType)?.label})</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFieldDraft(field.key)}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold"
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
                                className="flex-1 p-2 border rounded text-sm"
                                placeholder="Field name, e.g. RAM"
                            />
                            <select
                                value={fieldType}
                                onChange={(event) => setFieldType(event.target.value)}
                                className="p-2 border rounded text-sm bg-white"
                            >
                                {FIELD_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={addFieldDraft}
                            className="mt-2 w-full border border-blue-600 text-blue-600 font-semibold py-1.5 rounded hover:bg-blue-50 text-sm"
                        >
                            + Add field
                        </button>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Create</button>
                </form>
            </div>

            <div className="md:col-span-2">
                <h3 className="font-bold mb-4 text-lg">Asset Categories</h3>
                <div className="grid grid-cols-2 gap-4">
                    {categories.length === 0 ? (
                        <div className="col-span-2 p-4 text-center text-gray-500 border rounded">No categories found.</div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat._id} className="border p-4 rounded shadow-sm bg-white hover:border-blue-400">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-700">{cat.name}</span>
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
                                        {cat.customFields?.length || 0} Field{cat.customFields?.length === 1 ? '' : 's'}
                                    </span>
                                </div>
                                {cat.customFields?.length > 0 && (
                                    <ul className="mt-2 space-y-0.5">
                                        {cat.customFields.map((field) => (
                                            <li key={field.key} className="text-xs text-gray-500">
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
            <h3 className="font-bold mb-4 text-lg">Employee Directory</h3>
            <div className="overflow-x-auto border rounded shadow-sm">
                <table className="w-full text-left bg-white">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{user.name}</td>
                                <td className="p-3 text-sm text-gray-600">{user.email}</td>
                                <td className="p-3">
                                    <select
                                        className="p-1 border rounded text-sm bg-gray-50"
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
                                <td className="p-3">
                                    <select
                                        className="p-1 border rounded text-sm bg-gray-50"
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