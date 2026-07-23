import { supabase } from "./supabase";

export interface PushNotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Check if the browser supports push notifications and service workers
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current notification permission state
 */
export function getNotificationPermissionState(): NotificationPermission | "unsupported" {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Register service worker for background push alerts
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("[PushNotifications] Service worker registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("[PushNotifications] Service worker registration failed:", error);
    return null;
  }
}

/**
 * Request notification permission from user and save state
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    alert("Push notifications are not supported on this browser/device.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem("duo_push_permission", permission);

    if (permission === "granted") {
      await registerPushServiceWorker();
      
      // Save push token / device registration to Supabase push_subscriptions table
      try {
        const userAgent = navigator.userAgent;
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
    } else if (permission === "denied") {
      alert("Notification permission was denied. Please enable notifications in your phone's browser settings.");
    }
  } catch (error) {
    console.error("[PushNotifications] Error requesting permission:", error);
  }

  return false;
}

/**
 * Display a push notification to user's screen (mobile phone or desktop)
 */
export async function showPushNotification(data: PushNotificationData): Promise<void> {
  if (!isPushNotificationSupported() || Notification.permission !== "granted") {
    console.log("[PushNotifications] Cannot show notification - permission not granted or unsupported.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration && registration.active) {
      // Use service worker to trigger mobile lockscreen push notification
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
    } else {
      // Fallback native Notification
      new Notification(data.title, {
        body: data.body,
        icon: data.icon || "/logo.jpeg",
      });
    }
  } catch (error) {
    console.error("[PushNotifications] Error showing notification:", error);
  }
}
