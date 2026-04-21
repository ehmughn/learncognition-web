export const modulesSeed = [
  {
    id: "1",
    name: "Neighborhood Explorer",
    description:
      "Students scan real-world objects, compare labels, and earn a summary score that teachers can review in seconds.",
    type: "identify",
    code: "4821936507",
    stats: {
      items: 3,
      scanned: 82,
      taken: 26,
      averageScore: 86,
      passingRate: 91,
    },
    items: [
      { id: "a", label: "Bottle", description: "Plastic bottle on the desk." },
      {
        id: "b",
        label: "Chair",
        description: "Find a chair with a straight back.",
      },
      { id: "c", label: "Notebook", description: "Choose the class notebook." },
    ],
    students: ["1", "2", "3", "4"],
  },
  {
    id: "2",
    name: "Classroom Search Sprint",
    description:
      "A timed search activity where students locate common classroom items in sequence and submit evidence from the camera feed.",
    type: "search",
    code: "9315072468",
    stats: {
      items: 4,
      scanned: 65,
      taken: 18,
      averageScore: 81,
      passingRate: 88,
    },
    items: [
      { id: "a", label: "Eraser", description: "Small white eraser." },
      { id: "b", label: "Marker", description: "Dry erase marker." },
      { id: "c", label: "Ruler", description: "Thirty-centimeter ruler." },
      { id: "d", label: "Scissors", description: "Safety classroom scissors." },
    ],
    students: ["1", "3", "4"],
  },
  {
    id: "3",
    name: "AR Object Match",
    description:
      "A guided identify module using object matching, in-app feedback, and detailed progress reporting for teachers.",
    type: "identify",
    code: "2048571936",
    stats: {
      items: 3,
      scanned: 91,
      taken: 32,
      averageScore: 90,
      passingRate: 95,
    },
    items: [
      {
        id: "a",
        label: "Apple",
        description: "Round red object with glossy surface.",
      },
      {
        id: "b",
        label: "Book",
        description: "Thick hard-cover reading material.",
      },
      { id: "c", label: "Lamp", description: "Table lamp with a cone shade." },
    ],
    students: ["2", "3", "4"],
  },
];

export const studentsSeed = [
  {
    id: "1",
    name: "Maya Torres",
    description:
      "Focused learner who likes fast feedback, visual cues, and short challenge loops.",
    joinedAt: "2026-04-18T09:14:00Z",
    score: 94,
    modulesTaken: [
      "Neighborhood Explorer",
      "Classroom Search Sprint",
      "AR Object Match",
    ],
    records: [
      {
        module: "Neighborhood Explorer",
        score: 94,
        objects: 3,
        duration: "07:24",
        date: "2026-04-18",
      },
      {
        module: "Classroom Search Sprint",
        score: 90,
        objects: 4,
        duration: "06:12",
        date: "2026-04-15",
      },
      {
        module: "AR Object Match",
        score: 96,
        objects: 3,
        duration: "05:47",
        date: "2026-04-10",
      },
    ],
  },
  {
    id: "2",
    name: "Ethan Cruz",
    description:
      "Consistent student with a strong completion rate and steady performance on identify tasks.",
    joinedAt: "2026-04-17T11:30:00Z",
    score: 88,
    modulesTaken: [
      "AR Object Match",
      "Neighborhood Explorer",
      "Classroom Search Sprint",
    ],
    records: [
      {
        module: "AR Object Match",
        score: 88,
        objects: 3,
        duration: "06:01",
        date: "2026-04-16",
      },
      {
        module: "Neighborhood Explorer",
        score: 84,
        objects: 3,
        duration: "07:33",
        date: "2026-04-13",
      },
      {
        module: "Classroom Search Sprint",
        score: 91,
        objects: 4,
        duration: "06:45",
        date: "2026-04-09",
      },
    ],
  },
  {
    id: "3",
    name: "Sofia Reyes",
    description:
      "Visual learner who improves when modules are shared with reminders and short deadlines.",
    joinedAt: "2026-04-16T13:48:00Z",
    score: null,
    modulesTaken: [
      "Classroom Search Sprint",
      "AR Object Match",
      "Neighborhood Explorer",
    ],
    records: [
      {
        module: "Classroom Search Sprint",
        score: 82,
        objects: 4,
        duration: "07:12",
        date: "2026-04-14",
      },
      {
        module: "AR Object Match",
        score: 0,
        objects: 0,
        duration: "Not yet taken",
        date: "Pending",
      },
      {
        module: "Neighborhood Explorer",
        score: 89,
        objects: 3,
        duration: "06:38",
        date: "2026-04-07",
      },
    ],
  },
  {
    id: "4",
    name: "Noah Patel",
    description:
      "Fast responder with high activity engagement and responsive sharing notifications.",
    joinedAt: "2026-04-12T08:52:00Z",
    score: 79,
    modulesTaken: [
      "Neighborhood Explorer",
      "Classroom Search Sprint",
      "AR Object Match",
    ],
    records: [
      {
        module: "Neighborhood Explorer",
        score: 79,
        objects: 3,
        duration: "08:15",
        date: "2026-04-12",
      },
      {
        module: "Classroom Search Sprint",
        score: 83,
        objects: 4,
        duration: "07:04",
        date: "2026-04-08",
      },
      {
        module: "AR Object Match",
        score: 87,
        objects: 3,
        duration: "06:29",
        date: "2026-04-04",
      },
    ],
  },
];

