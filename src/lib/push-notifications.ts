import { supabase } from "./supabase";

export interface PushNotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Check safely if the browser supports push notifications and service workers
 */
export function isPushNotificationSupported(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      typeof window.Notification !== "undefined" &&
      "serviceWorker" in navigator &&
      typeof navigator.serviceWorker !== "undefined"
    );
  } catch {
    return false;
  }
}

/**
 * Safely get current notification permission state
 */
export function getNotificationPermissionState(): NotificationPermission | "unsupported" {
  try {
    if (!isPushNotificationSupported()) return "unsupported";
    return window.Notification?.permission ?? "unsupported";
  } catch {
    return "unsupported";
  }
}

/**
 * Register service worker for background push alerts
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return registration;
  } catch (error) {
    console.warn("[PushNotifications] Service worker registration bypassed:", error);
    return null;
  }
}

/**
 * Request notification permission from user safely
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    try {
      localStorage.setItem("duo_push_permission", permission);
    } catch {}

    if (permission === "granted") {
      await registerPushServiceWorker();

      // Save push token / device registration to Supabase push_subscriptions table
      try {
        const userAgent = navigator?.userAgent || "mobile";
        await supabase.from("push_subscriptions").upsert(
          {
            id: `device_${Date.now()}`,
            user_agent: userAgent,
            permission: "granted",
            created_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (err) {
        console.warn("[PushNotifications] Could not save subscription to database:", err);
      }

      // Show welcome notification test
      showPushNotification({
        title: "🎉 Mobile Push Notifications Enabled!",
        body: "You will now receive instant phone alerts whenever a new booking comes via website.",
        url: "/admin/leads",
      });

      return true;
    }
  } catch (error) {
    console.warn("[PushNotifications] Error requesting permission:", error);
  }

  return false;
}

/**
 * Display a push notification safely without throwing
 */
export async function showPushNotification(data: PushNotificationData): Promise<void> {
  try {
    if (!isPushNotificationSupported() || getNotificationPermissionState() !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();

    if (registration && registration.active) {
      const options = {
        body: data.body,
        icon: data.icon || "/logo.jpeg",
        badge: "/favicon.svg",
        vibrate: [200, 100, 200],
        data: {
          url: data.url || "/admin",
        },
        tag: "duo-karma-booking",
        renotify: true,
      };
      await registration.showNotification(data.title, options as unknown as NotificationOptions);
    } else if (typeof window.Notification === "function") {
      new Notification(data.title, {
        body: data.body,
        icon: data.icon || "/logo.jpeg",
      });
    }
  } catch (error) {
    console.warn("[PushNotifications] Error showing notification:", error);
  }
}
