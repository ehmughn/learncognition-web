export function PrimaryButton({ className = "", children, ...props }) {
  return (
    <button className={`button button-primary ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ className = "", children, ...props }) {
  return (
    <button
      className={`button button-secondary ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
