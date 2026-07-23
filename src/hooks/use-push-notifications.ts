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
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      const state = getNotificationPermissionState();
      setPermission(state);

      if (state === "granted") {
        registerPushServiceWorker();
      }
    }
  }, []);

  // Listen to Supabase real-time updates for website bookings and new activities
  useEffect(() => {
    if (!isSupported || permission !== "granted") return;

    // Listen to activities table (where all new booking/lead events log)
    const activitiesChannel = supabase
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

    // Listen to leads table directly (when a booking form creates a new lead)
    const leadsChannel = supabase
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

    // Listen to website_inquiries table (when someone submits via website chat flow)
    const inquiriesChannel = supabase
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

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(inquiriesChannel);
    };
  }, [isSupported, permission]);

  const enableNotifications = async () => {
    const success = await requestNotificationPermission();
    if (success) {
      setPermission("granted");
    } else {
      setPermission(getNotificationPermissionState());
    }
    return success;
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
