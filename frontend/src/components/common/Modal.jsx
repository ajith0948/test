export default function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                    <button
                        type="button"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
