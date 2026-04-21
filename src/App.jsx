import { useEffect, useRef, useState } from "react";
import {
  AppContext,
  usePersistentState,
  createAppContextValue,
} from "./context/AppContext.jsx";
import { RouteRenderer } from "./pages/RouteRenderer.jsx";
import {
  SESSION_KEY,
  PENDING_KEY,
  NOTIFICATIONS_KEY,
  MODULE_DRAFTS_KEY,
  TOUR_KEY,
} from "./utils/storage.js";
import { normalizePath, resolveRoute } from "./utils/routing.js";
import { getModuleView } from "./utils/dataHelpers.js";
import {
  notificationsSeed,
  onboardingPaths,
} from "./constants/notifications.js";
import "./styles/index.css";

export default function App() {
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
  const [notifications, setNotifications] = usePersistentState(
    NOTIFICATIONS_KEY,
    notificationsSeed,
  );
  const [moduleDrafts, setModuleDrafts] = usePersistentState(
    MODULE_DRAFTS_KEY,
    {},
  );
  const [tour, setTour] = usePersistentState(TOUR_KEY, {
    active: false,
    step: 0,
  });
  const [toast, setToast] = useState("");
  const tourTimer = useRef(null);

  const navigate = (to, { replace = false } = {}) => {
    const nextPath = normalizePath(to);
    if (typeof window !== "undefined") {
      if (replace) {
        window.history.replaceState({}, "", nextPath);
      } else {
        window.history.pushState({}, "", nextPath);
      }
    }
    setPathname(nextPath);
  };

  const showToast = (message) => setToast(message);

  const addNotification = (title, message) => {
    const next = {
      id: `n-${Date.now()}`,
      title,
      message,
      time: "Just now",
      read: false,
    };
    setNotifications((current) => [next, ...current].slice(0, 8));
    showToast(message);
  };

  const signOut = () => {
    setSession({
      authenticated: false,
      role: "guest",
      name: "",
      email: "",
      verified: false,
    });
    setPendingFlow(null);
    navigate("/");
    showToast("You are signed out.");
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
  }, [tour.active]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const route = resolveRoute(pathname, session.authenticated);
  const contextValue = createAppContextValue({
    route,
    pathname,
    navigate,
    session,
    setSession,
    pendingFlow,
    setPendingFlow,
    notifications,
    setNotifications,
    addNotification,
    showToast,
    moduleDrafts,
    setModuleDrafts,
    signOut,
    getModuleView,
    startTour: () => setTour({ active: true, step: 0 }),
    cancelTour: () => {
      if (tourTimer.current) window.clearTimeout(tourTimer.current);
      setTour({ active: false, step: 0 });
    },
  });

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app-shell">
        <RouteRenderer />
        {toast ? <div className="toast">{toast}</div> : null}
      </div>
    </AppContext.Provider>
  );
}
