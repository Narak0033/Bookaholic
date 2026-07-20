export default function WrappedStat({ label, value }) {
  return (
    <div className="wrapped-stat">
      <p className="wrapped-stat-value">{value}</p>
      <p className="wrapped-stat-label">{label}</p>
    </div>
  );
}