export const notificationsSeed = [
  {
    id: "n1",
    title: "Module shared",
    message: "Neighborhood Explorer was sent to Maya and Ethan.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    title: "New score received",
    message: "Sofia completed Classroom Search Sprint with 82%.",
    time: "18 min ago",
    read: false,
  },
  {
    id: "n3",
    title: "Teacher review complete",
    message: "AR Object Match passed the review queue.",
    time: "Today",
    read: true,
  },
];

export const teacherNav = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/create", label: "Create" },
  { path: "/modules", label: "Modules" },
  { path: "/profile", label: "Profile" },
  { path: "/settings", label: "Settings" },
];

export const guestHighlights = [
  "Built for teachers who need a clear dashboard, faster module setup, and simpler student sharing.",
  "Supports both teacher and admin authentication with verification flows for account safety.",
  "Mobile-inspired layout that feels immediate on phones, tablets, and desktop screens.",
];

export const landingMetrics = [
  { value: "3 min", label: "to launch a module" },
  { value: "10-digit", label: "share code for students" },
  { value: "Live", label: "progress summaries" },
  { value: "AR + Search", label: "activity modes" },
];

export const chartBars = [62, 74, 69, 81, 88, 77];
export const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const onboardingPaths = [
  "/",
  "/dashboard",
  "/create",
  "/modules",
  "/profile",
  "/settings",
  "/",
];

export function normalizePath(pathname) {
  if (!pathname) return "/";
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

export function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function makeCode(length = 10) {
  const digits = "0123456789";
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += digits[Math.floor(Math.random() * digits.length)];
  }
  return result;
}

export function findModule(moduleId) {
  return modulesSeed.find((item) => item.id === moduleId) ?? modulesSeed[0];
}

export function findStudent(studentId) {
  return studentsSeed.find((item) => item.id === studentId) ?? studentsSeed[0];
}

export function getModuleView(moduleId, drafts) {
  const base = findModule(moduleId);
  const draft = drafts?.[moduleId];
  if (!draft) return base;
  return {
    ...base,
    ...draft,
    stats: base.stats,
    code: base.code,
    students: base.students,
  };
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateOnly(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function shortDescription(text, length = 30) {
  return text.length <= length ? text : `${text.slice(0, length).trimEnd()}...`;
}

export function resolveRoute(pathname, isAuthenticated) {
  const path = normalizePath(pathname);
  if (path === "/") {
    return isAuthenticated
      ? { kind: "teacher-home" }
      : { kind: "guest-landing" };
  }
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
