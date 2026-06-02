export function normalizePath(pathname) {
  if (!pathname) return "/";
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

export function resolveRoute(pathname, isAuthenticated, role = "teacher") {
  const path = normalizePath(pathname);
  if (path === "/") {
    if (!isAuthenticated) return { kind: "guest-landing" };
    return role === "admin" ? { kind: "admin" } : { kind: "teacher-home" };
  }
  if (path === "/login") return { kind: "login" };
  if (path === "/register") return { kind: "register" };
  if (path === "/verify") return { kind: "verify" };
  if (path === "/forgot-password") return { kind: "forgot-password" };
  if (path === "/reset-password") return { kind: "reset-password" };
  if (path === "/start") return { kind: "start" };
  if (path === "/dashboard") return { kind: "dashboard" };
  if (path === "/messages") return { kind: "messages" };
  if (path === "/notifications") return { kind: "notifications" };
  if (path === "/create") return { kind: "create" };
  if (path === "/modules") return { kind: "modules" };
  if (path === "/profile") return { kind: "profile" };
  if (path === "/settings") return { kind: "settings" };
  // Admin routes
  if (path === "/admin") return { kind: "admin" };
  if (path === "/admin/accounts") return { kind: "admin-accounts" };
  if (path === "/admin/teachers") return { kind: "admin-teachers" };
  if (path === "/admin/parents") return { kind: "admin-parents" };
  if (path === "/admin/students") return { kind: "admin-students" };
  if (path === "/admin/analytics") return { kind: "admin-analytics" };
  if (path === "/admin/items") return { kind: "admin-items" };
  if (path === "/admin/settings") return { kind: "admin-settings" };

  const routes = [
    [
      /^\/modules\/([^/]+)\/share$/,
      (match) => ({ kind: "module-share", moduleId: match[1] }),
    ],
    [
      /^\/modules\/([^/]+)\/edit$/,
      (match) => ({ kind: "module-edit", moduleId: match[1] }),
    ],
    [
      /^\/modules\/([^/]+)\/students$/,
      (match) => ({ kind: "module-students", moduleId: match[1] }),
    ],
    [
      /^\/modules\/([^/]+)$/,
      (match) => ({ kind: "module", moduleId: match[1] }),
    ],
    [
      /^\/student\/([^/]+)$/,
      (match) => ({ kind: "student", studentId: match[1] }),
    ],
    [
      /^\/students\/([^/]+)\/records$/,
      (match) => ({ kind: "student-records", studentId: match[1] }),
    ],
  ];

  for (const [regex, handler] of routes) {
    const match = path.match(regex);
    if (match) return handler(match);
  }

  return { kind: "not-found" };
}
