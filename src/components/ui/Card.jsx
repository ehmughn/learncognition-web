import { forwardRef } from "react";

export const Card = forwardRef(function Card(
  { className = "", children },
  ref,
) {
  return (
    <div ref={ref} className={`panel ${className}`.trim()}>
      {children}
    </div>
  );
});

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
