import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function AssetInventory() {
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { register, handleSubmit, reset } = useForm();

    // Fetch all master data on load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assetRes, catRes, deptRes, userRes] = await Promise.all([
                api.get('/assets'),
                api.get('/categories'),
                api.get('/departments'),
                api.get('/users')
            ]);
            setAssets(assetRes.data);
            setCategories(catRes.data);
            setDepartments(deptRes.data);
            setUsers(userRes.data);
        } catch (error) {
            toast.error('Failed to load asset data');
        }
    };

    const onSubmit = async (data) => {
        try {
            // Clean up empty dropdown values so they send as null
            if (!data.assignedTo) delete data.assignedTo;
            if (!data.department) delete data.department;

            await api.post('/assets', data);
            toast.success('Asset added successfully!');
            reset();
            setIsFormOpen(false);
            fetchData(); // Refresh table
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add asset');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Area */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Asset Inventory</h1>
                    <p className="text-gray-500 text-sm">Manage hardware, software, and furniture</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold"
                >
                    {isFormOpen ? 'Cancel' : '+ Add New Asset'}
                </button>
            </div>

            {/* Add Asset Form (Toggles Open/Closed) */}
            {isFormOpen && (
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
                    <h2 className="text-lg font-bold mb-4">Register New Asset</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>
                            <label className="block text-sm font-medium mb-1">Asset Name</label>
                            <input {...register('name', { required: true })} className="w-full p-2 border rounded" placeholder="MacBook Pro 16" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Serial Number</label>
                            <input {...register('serialNumber', { required: true })} className="w-full p-2 border rounded" placeholder="SN-12345678" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select {...register('category', { required: true })} className="w-full p-2 border rounded bg-gray-50">
                                <option value="">Select Category...</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select {...register('status')} className="w-full p-2 border rounded bg-gray-50">
                                <option value="Available">Available</option>
                                <option value="Issued">Issued</option>
                                <option value="In Maintenance">In Maintenance</option>
                                <option value="Retired">Retired</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Assign to Department</label>
                            <select {...register('department')} className="w-full p-2 border rounded bg-gray-50">
                                <option value="">None</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Assign to User</label>
                            <select {...register('assignedTo')} className="w-full p-2 border rounded bg-gray-50">
                                <option value="">None</option>
                                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-3 mt-4">
                            <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700">
                                Save Asset
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Asset Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">Asset Name</th>
                            <th className="p-4 font-semibold text-gray-700">Serial #</th>
                            <th className="p-4 font-semibold text-gray-700">Category</th>
                            <th className="p-4 font-semibold text-gray-700">Status</th>
                            <th className="p-4 font-semibold text-gray-700">Assigned To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No assets registered yet. Click "Add New Asset" to begin.</td></tr>
                        ) : (
                            assets.map(asset => (
                                <tr key={asset._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{asset.name}</td>
                                    <td className="p-4 text-sm text-gray-600 font-mono">{asset.serialNumber}</td>
                                    <td className="p-4 text-sm">{asset.category?.name || 'N/A'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                            ${asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                asset.status === 'Issued' ? 'bg-blue-100 text-blue-700' :
                                                    asset.status === 'In Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {asset.assignedTo ? (
                                            <span className="font-medium text-blue-700">{asset.assignedTo.name}</span>
                                        ) : asset.department ? (
                                            <span className="text-gray-600">Dept: {asset.department.name}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}