import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface EcosystemApp {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  category?: string;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: "ten11",
    title: "Ten11 Salon Admin",
    url: "https://tens-11.vercel.app/",
    imageUrl: "/apps/ten11-logo.jpg",
    category: "Client Admin",
    orderIndex: 0,
  },
  {
    id: "wow-salon",
    title: "WOW Salon",
    url: "https://wowsalon.in",
    imageUrl: "/apps/wow-salon-logo.webp",
    category: "Live Website",
    orderIndex: 1,
  },
  {
    id: "wow-salon-admin",
    title: "WOW Salon Admin",
    url: "https://wowsalon.in/admin",
    imageUrl: "/apps/wow-salon-logo.webp",
    category: "Admin Portal",
    orderIndex: 2,
  },
  {
    id: "duokarma-main",
    title: "DuoKarma Main",
    url: "https://duokarma.com",
    imageUrl: "/logo.jpeg",
    category: "Official Hub",
    orderIndex: 3,
  },
];

const STORAGE_KEY = "dk_ecosystem_apps_v2";
const EVENT_NAME = "dk-ecosystem-apps-changed";

function getLocalApps(): EcosystemApp[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ECOSYSTEM_APPS));
      return DEFAULT_ECOSYSTEM_APPS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("Error reading ecosystem apps from localStorage:", err);
  }
  return DEFAULT_ECOSYSTEM_APPS;
}

function saveLocalApps(apps: EcosystemApp[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: apps }));
  } catch (err) {
    console.error("Error saving ecosystem apps to localStorage:", err);
  }
}

export function useEcosystemApps() {
  const [apps, setApps] = useState<EcosystemApp[]>(getLocalApps);
  const [loading, setLoading] = useState(false);

  // Sync state when local events or other tabs fire
  useEffect(() => {
    const onCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<EcosystemApp[]>;
      if (customEvent.detail) {
        setApps(customEvent.detail);
      } else {
        setApps(getLocalApps());
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setApps(getLocalApps());
      }
    };

    window.addEventListener(EVENT_NAME, onCustomEvent);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, onCustomEvent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Fetch from Supabase and subscribe to realtime changes
  useEffect(() => {
    let mounted = true;

    async function syncFromSupabase() {
      try {
        const { data, error } = await supabase
          .from("ecosystem_apps")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) {
          // Table may not exist yet in Supabase schema, safe fallback
          return;
        }

        if (mounted && data && Array.isArray(data)) {
          if (data.length > 0) {
            const formatted: EcosystemApp[] = data.map((item) => ({
              id: item.id,
              title: item.title,
              url: item.url,
              imageUrl: item.image_url || "/logo.jpeg",
              category: item.category || "App",
              orderIndex: item.order_index ?? 0,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }));
            setApps(formatted);
            saveLocalApps(formatted);
          } else {
            // Supabase table is empty, seed it with default apps
            const seeds = DEFAULT_ECOSYSTEM_APPS.map((a) => ({
              id: a.id,
              title: a.title,
              url: a.url,
              image_url: a.imageUrl,
              category: a.category,
              order_index: a.orderIndex,
            }));
            await supabase.from("ecosystem_apps").upsert(seeds);
          }
        }
      } catch (err) {
        // Safe silent fallback to local storage
      }
    }

    syncFromSupabase();

    // Supabase Realtime channel (safe per-subscriber channel with try-catch)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      const channelId = `ecosystem_apps_${Math.random().toString(36).substring(2, 9)}`;
      channel = supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "ecosystem_apps" },
          () => {
            syncFromSupabase();
          }
        );
      channel.subscribe();
    } catch (err) {
      console.warn("Realtime channel initialization bypassed:", err);
    }

    return () => {
      mounted = false;
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Safe ignore cleanup error
        }
      }
    };
  }, []);

  const addApp = useCallback(
    async (newApp: Omit<EcosystemApp, "id"> & { id?: string }): Promise<EcosystemApp> => {
      setLoading(true);
      const id = newApp.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const appRecord: EcosystemApp = {
        ...newApp,
        id,
        orderIndex: newApp.orderIndex ?? apps.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [...apps, appRecord];
      setApps(updated);
      saveLocalApps(updated);

      try {
        await supabase.from("ecosystem_apps").upsert({
          id: appRecord.id,
          title: appRecord.title,
          url: appRecord.url,
          image_url: appRecord.imageUrl,
          category: appRecord.category || "App",
          order_index: appRecord.orderIndex,
          created_at: appRecord.createdAt,
          updated_at: appRecord.updatedAt,
        });
      } catch (err) {
        console.warn("Supabase upsert note:", err);
      } finally {
        setLoading(false);
      }

      return appRecord;
    },
    [apps]
  );

  const updateApp = useCallback(
    async (id: string, updates: Partial<EcosystemApp>): Promise<void> => {
      setLoading(true);
      const updated = apps.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return app;
      });

      setApps(updated);
      saveLocalApps(updated);

      const target = updated.find((a) => a.id === id);
      if (target) {
        try {
          await supabase.from("ecosystem_apps").upsert({
            id: target.id,
            title: target.title,
            url: target.url,
            image_url: target.imageUrl,
            category: target.category || "App",
            order_index: target.orderIndex,
            updated_at: target.updatedAt,
          });
        } catch (err) {
          console.warn("Supabase update note:", err);
        } finally {
          setLoading(false);
        }
      }
    },
    [apps]
  );

  const deleteApp = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      const updated = apps.filter((app) => app.id !== id);
      setApps(updated);
      saveLocalApps(updated);

      try {
        await supabase.from("ecosystem_apps").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete note:", err);
      } finally {
        setLoading(false);
      }
    },
    [apps]
  );

  const resetToDefaults = useCallback(async (): Promise<void> => {
    setLoading(true);
    setApps(DEFAULT_ECOSYSTEM_APPS);
    saveLocalApps(DEFAULT_ECOSYSTEM_APPS);

    try {
      // Clear and re-seed
      await supabase.from("ecosystem_apps").delete().neq("id", "__keep__");
      const seeds = DEFAULT_ECOSYSTEM_APPS.map((a) => ({
        id: a.id,
        title: a.title,
        url: a.url,
        image_url: a.imageUrl,
        category: a.category,
        order_index: a.orderIndex,
      }));
      await supabase.from("ecosystem_apps").upsert(seeds);
    } catch (err) {
      console.warn("Supabase reset note:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    apps,
    loading,
    addApp,
    updateApp,
    deleteApp,
    resetToDefaults,
  };
}
