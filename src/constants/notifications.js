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
export const chartLine = [55, 60, 64, 72, 79, 85];
export const pieSegments = [
  { label: "Identify", value: 46, color: "#b42318" },
  { label: "Search", value: 34, color: "#1d4ed8" },
  { label: "Not yet taken", value: 20, color: "#64748b" },
];

export const onboardingPaths = [
  "/",
  "/dashboard",
  "/create",
  "/modules",
  "/profile",
  "/settings",
  "/",
];
