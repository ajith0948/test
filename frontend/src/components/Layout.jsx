import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

// Small inline icon set (stroke-based, 20x20) so the sidebar doesn't need an
// icon library dependency. Kept intentionally plain - no fills, no duotone.
const icons = {
    dashboard: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l6-6 3.75 3.75 6.75-6.75M3.75 6h3.75v3.75M20.25 10.5V6.75H16.5" />
    ),
    assets: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25-4.5L3.75 7.5m16.5 0l-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9M3.75 7.5v9l8.25 4.5" />
    ),
    allocations: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9V6a3 3 0 00-3-3h-1.5a3 3 0 00-3 3v3m10.5 3l-3-3m0 0l-3 3m3-3v12M3 12l3-3m0 0l3 3m-3-3v12" />
    ),
    bookings: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6.75A.75.75 0 014.5 6z" />
    ),
    maintenance: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.187 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.02.017" />
    ),
    audit: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    reports: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    ),
    logs: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    notifications: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    ),
    orgSetup: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" />
    ),
    logout: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    ),
    menu: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    ),
    close: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    ),
};

function Icon({ name, className = 'h-5 w-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className}>
            {icons[name]}
        </svg>
    );
}

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }],
    },
    {
        label: 'Asset Management',
        items: [
            { to: '/assets', label: 'Asset Directory', icon: 'assets' },
            { to: '/allocations', label: 'Allocations', icon: 'allocations' },
            { to: '/bookings', label: 'Bookings', icon: 'bookings' },
            { to: '/maintenance', label: 'Maintenance', icon: 'maintenance' },
            { to: '/audit', label: 'Audit', icon: 'audit' },
        ],
    },
    {
        label: 'Insights',
        items: [
            { to: '/reports', label: 'Reports', icon: 'reports' },
            { to: '/activity-logs', label: 'Activity Logs', icon: 'logs' },
            { to: '/notifications', label: 'Notifications', icon: 'notifications' },
        ],
    },
];

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/assets': 'Asset Directory',
    '/allocations': 'Allocation & Transfer',
    '/bookings': 'Resource Booking',
    '/maintenance': 'Maintenance Management',
    '/audit': 'Asset Audit',
    '/reports': 'Reports & Analytics',
    '/activity-logs': 'Activity Logs',
    '/notifications': 'Notifications',
    '/org-setup': 'Organization Setup',
};

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            isActive
                ? 'bg-brand-800/60 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`;

    const sidebarContent = (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2.5 px-5 py-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
                    AF
                </div>
                <div>
                    <p className="text-sm font-semibold leading-none text-white">AssetFlow</p>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">Enterprise ERP</p>
                </div>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label}>
                        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {section.label}
                        </p>
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                                    <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}

                {role === 'Admin' && (
                    <div>
                        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Administration
                        </p>
                        <NavLink to="/org-setup" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                            <Icon name="orgSetup" className="h-[18px] w-[18px] shrink-0" />
                            Org Setup
                        </NavLink>
                    </div>
                )}
            </nav>

            <div className="border-t border-slate-800 p-3">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                    <Icon name="logout" className="h-[18px] w-[18px]" />
                    Log out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop sidebar */}
            <aside className="hidden w-60 shrink-0 bg-slate-900 lg:block">
                {sidebarContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileNavOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileNavOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900">{sidebarContent}</aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                            onClick={() => setMobileNavOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Icon name="menu" />
                        </button>
                        <span className="text-sm font-medium text-slate-700">
                            {PAGE_TITLES[location.pathname] || 'AssetFlow'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {role || 'Employee'}
                        </span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
