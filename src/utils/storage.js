export const SESSION_KEY = "learncognition-web-session";
export const PENDING_KEY = "learncognition-web-pending";
export const NOTIFICATIONS_KEY = "learncognition-web-notifications";
export const MODULE_DRAFTS_KEY = "learncognition-web-module-drafts";
export const TOUR_KEY = "learncognition-web-tour";

export function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore demo storage failures.
  }
}
