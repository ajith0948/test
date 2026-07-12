import { REPORT_TYPES } from '../../utils/constants';

const TABS = [
  { key: REPORT_TYPES.UTILIZATION, label: 'Asset Utilization' },
  { key: REPORT_TYPES.MAINTENANCE, label: 'Maintenance Activity' },
  { key: REPORT_TYPES.ALLOCATIONS, label: 'Allocation Summary' }
];

export default function ReportTabs({ activeTab, onTabChange }) {
  return (
    <div className="mb-6 flex gap-1 border-b border-slate-200" role="tablist" aria-label="Report types">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={isActive ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
