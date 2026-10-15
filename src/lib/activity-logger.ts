import { supabase } from "@/lib/supabase";

export interface LogActivityParams {
  type: "payment" | "project" | "lead" | "client" | "task" | "expense" | "invoice" | "document" | "note" | "calendar" | string;
  message: string;
  actor?: string;
}

export async function logActivity({ type, message, actor }: LogActivityParams): Promise<void> {
  try {
    let currentActor = actor;
    if (!currentActor) {
      try {
        const partnerRaw = localStorage.getItem("dk_partner_session");
        if (partnerRaw) {
          currentActor = JSON.parse(partnerRaw)?.displayName;
        }
      } catch {}
    }
    if (!currentActor) {
      const preferred = localStorage.getItem("duokarma_preferred_partner");
      currentActor = preferred === "moiz" ? "Moiz" : "Hatim";
    }

    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const { error } = await supabase.from("activities").insert({
      id,
      type,
      message,
      actor: currentActor,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.warn("[logActivity] Supabase notice:", error.message);
    }
  } catch (err) {
    console.warn("[logActivity] Exception logging activity:", err);
  }
}
