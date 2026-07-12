// Shared shell for every unauthenticated page (login, signup, password
// reset, OTP). Keeps branding and card chrome identical across all of them.
export default function AuthCard({ title, subtitle, children, footer }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <div className="w-full max-w-sm">
                <div className="mb-6 flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-700 text-sm font-bold text-white">
                        AF
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">AssetFlow</p>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Enterprise ERP</p>
                    </div>
                </div>

                <div className="card p-6 sm:p-7">
                    <h1 className="text-center text-lg font-semibold text-slate-900">{title}</h1>
                    {subtitle && <p className="mt-1.5 text-center text-sm text-slate-500">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>

                {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
            </div>
        </div>
    );
}
