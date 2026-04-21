export function normalizePath(pathname) {
  if (!pathname) return "/";
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

export function resolveRoute(pathname, isAuthenticated) {
  const path = normalizePath(pathname);
  if (path === "/")
    return isAuthenticated
      ? { kind: "teacher-home" }
      : { kind: "guest-landing" };
  if (path === "/login") return { kind: "login" };
  if (path === "/register") return { kind: "register" };
  if (path === "/verify") return { kind: "verify" };
  if (path === "/forgot-password") return { kind: "forgot-password" };
  if (path === "/reset-password") return { kind: "reset-password" };
  if (path === "/start") return { kind: "start" };
  if (path === "/dashboard") return { kind: "dashboard" };
  if (path === "/create") return { kind: "create" };
  if (path === "/modules") return { kind: "modules" };
  if (path === "/profile") return { kind: "profile" };
  if (path === "/settings") return { kind: "settings" };

  const routes = [
    [/^\/modules\/(\d+)$/, (match) => ({ kind: "module", moduleId: match[1] })],
    [
      /^\/modules\/(\d+)\/share$/,
      (match) => ({ kind: "module-share", moduleId: match[1] }),
    ],
    [
      /^\/modules\/(\d+)\/edit$/,
      (match) => ({ kind: "module-edit", moduleId: match[1] }),
    ],
    [
      /^\/modules\/(\d+)\/students$/,
      (match) => ({ kind: "module-students", moduleId: match[1] }),
    ],
    [
      /^\/student\/(\d+)$/,
      (match) => ({ kind: "student", studentId: match[1] }),
    ],
    [
      /^\/students\/(\d+)\/records$/,
      (match) => ({ kind: "student-records", studentId: match[1] }),
    ],
  ];

  for (const [regex, handler] of routes) {
    const match = path.match(regex);
    if (match) return handler(match);
  }

  return { kind: "not-found" };
}
