import { REPORT_TYPES } from '../../utils/constants';

const TABS = [
  { key: REPORT_TYPES.UTILIZATION, label: 'Asset Utilization' },
  { key: REPORT_TYPES.MAINTENANCE, label: 'Maintenance Activity' },
  { key: REPORT_TYPES.ALLOCATIONS, label: 'Allocation Summary' }
];

export default function ReportTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex space-x-2 mb-8 bg-slate-100 p-1 rounded-xl inline-flex" role="tablist" aria-label="Report types">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all focus:outline-none ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
