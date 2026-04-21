export function MetricStrip({ items }) {
  return (
    <div className="metric-strip">
      {items.map((item) => (
        <div className="metric-card" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
