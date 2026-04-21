import { useApp } from "../../context/AppContext.jsx";

export function AppLink({
  to,
  className = "",
  replace = false,
  children,
  onClick,
  ...props
}) {
  const { navigate } = useApp();
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (onClick) onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigate(to, { replace });
      }}
      {...props}
    >
      {children}
    </a>
  );
}
