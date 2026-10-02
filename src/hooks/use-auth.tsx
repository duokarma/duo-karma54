import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Map known co-founder emails → display names
const FOUNDER_NAMES: Record<string, string> = {
  "hatimsuttar@gmail.com": "Hatim",
  "moizdhilawala99@gmail.com": "Moiz",
};

function getDisplayName(email: string | undefined): string {
  if (!email) return "Admin";
  if (FOUNDER_NAMES[email.toLowerCase()]) return FOUNDER_NAMES[email.toLowerCase()];
  return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

type AuthContextType = {
  user: User | null;
  displayName: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const displayName = getDisplayName(user?.email);

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        displayName,
        isAuthenticated: !!user, 
        isLoading, 
        signOut 
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
