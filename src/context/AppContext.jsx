import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  SESSION_KEY,
  PENDING_KEY,
  NOTIFICATIONS_KEY,
  MODULE_DRAFTS_KEY,
  TOUR_KEY,
  readJson,
  writeJson,
} from "../utils/storage.js";
import { normalizePath, resolveRoute } from "../utils/routing.js";
import { onboardingPaths } from "../constants/notifications.js";
import { notificationsSeed } from "../constants/notifications.js";

export const AppContext = createContext(null);

export function usePersistentState(key, fallback) {
  const [state, setState] = useState(() => readJson(key, fallback));

  useEffect(() => {
    writeJson(key, state);
  }, [key, state]);

  return [state, setState];
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppContext");
  return value;
}

export function createAppContextValue({
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
  startTour,
  cancelTour,
}) {
  return useMemo(
    () => ({
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
      startTour,
      cancelTour,
    }),
    [route, pathname, session, pendingFlow, notifications, moduleDrafts],
  );
}
