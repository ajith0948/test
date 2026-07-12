import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import OrgSetup from './pages/OrgSetup';
import Layout from './components/Layout';
import AssetDirectory from './pages/AssetDirectory';
import AllocationTransfer from './pages/AllocationTransfer';

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
                <Route path="/dashboard" element={
                    <div className="text-3xl font-bold text-gray-600 flex justify-center mt-20">
                        Dashboard KPIs coming in Hour 7...
                    </div>
                } />
            </Route>
        </Routes>
    );
}

export default App;