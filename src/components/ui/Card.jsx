export function Card({ className = "", children }) {
  return <div className={`panel ${className}`.trim()}>{children}</div>;
}

export function StatusPill({ tone = "neutral", children }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
    </label>
  );
}
