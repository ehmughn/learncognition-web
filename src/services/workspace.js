import { supabase } from "./integrations.js";
import { makeCode } from "../utils/formatting.js";

const MODULE_TABLE = "teacher_workspace_modules";
const STUDENT_TABLE = "teacher_workspace_students";
const NOTIFICATION_TABLE = "teacher_workspace_notifications";
const PROFILE_TABLE = "teacher_workspace_profile";
const SETTINGS_TABLE = "teacher_workspace_settings";

export const defaultWorkspaceProfile = {
  id: "teacher",
  name: "",
  email: "",
  role: "teacher",
  school: "",
  status: "",
  avatarUrl: null,
};

export const defaultWorkspaceSettings = {
  id: "workspace",
  notificationsEnabled: true,
  sharingEnabled: true,
  themeMode: "light",
};

function cloneItems(items) {
  return Array.isArray(items) ? items.map((item) => ({ ...item })) : [];
}

function parseNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeModule(row) {
  if (!row) return null;

  const stats = row.stats && typeof row.stats === "object" ? row.stats : {};
  const students = Array.isArray(row.student_ids)
    ? row.student_ids
    : Array.isArray(row.students)
      ? row.students
      : [];

  return {
    id: String(row.id),
    name: row.name ?? "Untitled module",
    description: row.description ?? "",
    type: row.type ?? "identify",
    code: row.code ?? makeCode(),
    sortOrder: parseNumber(row.sort_order ?? row.sortOrder),
    stats: {
      items: parseNumber(
        stats.items ?? row.item_count ?? cloneItems(row.items).length,
      ),
      scanned: parseNumber(stats.scanned),
      taken: parseNumber(stats.taken),
      averageScore: parseNumber(stats.averageScore ?? stats.average_score),
      passingRate: parseNumber(stats.passingRate ?? stats.passing_rate),
    },
    items: cloneItems(row.items),
    students: students.map((studentId) => String(studentId)),
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function normalizeStudent(row) {
  if (!row) return null;

  return {
    id: String(row.id),
    name: row.name ?? "Unnamed student",
    description: row.description ?? "",
    joinedAt: row.joined_at ?? row.joinedAt ?? new Date().toISOString(),
    score:
      row.score == null
        ? null
        : Number.isFinite(Number(row.score))
          ? Number(row.score)
          : null,
    modulesTaken: Array.isArray(row.modules_taken)
      ? row.modules_taken.map((moduleName) => String(moduleName))
      : Array.isArray(row.modulesTaken)
        ? row.modulesTaken.map((moduleName) => String(moduleName))
        : [],
    records: cloneItems(row.records).map((record) => ({
      ...record,
      score:
        record.score == null
          ? 0
          : Number.isFinite(Number(record.score))
            ? Number(record.score)
            : 0,
    })),
    avatarUrl: row.avatar_url ?? row.avatarUrl ?? null,
  };
}

function normalizeNotification(row) {
  if (!row) return null;

  return {
    id: String(row.id),
    title: row.title ?? "Notification",
    message: row.message ?? "",
    time: row.time_label ?? row.time ?? "Just now",
    read: Boolean(row.read),
    createdAt: row.createdAt ?? row.created_at ?? null,
  };
}

function notificationSortWeight(notification) {
  if (notification.createdAt) {
    const timestamp = Date.parse(notification.createdAt);
    if (Number.isFinite(timestamp)) return timestamp;
  }

  const trailingNumber = String(notification.id).match(/(\d+)$/)?.[1];
  return trailingNumber ? Number(trailingNumber) : 0;
}

function normalizeProfile(row) {
  if (!row) return { ...defaultWorkspaceProfile };

  return {
    id: String(row.id ?? defaultWorkspaceProfile.id),
    name: row.full_name ?? row.name ?? defaultWorkspaceProfile.name,
    email: row.email ?? defaultWorkspaceProfile.email,
    role: row.role ?? defaultWorkspaceProfile.role,
    school: row.school ?? defaultWorkspaceProfile.school,
    status: row.status ?? row.badge_title ?? defaultWorkspaceProfile.status,
    avatarUrl: row.avatar_url ?? row.avatarUrl ?? null,
  };
}

function normalizeSettings(row) {
  if (!row) return { ...defaultWorkspaceSettings };

  return {
    id: String(row.id ?? defaultWorkspaceSettings.id),
    notificationsEnabled:
      row.notifications_enabled ??
      defaultWorkspaceSettings.notificationsEnabled,
    sharingEnabled:
      row.sharing_enabled ?? defaultWorkspaceSettings.sharingEnabled,
    themeMode: row.theme_mode ?? defaultWorkspaceSettings.themeMode,
  };
}

function toModuleRow(module) {
  return {
    id: module.id,
    name: module.name,
    description: module.description,
    type: module.type,
    code: module.code,
    stats: module.stats,
    items: module.items,
    student_ids: module.students ?? [],
    sort_order: module.sortOrder ?? module.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  };
}

function toNotificationRow(notification) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time_label: notification.time,
    read: Boolean(notification.read),
    created_at: notification.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildSummary({ modules, students, notifications, live }) {
  const moduleAverage = modules.length
    ? Math.round(
        modules.reduce(
          (sum, module) => sum + Number(module.stats?.averageScore ?? 0),
          0,
        ) / modules.length,
      )
    : 0;

  const configuredItems = modules.reduce(
    (sum, module) => sum + Number(module.items?.length ?? 0),
    0,
  );

  const recordCount = students.reduce(
    (sum, student) => sum + Number(student.records?.length ?? 0),
    0,
  );

  const updatedAt =
    [...modules, ...students, ...notifications]
      .map((entry) => entry.updatedAt ?? entry.createdAt ?? entry.joinedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return {
    live,
    modulesCount: modules.length,
    sectionsCount: configuredItems,
    activitiesCount: recordCount,
    learnersCount: students.length,
    sessionsCount: recordCount,
    averageScore: moduleAverage,
    updatedAt,
  };
}

async function loadRowsViaRPC(rpcName, normalize) {
  try {
    const { data, error } = await supabase.rpc(rpcName);
    if (error) throw error;

    const rows = Array.isArray(data) ? data.map(normalize).filter(Boolean) : [];
    return { rows, live: true };
  } catch {
    return {
      rows: [],
      live: false,
    };
  }
}

async function loadSingleRowViaRPC(rpcName, fallbackRow, normalize) {
  try {
    const { data, error } = await supabase.rpc(rpcName);
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : (data ?? null);
    if (!row) {
      return { row: normalize(fallbackRow), live: true };
    }

    return { row: normalize(row), live: true };
  } catch {
    return { row: normalize(fallbackRow), live: false };
  }
}

export function createDefaultWorkspaceState() {
  const modules = [];
  const students = [];
  const notifications = [];

  return {
    live: false,
    modules,
    students,
    notifications,
    profile: { ...defaultWorkspaceProfile },
    settings: { ...defaultWorkspaceSettings },
    summary: buildSummary({ modules, students, notifications, live: false }),
  };
}

export async function loadWorkspaceData() {
  const [
    modulesResult,
    studentsResult,
    notificationsResult,
    profileResult,
    settingsResult,
  ] = await Promise.all([
    loadRowsViaRPC("get_workspace_modules", normalizeModule),
    loadRowsViaRPC("get_workspace_students", normalizeStudent),
    loadRowsViaRPC("get_workspace_notifications", normalizeNotification),
    loadSingleRowViaRPC(
      "get_workspace_profile",
      defaultWorkspaceProfile,
      normalizeProfile,
    ),
    loadSingleRowViaRPC(
      "get_workspace_settings",
      defaultWorkspaceSettings,
      normalizeSettings,
    ),
  ]);

  const modules = modulesResult.rows;
  const students = studentsResult.rows;
  const notifications = notificationsResult.rows
    .slice()
    .sort(
      (left, right) =>
        notificationSortWeight(right) - notificationSortWeight(left),
    )
    .slice(0, 8);
  const live =
    modulesResult.live &&
    studentsResult.live &&
    notificationsResult.live &&
    profileResult.live &&
    settingsResult.live;
  const summary = buildSummary({
    modules,
    students,
    notifications,
    live,
  });

  return {
    live,
    modules,
    students,
    notifications,
    profile: profileResult.row,
    settings: settingsResult.row,
    summary,
  };
}

export async function saveWorkspaceModule(module) {
  const payload = toModuleRow(module);
  const { error } = await supabase.rpc("update_workspace_module", {
    p_id: payload.id,
    p_name: payload.name,
    p_description: payload.description,
    p_type: payload.type,
    p_code: payload.code,
    p_stats: payload.stats,
    p_items: payload.items,
    p_student_ids: payload.student_ids,
    p_sort_order: payload.sort_order,
  });
  if (error) throw error;

  return { ...module, updatedAt: payload.updated_at };
}

export async function createWorkspaceModule(type) {
  const nextModule = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `module-${Date.now()}`,
    name: type === "identify" ? "New Identify Module" : "New Search Module",
    description: "Draft created from the module builder.",
    type,
    code: makeCode(),
    sortOrder: Math.floor(Date.now() / 1000),
    stats: {
      items: 0,
      scanned: 0,
      taken: 0,
      averageScore: 0,
      passingRate: 0,
    },
    items: [],
    students: [],
  };

  const { error } = await supabase.rpc("create_workspace_module", {
    p_id: nextModule.id,
    p_name: nextModule.name,
    p_code: nextModule.code,
    p_type: nextModule.type,
    p_description: nextModule.description,
    p_sort_order: nextModule.sortOrder,
  });
  if (error) throw error;

  return nextModule;
}

export async function persistWorkspaceNotifications(notifications) {
  if (!notifications.length) return [];

  const rows = notifications.map((notification) =>
    toNotificationRow(notification),
  );

  const { error } = await supabase.rpc("upsert_workspace_notifications", {
    p_notifications: JSON.stringify(rows),
  });
  if (error) throw error;
  return notifications;
}

export async function saveWorkspaceSettings(settings) {
  const payload = {
    id: settings.id ?? defaultWorkspaceSettings.id,
    notifications_enabled:
      settings.notificationsEnabled ??
      defaultWorkspaceSettings.notificationsEnabled,
    sharing_enabled:
      settings.sharingEnabled ?? defaultWorkspaceSettings.sharingEnabled,
    theme_mode: settings.themeMode ?? defaultWorkspaceSettings.themeMode,
  };

  const { error } = await supabase.rpc("update_workspace_settings", {
    p_id: payload.id,
    p_notifications_enabled: payload.notifications_enabled,
    p_sharing_enabled: payload.sharing_enabled,
    p_theme_mode: payload.theme_mode,
  });
  if (error) throw error;

  return {
    id: payload.id,
    notificationsEnabled: payload.notifications_enabled,
    sharingEnabled: payload.sharing_enabled,
    themeMode: payload.theme_mode,
  };
}

export async function saveWorkspaceProfile(profile) {
  const payload = {
    id: profile.id ?? defaultWorkspaceProfile.id,
    full_name: profile.name ?? defaultWorkspaceProfile.name,
    email: profile.email ?? defaultWorkspaceProfile.email,
    role: profile.role ?? defaultWorkspaceProfile.role,
    school: profile.school ?? defaultWorkspaceProfile.school,
    status: profile.status ?? defaultWorkspaceProfile.status,
    avatar_url: profile.avatarUrl ?? null,
  };

  const { error } = await supabase.rpc("update_workspace_profile", {
    p_id: payload.id,
    p_full_name: payload.full_name,
    p_email: payload.email,
    p_role: payload.role,
    p_school: payload.school,
    p_status: payload.status,
    p_avatar_url: payload.avatar_url,
  });
  if (error) throw error;

  return {
    id: payload.id,
    name: payload.full_name,
    email: payload.email,
    role: payload.role,
    school: payload.school,
    status: payload.status,
    avatarUrl: payload.avatar_url,
  };
}

export function buildWorkspaceOverview({
  modules,
  students,
  notifications,
  live,
}) {
  return buildSummary({ modules, students, notifications, live });
}

export function normalizeWorkspaceModule(row) {
  return normalizeModule(row);
}

export function normalizeWorkspaceStudent(row) {
  return normalizeStudent(row);
}

export function normalizeWorkspaceNotification(row) {
  return normalizeNotification(row);
}
