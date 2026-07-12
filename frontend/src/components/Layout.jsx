import { Link, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function Layout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-blue-800 text-white p-4 flex flex-wrap justify-between items-center gap-3 shadow-md">
                <div className="text-xl font-bold tracking-wider">AssetFlow ERP</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
                    <Link to="/assets" className="hover:text-blue-300">Assets</Link>
                    <Link to="/allocations" className="hover:text-blue-300">Allocations</Link>
                    <Link to="/bookings" className="hover:text-blue-300">Bookings</Link>
                    <Link to="/maintenance" className="hover:text-blue-300">Maintenance</Link>
                    <Link to="/audit" className="hover:text-blue-300">Audit</Link>
                    <Link to="/reports" className="hover:text-blue-300">Reports</Link>
                    <Link to="/activity-logs" className="hover:text-blue-300">Activity Logs</Link>
                    <Link to="/notifications" className="hover:text-blue-300">Notifications</Link>
                    {localStorage.getItem('userRole') === 'Admin' && (
                        <Link to="/org-setup" className="hover:text-blue-300">Org Setup</Link>
                    )}
                    <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 font-bold text-sm">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-8">
                <Outlet /> {/* This is where the specific page content loads */}
            </main>
        </div>
    );
}