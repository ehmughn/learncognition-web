import { useCallback, useEffect, useRef, useState } from "react";
import { AppContext, usePersistentState } from "./context/AppContext.jsx";
import { RouteRenderer } from "./pages/RouteRenderer.jsx";
import { SESSION_KEY, PENDING_KEY } from "./utils/storage.js";
import { normalizePath, resolveRoute } from "./utils/routing.js";
import { onboardingPaths } from "./constants/notifications.js";
import {
  createDefaultWorkspaceState,
  createWorkspaceModule,
  loadWorkspaceData,
  persistWorkspaceNotifications,
  saveWorkspaceModule,
  saveWorkspaceProfile,
  saveWorkspaceSettings,
} from "./services/workspace.js";
import { fetchDashboardSummary } from "./services/integrations.js";
import {
  onAuthStateChange,
  signOut as authSignOut,
  initializeWorkspace,
} from "./services/auth.js";
import "./styles/index.css";

export default function App() {
  const initialWorkspace = createDefaultWorkspaceState();

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const [pathname, setPathname] = useState(() => {
    if (typeof window === "undefined") return "/";
    return normalizePath(window.location.pathname);
  });

  const [session, setSession] = usePersistentState(SESSION_KEY, {
    authenticated: false,
    role: "guest",
    name: "",
    email: "",
    verified: false,
  });

  const [pendingFlow, setPendingFlow] = usePersistentState(PENDING_KEY, null);
  const [notifications, setNotifications] = useState(
    initialWorkspace.notifications,
  );
  const [moduleDrafts, setModuleDrafts] = useState({});
  const [modules, setModules] = useState(initialWorkspace.modules);
  const [students, setStudents] = useState(initialWorkspace.students);
  const [profile, setProfile] = useState(initialWorkspace.profile);
  const [settings, setSettings] = useState(initialWorkspace.settings);
  const [workspaceSummary, setWorkspaceSummary] = useState(
    initialWorkspace.summary,
  );
  const [workspaceLive, setWorkspaceLive] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceHydrated, setWorkspaceHydrated] = useState(false);
  const [tour, setTour] = useState({
    active: false,
    step: 0,
  });
  const [toast, setToast] = useState("");
  const tourTimer = useRef(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user, supabaseSession) => {
      if (user && supabaseSession) {
        // User is logged in - initialize workspace
        setSession({
          authenticated: true,
          role: "teacher",
          name: user.user_metadata?.full_name || user.email || "Teacher",
          email: user.email || "",
          verified: true,
        });
        setPendingFlow(null);

        // Initialize workspace profile and settings on first login
        void initializeWorkspace(
          user.user_metadata?.full_name || "Teacher",
          user.email || "",
        ).catch(() => {});
      } else {
        // User is logged out
        setSession({
          authenticated: false,
          role: "guest",
          name: "",
          email: "",
          verified: false,
        });
        setPendingFlow(null);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspace() {
      // Only load workspace when authenticated
      if (!session.authenticated) {
        setWorkspaceLoading(false);
        setWorkspaceHydrated(true);
        return;
      }

      const [nextWorkspace, nextSummary] = await Promise.all([
        loadWorkspaceData(),
        fetchDashboardSummary(),
      ]);
      if (!isMounted) return;

      setModules(nextWorkspace.modules);
      setStudents(nextWorkspace.students);
      setNotifications(nextWorkspace.notifications);
      setProfile(nextWorkspace.profile);
      setSettings(nextWorkspace.settings);
      setWorkspaceLive(nextWorkspace.live);
      setWorkspaceSummary(
        nextSummary.live ? nextSummary : nextWorkspace.summary,
      );
      setWorkspaceLoading(false);
      setWorkspaceHydrated(true);
    }

    loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, [session.authenticated]);

  useEffect(() => {
    if (!settings?.themeMode) return;
    document.documentElement.setAttribute("data-theme", settings.themeMode);
    localStorage.setItem("app-theme", settings.themeMode);
  }, [settings?.themeMode]);

  useEffect(() => {
    if (!workspaceHydrated || !workspaceLive) return;
    void persistWorkspaceNotifications(notifications).catch(() => {});
  }, [notifications, workspaceLive, workspaceHydrated]);

  useEffect(() => {
    if (!workspaceHydrated || !workspaceLive) return;
    void saveWorkspaceSettings(settings).catch(() => {});
  }, [settings, workspaceLive, workspaceHydrated]);

  useEffect(() => {
    if (!workspaceHydrated || !workspaceLive) return;
    void saveWorkspaceProfile(profile).catch(() => {});
  }, [profile, workspaceLive, workspaceHydrated]);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const nextPath = normalizePath(to);
    if (typeof window !== "undefined") {
      if (replace) {
        window.history.replaceState({}, "", nextPath);
      } else {
        window.history.pushState({}, "", nextPath);
      }
    }
    setPathname(nextPath);
  }, []);

  const showToast = (message) => setToast(message);
  const notificationCounter = useRef(0);

  const addNotification = (title, message) => {
    notificationCounter.current += 1;
    const next = {
      id: `n-${notificationCounter.current}`,
      title,
      message,
      time: "Just now",
      read: false,
    };
    setNotifications((current) => [next, ...current].slice(0, 8));
    showToast(message);
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      })),
    );
    showToast("All notifications marked as read.");
  };

  const createModule = async (type) => {
    const nextModule = await createWorkspaceModule(type);
    setModules((current) => [...current, nextModule]);
    void refreshWorkspace().catch(() => {});
    return nextModule;
  };

  const saveModule = async (module) => {
    const savedModule = await saveWorkspaceModule(module);
    setModules((current) =>
      current.map((item) => (item.id === savedModule.id ? savedModule : item)),
    );
    void refreshWorkspace().catch(() => {});
    return savedModule;
  };

  const updateSettings = async (nextSettings) => {
    try {
      const savedSettings = await saveWorkspaceSettings(nextSettings);
      setSettings(savedSettings);
      void refreshWorkspace().catch(() => {});
      return savedSettings;
    } catch {
      setSettings(nextSettings);
      return nextSettings;
    }
  };

  const updateProfile = async (nextProfile) => {
    try {
      const savedProfile = await saveWorkspaceProfile(nextProfile);
      setProfile(savedProfile);
      void refreshWorkspace().catch(() => {});
      return savedProfile;
    } catch {
      setProfile(nextProfile);
      return nextProfile;
    }
  };

  const refreshWorkspace = async () => {
    setWorkspaceLoading(true);
    const [nextWorkspace, nextSummary] = await Promise.all([
      loadWorkspaceData(),
      fetchDashboardSummary(),
    ]);
    setModules(nextWorkspace.modules);
    setStudents(nextWorkspace.students);
    setNotifications(nextWorkspace.notifications);
    setProfile(nextWorkspace.profile);
    setSettings(nextWorkspace.settings);
    setWorkspaceLive(nextWorkspace.live);
    setWorkspaceSummary(nextSummary.live ? nextSummary : nextWorkspace.summary);
    setWorkspaceLoading(false);
    setWorkspaceHydrated(true);
    return nextWorkspace;
  };

  const getModuleView = (moduleId, drafts = null) => {
    const baseModule = modules.find((module) => module.id === moduleId);
    if (!baseModule) return null;
    const draft = drafts?.[moduleId];

    if (!draft) return baseModule;

    return {
      ...baseModule,
      ...draft,
      stats: baseModule.stats,
      code: baseModule.code,
      students: baseModule.students,
    };
  };

  const getStudentView = (studentId) =>
    students.find((student) => student.id === studentId) ?? null;

  const signOut = async () => {
    try {
      await authSignOut();
      setSession({
        authenticated: false,
        role: "guest",
        name: "",
        email: "",
        verified: false,
      });
      setPendingFlow(null);
      navigate("/", { replace: true });
      showToast("You are signed out.");
    } catch {
      showToast("Error signing out. Please try again.");
    }
  };

  useEffect(() => {
    const onPopState = () =>
      setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      document.title = session.authenticated
        ? "LearnCognition | Teacher Home"
        : "LearnCognition | Intelligent learning modules";
    } else {
      document.title = `LearnCognition | ${pathname.replace("/", "").replaceAll("-", " ") || "Home"}`;
    }
  }, [pathname, session.authenticated]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (!tour.active) return undefined;
    if (tourTimer.current) window.clearTimeout(tourTimer.current);

    let index = tour.step ?? 0;
    const advance = () => {
      if (index >= onboardingPaths.length) {
        setTour({ active: false, step: 0 });
        navigate("/");
        return;
      }
      navigate(onboardingPaths[index]);
      index += 1;
      setTour((current) => ({ ...current, step: index }));
      tourTimer.current = window.setTimeout(advance, 1400);
    };

    tourTimer.current = window.setTimeout(advance, 700);
    return () => {
      if (tourTimer.current) window.clearTimeout(tourTimer.current);
    };
  }, [tour.active, tour.step, navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const route = resolveRoute(pathname, session.authenticated);
  const contextValue = {
    route,
    pathname,
    navigate,
    session,
    setSession,
    pendingFlow,
    setPendingFlow,
    modules,
    students,
    profile,
    settings,
    workspaceSummary,
    workspaceLive,
    workspaceLoading,
    notifications,
    setNotifications,
    addNotification,
    markAllNotificationsRead,
    showToast,
    moduleDrafts,
    setModuleDrafts,
    createModule,
    saveModule,
    updateSettings,
    updateProfile,
    refreshWorkspace,
    signOut,
    getModuleView,
    getStudentView,
    startTour: () => setTour({ active: true, step: 0 }),
    cancelTour: () => {
      if (tourTimer.current) window.clearTimeout(tourTimer.current);
      setTour({ active: false, step: 0 });
    },
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app-shell">
        <RouteRenderer />
        {toast ? <div className="toast">{toast}</div> : null}
      </div>
    </AppContext.Provider>
  );
}
