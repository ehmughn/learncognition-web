import { createContext, useContext, useEffect, useState } from "react";
import { readJson, writeJson } from "../utils/storage.js";

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
  startTour,
  cancelTour,
}) {
  return {
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
    startTour,
    cancelTour,
  };
}
