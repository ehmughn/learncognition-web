import { supabase } from "./integrations.js";

/**
 * Sign up a new teacher account
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @returns {Promise<{user, error}>}
 */
export async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Profile creation is handled on first login via RPC
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{session, error}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Get the current session
 * @returns {Promise<{session, error}>}
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error };
  }
}

/**
 * Listen to auth state changes
 * @param {Function} callback - called with (user, session)
 * @returns {Function} unsubscribe function
 */
export function onAuthStateChange(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, session || null);
  });

  return () => subscription?.unsubscribe?.();
}

/**
 * Reset password via email
 * @param {string} email
 * @returns {Promise<{error}>}
 */
export async function resetPasswordForEmail(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Update password with recovery code or session
 * @param {string} newPassword
 * @returns {Promise<{error}>}
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Get user profile from workspace table
 * @returns {Promise<{profile, error}>}
 */
export async function getUserProfile() {
  try {
    const { data, error } = await supabase
      .from("teacher_workspace_profile")
      .select("*")
      .eq("id", "teacher")
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return { profile: data || null, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}

/**
 * Initialize workspace data for new user
 * Creates profile and settings if they don't exist
 * @param {string} fullName
 * @param {string} email
 * @returns {Promise<{profile, settings, error}>}
 */
export async function initializeWorkspace(fullName, email) {
  try {
    // Create or update profile using RPC upsert
    const { data: profileData, error: profileError } = await supabase.rpc(
      "update_workspace_profile",
      {
        p_id: "teacher",
        p_full_name: fullName,
        p_email: email,
        p_role: "teacher",
        p_school: null,
        p_status: "Verified",
        p_avatar_url: null,
      },
    );

    if (profileError) throw profileError;

    // Create or update settings using RPC upsert
    const { data: settingsData, error: settingsError } = await supabase.rpc(
      "update_workspace_settings",
      {
        p_id: "workspace",
        p_notifications_enabled: true,
        p_sharing_enabled: true,
        p_theme_mode: "light",
      },
    );

    if (settingsError) throw settingsError;

    return {
      profile: profileData?.[0],
      settings: settingsData?.[0],
      error: null,
    };
  } catch (error) {
    return { profile: null, settings: null, error };
  }
}
