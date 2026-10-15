import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSafeToast } from "@/components/ui/toast";
import {
  isPushNotificationSupported,
  getNotificationPermissionState,
  registerPushServiceWorker,
  showPushNotification,
  requestNotificationPermission,
  playNotificationSound,
} from "@/lib/push-notifications";

interface UsePushNotificationsOptions {
  listen?: boolean;
}

export function usePushNotifications({ listen = true }: UsePushNotificationsOptions = {}) {
  const queryClient = useQueryClient();
  const toast = useSafeToast();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSupported, setIsSupported] = useState(false);
  const recentAlertsRef = useRef<Set<string>>(new Set());

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

  // Listen to Supabase real-time updates for activities, projects, tasks, leads, bookings
  useEffect(() => {
    if (!listen || !isSupported || permission !== "granted") return;

    let activitiesChannel: any = null;
    let leadsChannel: any = null;
    let inquiriesChannel: any = null;
    let projectsChannel: any = null;
    let documentsChannel: any = null;

    const suffix = Math.random().toString(36).substring(2, 9);

    const triggerNotification = ({
      title,
      body,
      url,
      dedupKey,
    }: {
      title: string;
      body: string;
      url: string;
      type?: string;
      dedupKey?: string;
    }) => {
      if (dedupKey) {
        if (recentAlertsRef.current.has(dedupKey)) return;
        recentAlertsRef.current.add(dedupKey);
        setTimeout(() => {
          recentAlertsRef.current.delete(dedupKey);
        }, 4000);
      }

      // 1. Play audio chime & vibrate device
      playNotificationSound();

      // 2. Trigger native push notification banner (mobile lockscreen / desktop OS)
      showPushNotification({
        title,
        body,
        url,
      });

      // 3. Show in-app toast notification for active screen
      toast({
        title,
        description: body,
      });

      // 4. Invalidate all relevant React Query keys so UI updates in real time for both partners
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["website_inquiries"] });
    };

    try {
      // Activities table: All partner actions (documents, notes, projects, tasks, clients, payments)
      activitiesChannel = supabase
        .channel(`push-activities-${suffix}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "activities" },
          (payload) => {
            const newActivity = payload.new;
            if (newActivity) {
              const actorSuffix = newActivity.actor ? ` (by ${newActivity.actor})` : "";
              const dedupKey = `act_${newActivity.id || newActivity.message}`;
              triggerNotification({
                title: getNotificationTitle(newActivity.type),
                body: `${newActivity.message || "New activity recorded in workspace."}${actorSuffix}`,
                url: getNotificationUrl(newActivity.type),
                type: newActivity.type,
                dedupKey,
              });
            }
          }
        )
        .subscribe();

      // Documents table changes: Real-time sync for file uploads/deletions
      documentsChannel = supabase
        .channel(`push-docs-${suffix}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "documents" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["activities"] });
            queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
          }
        )
        .subscribe();

      // Leads table: New website leads
      leadsChannel = supabase
        .channel(`push-leads-${suffix}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "leads" },
          (payload) => {
            const newLead = payload.new;
            if (newLead) {
              const dedupKey = `lead_${newLead.id || newLead.email}`;
              triggerNotification({
                title: "🔔 New Website Booking Request!",
                body: `New lead from ${newLead.name || "a visitor"} (${newLead.company || newLead.email || "Website"}).`,
                url: "/admin/leads",
                type: "lead",
                dedupKey,
              });
            }
          }
        )
        .subscribe();

      // Website Inquiries: Interactive website inquiries
      inquiriesChannel = supabase
        .channel(`push-inquiries-${suffix}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "website_inquiries" },
          (payload) => {
            const newInquiry = payload.new;
            if (newInquiry) {
              const dedupKey = `inq_${newInquiry.id || newInquiry.email}`;
              triggerNotification({
                title: "🔔 New Website Booking Request!",
                body: `New booking inquiry from ${newInquiry.name || "Visitor"} (${newInquiry.phone || newInquiry.email || "Website"}).`,
                url: "/admin/leads",
                type: "lead",
                dedupKey,
              });
            }
          }
        )
        .subscribe();

      // Projects table changes (fallback to keep query cache fresh across devices)
      projectsChannel = supabase
        .channel(`push-projects-${suffix}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "projects" },
          () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["activities"] });
            queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("[PushNotifications] Realtime channel setup skipped:", e);
    }

    // Auto-resync when returning from mobile background or re-establishing network
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries({ queryKey: ["activities"] });
        queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleVisibilityChange);

      try {
        if (activitiesChannel) supabase.removeChannel(activitiesChannel);
        if (leadsChannel) supabase.removeChannel(leadsChannel);
        if (inquiriesChannel) supabase.removeChannel(inquiriesChannel);
        if (projectsChannel) supabase.removeChannel(projectsChannel);
        if (documentsChannel) supabase.removeChannel(documentsChannel);
      } catch {}
    };
  }, [listen, isSupported, permission, queryClient, toast]);

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
    case "document":
      return "📄 Document Activity";
    case "note":
      return "📝 Note Activity";
    case "lead":
      return "🎯 New Booking / Lead Alert";
    case "payment":
      return "💳 Payment Received";
    case "project":
      return "📁 Project Update";
    case "invoice":
      return "📄 Invoice Created";
    case "client":
      return "👥 Client Update";
    case "task":
      return "✅ Task Update";
    case "expense":
      return "💸 Expense Recorded";
    default:
      return "🔔 Duo Karma Admin Alert";
  }
}

function getNotificationUrl(type: string): string {
  switch (type) {
    case "document":
      return "/admin/documents";
    case "note":
      return "/admin/notes";
    case "lead":
      return "/admin/leads";
    case "payment":
    case "invoice":
    case "expense":
      return "/admin/revenue";
    case "project":
      return "/admin/projects";
    case "client":
      return "/admin/clients";
    case "task":
      return "/admin/tasks";
    default:
      return "/admin";
  }
}
