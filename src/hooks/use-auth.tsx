import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Map known partner emails → display names
const PARTNER_MAP: Record<string, string> = {
  "hatimsuttar@gmail.com": "Hatim",
  "moizdhilawala99@gmail.com": "Moiz",
};

export const PARTNER_ID_MAP: Record<string, string> = {
  "hatimsuttar@gmail.com": "hatim",
  "moizdhilawala99@gmail.com": "moiz",
};

export interface PartnerSessionData {
  id: "hatim" | "moiz";
  email: string;
  displayName: string;
}

const PARTNER_SESSION_KEY = "dk_partner_session";

function getDisplayName(email: string | undefined): string {
  if (!email) return "Partner";
  const lower = email.toLowerCase();
  if (PARTNER_MAP[lower]) return PARTNER_MAP[lower];
  return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getPartnerId(email: string | undefined): string | null {
  if (!email) return null;
  const lower = email.toLowerCase();
  return PARTNER_ID_MAP[lower] ?? lower.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
}

/** Returns initials (1-2 chars) for the avatar circle */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function createSyntheticUser(session: PartnerSessionData, avatarUrl?: string | null): User {
  return {
    id: session.id,
    app_metadata: { provider: "partner" },
    user_metadata: {
      name: session.displayName,
      avatar_url: avatarUrl || undefined,
    },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: session.email,
    role: "authenticated",
  } as User;
}

type AuthContextType = {
  user: User | null;
  displayName: string;
  avatarUrl: string | null;
  partnerId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsPartner: (partner: PartnerSessionData) => void;
  signOut: () => Promise<void>;
  updateAvatarUrl: (url: string | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read saved partner session from storage
  const getStoredPartnerSession = (): PartnerSessionData | null => {
    try {
      const raw = localStorage.getItem(PARTNER_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignored
    }
    return null;
  };

  const partnerId = getPartnerId(user?.email);
  const displayName = getDisplayName(user?.email);

  // Sync avatar from local cache + Supabase
  const syncAvatar = useCallback(async (email: string | undefined) => {
    if (!email) {
      setAvatarUrl(null);
      return;
    }
    const pid = getPartnerId(email);
    const cached = pid ? localStorage.getItem(`dk_avatar_${pid}`) : null;
    if (cached) {
      setAvatarUrl(cached);
    }

    try {
      const { data } = await supabase
        .from("partner_profiles")
        .select("avatar_url")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (data && data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        if (pid) localStorage.setItem(`dk_avatar_${pid}`, data.avatar_url);
      }
    } catch {
      // Silently fallback to cached avatar
    }
  }, []);

  useEffect(() => {
    // 1. First inspect Supabase Auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        setUser(currentUser);
        syncAvatar(currentUser.email);
        setIsLoading(false);
      } else {
        // 2. Check direct partner session fallback
        const partnerSession = getStoredPartnerSession();
        if (partnerSession) {
          const pid = partnerSession.id;
          const cachedAvatar = pid ? localStorage.getItem(`dk_avatar_${pid}`) : null;
          setUser(createSyntheticUser(partnerSession, cachedAvatar));
          syncAvatar(partnerSession.email);
        }
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        setUser(currentUser);
        syncAvatar(currentUser.email);
      } else {
        const partnerSession = getStoredPartnerSession();
        if (partnerSession) {
          const pid = partnerSession.id;
          const cachedAvatar = pid ? localStorage.getItem(`dk_avatar_${pid}`) : null;
          setUser(createSyntheticUser(partnerSession, cachedAvatar));
          syncAvatar(partnerSession.email);
        } else {
          setUser(null);
          setAvatarUrl(null);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [syncAvatar]);

  const loginAsPartner = useCallback((partner: PartnerSessionData) => {
    localStorage.setItem(PARTNER_SESSION_KEY, JSON.stringify(partner));
    const cachedAvatar = localStorage.getItem(`dk_avatar_${partner.id}`);
    setUser(createSyntheticUser(partner, cachedAvatar));
    syncAvatar(partner.email);
  }, [syncAvatar]);

  const updateAvatarUrl = async (url: string | null) => {
    setAvatarUrl(url);
    if (partnerId) {
      if (url) {
        localStorage.setItem(`dk_avatar_${partnerId}`, url);
      } else {
        localStorage.removeItem(`dk_avatar_${partnerId}`);
      }
    }

    // 1. Update Supabase Auth user_metadata if active
    try {
      await supabase.auth.updateUser({
        data: { avatar_url: url || null },
      });
    } catch (err) {
      console.warn("Could not update auth metadata avatar:", err);
    }

    // 2. Update partner_profiles table in Supabase
    if (partnerId && user?.email) {
      try {
        await supabase.from("partner_profiles").upsert({
          id: partnerId,
          email: user.email.toLowerCase(),
          display_name: displayName,
          avatar_url: url || "",
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Could not upsert partner_profiles table:", err);
      }
    }
  };

  const signOut = async () => {
    localStorage.removeItem(PARTNER_SESSION_KEY);
    setUser(null);
    setAvatarUrl(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        displayName,
        avatarUrl,
        partnerId,
        isAuthenticated: !!user,
        isLoading,
        loginAsPartner,
        signOut,
        updateAvatarUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

