import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import OrgSetup from './pages/OrgSetup';
import Layout from './components/Layout';
import AssetDirectory from './pages/AssetDirectory';
import AllocationTransfer from './pages/AllocationTransfer';
import ResourceBooking from './pages/ResourceBooking';
import Maintenance from './pages/Maintenance';
import Dashboard from './pages/Dashboard';
import AssetAudit from './pages/AssetAudit';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';
import Notifications from './pages/Notifications';

function App() {
    return (
        <Routes>
            {/* Public Auth Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Protected ERP Routes wrapped in Layout */}
            <Route element={<Layout />}>
                <Route path="/org-setup" element={<OrgSetup />} />
                {/* Note: AssetInventory.jsx (the old /assets page) predates the
                    merged Allocation-based asset model (no more `assignedTo` /
                    "Issued" status) and is no longer wired up here - replaced
                    by AssetDirectory, which matches the current backend contract. */}
                <Route path="/assets" element={<AssetDirectory />} />
                <Route path="/allocations" element={<AllocationTransfer />} />
                <Route path="/bookings" element={<ResourceBooking />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/audit" element={<AssetAudit />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/activity-logs" element={<ActivityLogs />} />
                <Route path="/notifications" element={<Notifications />} />
            </Route>
        </Routes>
    );
}

export default App;