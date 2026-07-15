import './StatusTabs.css';

const TABS = [
  { key: 'reading', label: 'reading' },
  { key: 'want_to_read', label: 'want to read' },
  { key: 'finished', label: 'finished' },
];

export default function StatusTabs({ active, onChange }) {
  return (
    <div className="status-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`status-tab${active === tab.key ? ' status-tab-active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}