import { supabase } from "./supabase";

export type PartnerId = "hatim" | "moiz";

const PWD_PREFIX = "dk_pwd_";

/**
 * Helper to fetch stored password for a partner from Supabase partner_profiles table.
 * Falls back to local storage cache if network is offline.
 */
export async function getPartnerPassword(partnerId: PartnerId): Promise<string | null> {
  const local = localStorage.getItem(`${PWD_PREFIX}${partnerId}`);

  try {
    const credId = `cred_${partnerId}`;
    const { data, error } = await supabase
      .from("partner_profiles")
      .select("display_name")
      .eq("id", credId)
      .maybeSingle();

    if (!error && data && data.display_name) {
      localStorage.setItem(`${PWD_PREFIX}${partnerId}`, data.display_name);
      return data.display_name;
    }
  } catch (err) {
    console.warn("Could not fetch partner password from Supabase:", err);
  }

  return local || null;
}

/**
 * Saves partner password both in Supabase partner_profiles and local cache.
 */
export async function setPartnerPassword(partnerId: PartnerId, newPassword: string): Promise<boolean> {
  const trimmed = newPassword.trim();
  if (!trimmed) return false;

  // 1. Save to local storage for instant availability
  localStorage.setItem(`${PWD_PREFIX}${partnerId}`, trimmed);

  // 2. Persist to Supabase partner_profiles table so it syncs across all devices (phone, desktop)
  try {
    const credId = `cred_${partnerId}`;
    const email = `cred_${partnerId}@duokarma.internal`;

    const { error } = await supabase
      .from("partner_profiles")
      .upsert({
        id: credId,
        email,
        display_name: trimmed,
        avatar_url: "",
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn("Error upserting partner credential to Supabase:", error);
    }
  } catch (err) {
    console.warn("Could not save partner password to Supabase:", err);
  }

  return true;
}

/**
 * Validates the password or sets it on first time login.
 * If no password exists yet, whatever password entered becomes the partner's password.
 */
export async function verifyOrSetPartnerPassword(
  partnerId: PartnerId,
  enteredPassword: string
): Promise<{ success: boolean; isFirstTime: boolean; error?: string }> {
  const trimmed = enteredPassword.trim();
  if (!trimmed) {
    return { success: false, isFirstTime: false, error: "Password cannot be empty" };
  }

  const stored = await getPartnerPassword(partnerId);

  // First time login: no password set yet
  if (!stored) {
    await setPartnerPassword(partnerId, trimmed);
    return { success: true, isFirstTime: true };
  }

  // Password already exists: must match
  if (stored === trimmed) {
    return { success: true, isFirstTime: false };
  }

  return {
    success: false,
    isFirstTime: false,
    error: "Incorrect password. If you changed it in Settings, please use your new password.",
  };
}
