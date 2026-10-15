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
 * Play a gentle audio chime and mobile vibration when a notification arrives.
 * Safe across all browsers without requiring external audio assets.
 */
export function playNotificationSound(): void {
  try {
    // Vibrate device if supported
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }

    // Synthesize a pleasant two-tone chime via Web Audio API
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    // Tone 1 (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, t);
    gain1.gain.setValueAtTime(0.12, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.25);

    // Tone 2 (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, t + 0.12);
    gain2.gain.setValueAtTime(0.18, t + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.12);
    osc2.stop(t + 0.45);
  } catch {
    // Ignore audio restriction errors
  }
}

/**
 * Register service worker for background push alerts
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    try {
      await navigator.serviceWorker.ready;
    } catch {}
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


      // Show welcome notification test
      showPushNotification({
        title: "🎉 Mobile Alerts Activated!",
        body: "Both partners will receive instant notifications whenever projects are updated or bookings arrive.",
        url: "/admin",
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

    let registration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      try {
        registration = await navigator.serviceWorker.ready;
      } catch {
        registration = (await navigator.serviceWorker.getRegistration()) || undefined;
      }

      if (!registration) {
        registration = (await registerPushServiceWorker()) || undefined;
      }
    }

    const uniqueTag = `dk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const options: any = {
      body: data.body,
      icon: data.icon || "/duokarma-logo.jpeg",
      badge: "/favicon.svg",
      vibrate: [250, 100, 250, 100, 250],
      tag: uniqueTag,
      renotify: true,
      timestamp: Date.now(),
      data: {
        url: data.url || "/admin",
      },
    };

    if (registration && typeof registration.showNotification === "function") {
      await registration.showNotification(data.title, options);
      return;
    }

    // Fallback for desktop browsers where new Notification() constructor is supported.
    // Wrap in try-catch to guarantee mobile browsers (Android Chrome, iOS) never throw Illegal Constructor.
    if (typeof window !== "undefined" && "Notification" in window && typeof window.Notification === "function") {
      try {
        new window.Notification(data.title, {
          body: data.body,
          icon: data.icon || "/duokarma-logo.jpeg",
          tag: uniqueTag,
        });
      } catch (err) {
        console.warn("[PushNotifications] Desktop notification constructor fallback ignored:", err);
      }
    }
  } catch (error) {
    console.warn("[PushNotifications] Error showing notification:", error);
  }
}
