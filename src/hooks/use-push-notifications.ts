import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  isPushNotificationSupported,
  getNotificationPermissionState,
  registerPushServiceWorker,
  showPushNotification,
  requestNotificationPermission,
} from "@/lib/push-notifications";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    try {
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const state = getNotificationPermissionState();
        setPermission(state);

        if (state === "granted") {
          registerPushServiceWorker().catch(() => {});
        }
      } else {
        setPermission("unsupported");
      }
    } catch {
      setIsSupported(false);
      setPermission("unsupported");
    }
  }, []);

  // Listen to Supabase real-time updates for website bookings and new activities
  useEffect(() => {
    if (!isSupported || permission !== "granted") return;

    let activitiesChannel: any = null;
    let leadsChannel: any = null;
    let inquiriesChannel: any = null;

    try {
      activitiesChannel = supabase
        .channel("push-notifications-activities")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "activities" },
          (payload) => {
            const newActivity = payload.new;
            if (newActivity) {
              showPushNotification({
                title: getNotificationTitle(newActivity.type),
                body: newActivity.message || "New activity recorded in Duo Karma Admin.",
                url: getNotificationUrl(newActivity.type),
              });
            }
          }
        )
        .subscribe();

      leadsChannel = supabase
        .channel("push-notifications-leads")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "leads" },
          (payload) => {
            const newLead = payload.new;
            if (newLead) {
              showPushNotification({
                title: "🔔 New Website Booking Request!",
                body: `New lead from ${newLead.name || "a visitor"} (${newLead.company || newLead.email || "Website"}).`,
                url: "/admin/leads",
              });
            }
          }
        )
        .subscribe();

      inquiriesChannel = supabase
        .channel("push-notifications-inquiries")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "website_inquiries" },
          (payload) => {
            const newInquiry = payload.new;
            if (newInquiry) {
              showPushNotification({
                title: "🔔 New Website Booking Request!",
                body: `New booking inquiry from ${newInquiry.name || "Visitor"} (${newInquiry.phone || newInquiry.email || "Website"}).`,
                url: "/admin/leads",
              });
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("[PushNotifications] Realtime channel setup skipped:", e);
    }

    return () => {
      try {
        if (activitiesChannel) supabase.removeChannel(activitiesChannel);
        if (leadsChannel) supabase.removeChannel(leadsChannel);
        if (inquiriesChannel) supabase.removeChannel(inquiriesChannel);
      } catch {}
    };
  }, [isSupported, permission]);

  const enableNotifications = async () => {
    try {
      const success = await requestNotificationPermission();
      if (success) {
        setPermission("granted");
      } else {
        setPermission(getNotificationPermissionState());
      }
      return success;
    } catch {
      return false;
    }
  };

  return {
    isSupported,
    permission,
    isEnabled: permission === "granted",
    enableNotifications,
  };
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case "lead":
      return "🎯 New Booking / Lead Alert";
    case "payment":
      return "💳 Payment Received";
    case "project":
      return "📁 Project Update";
    case "invoice":
      return "📄 Invoice Created";
    default:
      return "🔔 Duo Karma Admin Alert";
  }
}

function getNotificationUrl(type: string): string {
  switch (type) {
    case "lead":
      return "/admin/leads";
    case "payment":
    case "invoice":
      return "/admin/revenue";
    case "project":
      return "/admin/projects";
    default:
      return "/admin";
  }
}
