import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Video,
  Send,
  Building2,
  Calendar,
  Download,
  FileText,
  ShieldCheck,
  CheckCheck,
  ArrowRight,
  UserCheck,
  Smile,
  Paperclip,
  Check,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — Configurable for any luxury real estate client
// ─────────────────────────────────────────────────────────────────────────────
interface ClientBrandConfig {
  name: string;
  legalName: string;
  tagline: string;
  location: string;
  phone: string;
  licenseNumber: string;
  brochureTitle: string;
  brochureProject: string;
  startingPrice: string;
  initials: string;
}

const DEFAULT_CLIENT: ClientBrandConfig = {
  name: "Al Sayab Luxury Concierge",
  legalName: "Al Sayab Real Estate Dubai",
  tagline: "Exclusive Off-Plan & Waterfront Residences",
  location: "Port Saeed, Deira, Dubai",
  phone: "+971 50 989 0782",
  licenseNumber: "ORN 28419",
  brochureTitle: "Sky_Crescent_Downtown_Dubai.pdf",
  brochureProject: "The Sky Crescent • Downtown Dubai",
  startingPrice: "AED 1,450,000",
  initials: "AS",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text?: string;
  time: string;
  type?: "text" | "brochure" | "payment_plan" | "booking_confirm";
  meta?: Record<string, string>;
}

interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  origin: string;
  flag: string;
  budget: string;
  project: string;
  stage: "inquiry" | "qualified" | "viewing" | "broker";
  status: string;
  leadScore: number;
  speedToLead: string;
  lastAction: string;
  assignedBroker?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function DubaiRealEstateDemoPage() {
  const client = DEFAULT_CLIENT;

  // ── Conversation & Automation State ──────────────────────────────────────
  const [step, setStep] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeHighlight, setActiveHighlight] = useState<boolean>(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initial WhatsApp messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "user",
      text: "Hi! Saw your new launch projects on Instagram. Can you send the brochure & starting prices?",
      time: "11:42 PM",
      type: "text",
    },
    {
      id: "msg-2",
      sender: "bot",
      text: `Marhaba & welcome to ${client.legalName}! ✨\n\nWe have priority allocations for upcoming launches across Downtown Dubai & Dubai Marina starting from ${client.startingPrice}.\n\nWhich residential collection are you interested in?`,
      time: "11:42 PM",
      type: "text",
    },
  ]);

  // Lead pipeline state
  const [leads, setLeads] = useState<LeadRecord[]>([
    {
      id: "lead-james",
      name: "James Harrington",
      phone: "+44 7911 204918",
      origin: "London, UK",
      flag: "🇬🇧",
      budget: "AED 2.0M – 4.5M",
      project: "The Sky Crescent • Downtown",
      stage: "inquiry",
      status: "AI Concierge Active",
      leadScore: 78,
      speedToLead: "0.8s response",
      lastAction: "Inquiry received via Instagram Ad",
    },
    {
      id: "lead-sophie",
      name: "Sophie Laurent",
      phone: "+33 6 12 34 56 78",
      origin: "Paris, France",
      flag: "🇫🇷",
      budget: "AED 3,200,000",
      project: "Palm Jumeirah Residences",
      stage: "inquiry",
      status: "AI Engaging",
      leadScore: 81,
      speedToLead: "0.9s response",
      lastAction: "Catalog request sent",
    },
    {
      id: "lead-elena",
      name: "Dr. Elena Rostova",
      phone: "+49 170 829 104",
      origin: "Munich, Germany",
      flag: "🇩🇪",
      budget: "AED 3,800,000",
      project: "Business Bay 2BR High-Floor",
      stage: "qualified",
      status: "Brochure & ROI Matrix Dispatched",
      leadScore: 88,
      speedToLead: "1.1s response",
      lastAction: "Selected Golden Visa Criteria",
    },
    {
      id: "lead-tariq",
      name: "Tariq Al-Mansoor",
      phone: "+971 55 491 8820",
      origin: "Abu Dhabi, UAE",
      flag: "🇦🇪",
      budget: "AED 7,500,000",
      project: "Palm Jumeirah Waterfront Villa",
      stage: "viewing",
      status: "Saturday 4:00 PM Confirmed",
      leadScore: 96,
      speedToLead: "1.0s response",
      lastAction: "VIP Gate Pass Issued",
      assignedBroker: "Tariq Al-Sayed",
    },
    {
      id: "lead-siddharth",
      name: "Siddharth Mehta",
      phone: "+91 98201 44920",
      origin: "Mumbai, India",
      flag: "🇮🇳",
      budget: "AED 2,400,000",
      project: "Downtown Burj View 1BR",
      stage: "broker",
      status: "Handover to Senior Broker",
      leadScore: 92,
      speedToLead: "0.7s response",
      lastAction: "Direct broker briefing delivered",
      assignedBroker: "Kareem Zaid",
    },
  ]);

  // Auto-scroll chat inside phone
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Secret reset listener (Shift+R) for recording rehearsals without any visible developer button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.shiftKey && e.key.toLowerCase() === "r") || (e.altKey && e.key.toLowerCase() === "r")) {
        resetDemo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const resetDemo = () => {
    setStep(0);
    setIsTyping(false);
    setActiveHighlight(true);
    setMessages([
      {
        id: "msg-1",
        sender: "user",
        text: "Hi! Saw your new launch projects on Instagram. Can you send the brochure & starting prices?",
        time: "11:42 PM",
        type: "text",
      },
      {
        id: "msg-2",
        sender: "bot",
        text: `Marhaba & welcome to ${client.legalName}! ✨\n\nWe have priority allocations for upcoming launches across Downtown Dubai & Dubai Marina starting from ${client.startingPrice}.\n\nWhich residential collection are you interested in?`,
        time: "11:42 PM",
        type: "text",
      },
    ]);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === "lead-james"
          ? {
              ...l,
              stage: "inquiry",
              budget: "AED 2.0M – 4.5M",
              status: "AI Concierge Active",
              leadScore: 78,
              lastAction: "Inquiry received via Instagram Ad",
              assignedBroker: undefined,
            }
          : l
      )
    );
  };

  // ── Step 1: User picks property collection ────────────────────────────────
  const handleSelectCollection = (collectionName: string, budgetRange: string) => {
    if (step >= 1) return;
    setStep(1);

    // 1. Post user message
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: "user",
        text: collectionName,
        time: "11:43 PM",
        type: "text",
      },
    ]);

    // 2. Immediately move James Harrington in CRM to "Qualified & Brochure Sent"
    setLeads((prev) =>
      prev.map((l) =>
        l.id === "lead-james"
          ? {
              ...l,
              budget: budgetRange,
              stage: "qualified",
              status: "Brochure & 80/20 Plan Sent",
              leadScore: 86,
              lastAction: `Selected ${collectionName}`,
            }
          : l
      )
    );

    // 3. Show AI typing indicator, then deliver brochure + payment plan + qualification question
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-brochure-${Date.now()}`,
          sender: "bot",
          type: "brochure",
          time: "11:43 PM",
          meta: {
            title: client.brochureTitle,
            project: client.brochureProject,
            price: client.startingPrice,
          },
        },
        {
          id: `bot-plan-${Date.now()}`,
          sender: "bot",
          type: "payment_plan",
          time: "11:43 PM",
          meta: {
            name: "80 / 20 Developer Direct Plan",
            booking: "10% on Booking Reservation",
            construction: "1% Monthly Construction Linked",
            handover: "20% on Handover (Q4 2027)",
            incentive: "0% Brokerage Commission • 100% Free DLD Registration Waiver",
          },
        },
        {
          id: `bot-q1-${Date.now()}`,
          sender: "bot",
          text: "Are you purchasing for high-yield investment returns, or personal residence & UAE Golden Visa?",
          time: "11:43 PM",
          type: "text",
        },
      ]);
    }, 900);
  };

  // ── Step 2: User qualifies intent (Investment vs Residence) ───────────────
  const handleSelectIntent = (intentLabel: string) => {
    if (step >= 2) return;
    setStep(2);

    setMessages((prev) => [
      ...prev,
      {
        id: `u-intent-${Date.now()}`,
        sender: "user",
        text: intentLabel,
        time: "11:44 PM",
        type: "text",
      },
    ]);

    // Update CRM score & status
    setLeads((prev) =>
      prev.map((l) =>
        l.id === "lead-james"
          ? {
              ...l,
              leadScore: 92,
              status: "High-Yield Profile Confirmed",
              lastAction: "Target: 9.4% Projected Net Yield",
            }
          : l
      )
    );

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-roi-${Date.now()}`,
          sender: "bot",
          text: `Downtown units in this launch are generating 8.8% – 10.4% net rental yields with high short-term demand.\n\nOur Senior Off-Plan Director (Mr. Tariq Al-Sayed) has private reservation allocations tomorrow. Would you like to reserve a 15-minute VIP video walkthrough or an in-person viewing?`,
          time: "11:44 PM",
          type: "text",
        },
      ]);
    }, 900);
  };

  // ── Step 3: Schedule VIP viewing ─────────────────────────────────────────
  const handleScheduleViewing = (slotTime: string) => {
    if (step >= 3) return;
    setStep(3);

    setMessages((prev) => [
      ...prev,
      {
        id: `u-slot-${Date.now()}`,
        sender: "user",
        text: `Please book ${slotTime} — Private VIP Walkthrough`,
        time: "11:45 PM",
        type: "text",
      },
    ]);

    // Move James to "Viewing Scheduled" (Stage 3)
    setLeads((prev) =>
      prev.map((l) =>
        l.id === "lead-james"
          ? {
              ...l,
              stage: "viewing",
              status: `${slotTime} • Confirmed`,
              leadScore: 96,
              lastAction: "VIP Gate Pass DXB-8821 Issued",
              assignedBroker: "Tariq Al-Sayed",
            }
          : l
      )
    );

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-booked-${Date.now()}`,
          sender: "bot",
          type: "booking_confirm",
          time: "11:45 PM",
          meta: {
            code: "DXB-VIP-8821",
            slot: `${slotTime} (Dubai GST)`,
            broker: "Tariq Al-Sayed (Managing Broker)",
            location: client.location,
          },
        },
        {
          id: `bot-final-${Date.now()}`,
          sender: "bot",
          text: `Your reservation is confirmed! The calendar invite and VIP access credentials have been sent directly to your WhatsApp. Mr. Tariq looks forward to presenting the project.`,
          time: "11:45 PM",
          type: "text",
        },
      ]);
    }, 1000);
  };

  // ── Step 4: Complete Handover to Broker Desk ──────────────────────────────
  const handleAssignToBroker = () => {
    if (step >= 4) return;
    setStep(4);

    // Move James Harrington to Stage 4: Broker Follow-Up
    setLeads((prev) =>
      prev.map((l) =>
        l.id === "lead-james"
          ? {
              ...l,
              stage: "broker",
              status: "Assigned to Tariq Al-Sayed",
              leadScore: 98,
              lastAction: "Full WhatsApp Dossier Delivered to Broker",
              assignedBroker: "Tariq Al-Sayed",
            }
          : l
      )
    );
  };

  const getLeadsByStage = (stage: LeadRecord["stage"]) =>
    leads.filter((lead) => lead.stage === stage);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ height: "100dvh" }}
      className="flex flex-col overflow-hidden bg-[#07090E] text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-200 antialiased"
    >
      {/* ── TOP HEADER (Compact, Dignified, Client-Facing) ───────────────── */}
      <header className="flex-none h-13 border-b border-white/[0.08] bg-[#0A0D15]/95 backdrop-blur-md z-30 px-6">
        <div className="max-w-[1680px] h-full mx-auto flex items-center justify-between gap-6">
          {/* Client Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={resetDemo}
              title="Click to reset demo"
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
            </div>

            <div className="min-w-0 flex items-center gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[14px] font-semibold text-white tracking-tight leading-none truncate">
                    {client.legalName}
                  </h1>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 leading-none mt-1">
                  {client.location}
                  <span className="mx-1.5 text-slate-600">•</span>
                  <span className="font-mono text-slate-300">{client.phone}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Product Identity */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span className="text-[12px] font-medium text-slate-200 tracking-wide">
              WhatsApp Automation CRM
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 tracking-wider uppercase">
              Real Estate Suite
            </span>
          </div>

          {/* Cloud API Status */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-emerald-400">Live WhatsApp Cloud API</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">Bi-Directional CRM Sync</span>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE (Single-Screen Split: 40% Phone / 60% Pipeline) ─ */}
      <main className="flex-1 min-h-0 max-w-[1680px] w-full mx-auto grid grid-cols-12 gap-5 px-6 py-4 overflow-hidden">
        
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: WhatsApp AI Concierge (5 cols)                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-5 flex flex-col min-h-0">
          {/* Section Header */}
          <div className="flex-none flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <h2 className="text-[12px] font-semibold text-slate-200 uppercase tracking-wider">
                WhatsApp AI Concierge
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Prospect Conversation View
            </span>
          </div>

          {/* Phone Shell Container */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div
              className="relative flex flex-col w-full max-w-[390px] h-full max-h-[660px] rounded-[32px] border-[3px] border-[#1C2433] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
              style={{ background: "#0A0E17" }}
            >
              {/* Phone Speaker Notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 w-20 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-10 h-1 bg-neutral-800 rounded-full" />
              </div>

              {/* WhatsApp Business Header Bar */}
              <div className="flex-none pt-6 pb-2.5 px-3.5 bg-[#1F2C34] flex items-center justify-between border-b border-black/40 z-20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[11px] font-bold text-slate-950 shadow">
                      {client.initials}
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1F2C34]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-semibold text-white leading-tight truncate">
                        {client.name}
                      </p>
                      <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    </div>
                    <p className="text-[10px] text-emerald-400 leading-tight font-medium mt-0.5">
                      {isTyping ? "typing…" : "Online • Verified Business Concierge"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <Video className="w-4 h-4 opacity-75" />
                  <Phone className="w-3.5 h-3.5 opacity-75" />
                </div>
              </div>

              {/* Chat Message Stream */}
              <div
                ref={chatScrollRef}
                className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5 text-[12px]"
                style={{
                  background: "#0B141A",
                  backgroundImage: "radial-gradient(#18242D 1.2px, transparent 1.2px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {/* Chat timestamp */}
                <div className="flex justify-center">
                  <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 bg-[#141F26] px-3 py-0.5 rounded-full border border-white/[0.04]">
                    Today • 11:42 PM (Dubai)
                  </span>
                </div>

                <div className="text-[10px] text-amber-300/70 text-center px-3 py-1 bg-amber-500/[0.05] rounded-lg border border-amber-500/10">
                  🔒 Verified WhatsApp Business Account • Direct Lead Capture
                </div>

                {/* Messages */}
                {messages.map((m) => {
                  const isUser = m.sender === "user";
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                          isUser
                            ? "bg-[#005C4B] text-slate-50 rounded-tr-xs"
                            : "bg-[#202C33] text-slate-100 rounded-tl-xs border border-white/[0.06]"
                        }`}
                      >
                        {/* Text Message */}
                        {m.text && (
                          <p className="whitespace-pre-line leading-relaxed text-[12px] font-normal">
                            {m.text}
                          </p>
                        )}

                        {/* Brochure PDF Card */}
                        {m.type === "brochure" && (
                          <div className="space-y-2 mt-1">
                            <div className="flex items-center gap-2.5 bg-[#111A21] rounded-xl p-2.5 border border-white/[0.08]">
                              <div className="h-8 w-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-red-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-slate-100 truncate">
                                  {m.meta?.title}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  4.8 MB • Official Project Brochure
                                </p>
                              </div>
                              <Download className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            </div>
                            <div className="text-[10px] font-medium text-amber-300 bg-amber-500/10 rounded-lg px-2 py-1 border border-amber-500/20 flex items-center justify-between">
                              <span>✦ {m.meta?.project}</span>
                              <span className="font-mono text-white font-semibold">
                                From {m.meta?.price}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Payment Plan Card */}
                        {m.type === "payment_plan" && (
                          <div className="bg-[#111A21] rounded-xl p-2.5 border border-emerald-500/25 space-y-1.5 mt-1">
                            <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                              <span className="text-[11px] font-bold text-emerald-400">
                                {m.meta?.name}
                              </span>
                              <span className="text-[9px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                                Verified Plan
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-200">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Down Payment</span>
                                <span className="font-medium text-white">{m.meta?.booking}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Installments</span>
                                <span className="font-medium text-white">
                                  {m.meta?.construction}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Handover</span>
                                <span className="font-medium text-emerald-400 font-mono">
                                  {m.meta?.handover}
                                </span>
                              </div>
                            </div>
                            <p className="text-[10px] text-amber-300 border-t border-white/[0.08] pt-1 leading-tight font-medium">
                              {m.meta?.incentive}
                            </p>
                          </div>
                        )}

                        {/* Viewing Confirmation Card */}
                        {m.type === "booking_confirm" && (
                          <div className="bg-[#111A21] rounded-xl p-2.5 border border-amber-500/30 space-y-2 mt-1">
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">
                                VIP Viewing Confirmed
                              </span>
                            </div>
                            <div className="bg-black/40 rounded-lg p-2 space-y-1 text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Pass Code</span>
                                <span className="font-mono text-amber-300 font-bold">
                                  {m.meta?.code}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Viewing Time</span>
                                <span className="text-white font-medium">{m.meta?.slot}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Assigned Broker</span>
                                <span className="text-emerald-400 font-semibold">
                                  {m.meta?.broker}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Location</span>
                                <span className="text-slate-300 truncate max-w-[170px]">
                                  {m.meta?.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Timestamp & double check */}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[9px] text-slate-400">{m.time}</span>
                          {isUser && <CheckCheck className="w-3 h-3 text-[#53BDEB]" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 bg-[#202C33] px-3 py-2 rounded-2xl rounded-tl-xs w-fit border border-white/[0.06]">
                    {[0, 0.15, 0.3].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Interactive WhatsApp Reply Options & Realistic Composer ── */}
              <div className="flex-none bg-[#111B22] border-t border-white/[0.08] p-2.5 space-y-2 z-20">
                
                {/* Step 0 Options: Property Selection */}
                {step === 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Select Property Preference:
                    </p>
                    <div className="space-y-1.5">
                      {[
                        {
                          title: "🏢 1-2 Bed Luxury Residence",
                          budget: "AED 1.45M – 2.5M",
                        },
                        {
                          title: "🏖️ Waterfront Sky Villa",
                          budget: "AED 4.2M – 6.0M",
                        },
                        {
                          title: "💼 High-ROI Investment Units",
                          budget: "AED 1.8M – 3.5M",
                        },
                      ].map((item) => (
                        <button
                          key={item.title}
                          onClick={() => handleSelectCollection(item.title, item.budget)}
                          className="w-full flex items-center justify-between bg-[#1F2C33] hover:bg-[#2A3942] active:scale-[0.98] transition-all px-3 py-2 rounded-xl border border-white/[0.08] text-[11px] text-slate-100 font-medium cursor-pointer shadow-sm"
                        >
                          <span>{item.title}</span>
                          <span className="font-mono text-amber-400 text-[10px] font-semibold">
                            {item.budget}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1 Options: Intent Qualification */}
                {step === 1 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Select Investment Purpose:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleSelectIntent("📈 High Rental Yield & Capital ROI")}
                        className="bg-[#1F2C33] hover:bg-[#2A3942] active:scale-[0.98] transition-all py-2 px-2.5 rounded-xl border border-white/[0.08] text-[11px] text-slate-100 font-medium cursor-pointer text-center shadow-sm"
                      >
                        📈 Pure Investment
                      </button>
                      <button
                        onClick={() => handleSelectIntent("🏡 Personal Residence & UAE Golden Visa")}
                        className="bg-[#1F2C33] hover:bg-[#2A3942] active:scale-[0.98] transition-all py-2 px-2.5 rounded-xl border border-white/[0.08] text-[11px] text-slate-100 font-medium cursor-pointer text-center shadow-sm"
                      >
                        🏡 Residence / Visa
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 Options: Schedule Viewing */}
                {step === 2 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Confirm Private Viewing Slot:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleScheduleViewing("Tomorrow 3:00 PM")}
                        className="bg-emerald-600/30 hover:bg-emerald-600/40 active:scale-[0.98] transition-all py-2 px-2.5 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-300 font-semibold cursor-pointer text-center shadow-sm"
                      >
                        📅 Tomorrow 3:00 PM
                      </button>
                      <button
                        onClick={() => handleScheduleViewing("Saturday 11:00 AM")}
                        className="bg-[#1F2C33] hover:bg-[#2A3942] active:scale-[0.98] transition-all py-2 px-2.5 rounded-xl border border-white/[0.08] text-[11px] text-slate-100 font-medium cursor-pointer text-center shadow-sm"
                      >
                        📅 Saturday 11:00 AM
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 Options: Transfer to Broker Desk */}
                {step === 3 && (
                  <div className="space-y-1.5">
                    <button
                      onClick={handleAssignToBroker}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 text-[11px]"
                    >
                      <UserCheck className="w-4 h-4 text-slate-950" />
                      <span>Transfer Lead to Broker Follow-Up Desk</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </button>
                  </div>
                )}

                {/* Step 4: Finished Journey */}
                {step === 4 && (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] text-emerald-300 font-semibold">
                        Lead In Broker Desk • Follow-up Active
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Sync Complete
                    </span>
                  </div>
                )}

                {/* Realistic WhatsApp Composer Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-slate-400 px-1">
                    <Smile className="w-4 h-4 cursor-pointer hover:text-slate-200" />
                    <Paperclip className="w-4 h-4 cursor-pointer hover:text-slate-200" />
                  </div>
                  <div className="flex-1 bg-[#2A3942] h-7 rounded-full px-3 flex items-center text-[10px] text-slate-400 font-normal">
                    Type a message…
                  </div>
                  <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow">
                    <Send className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: Live CRM Pipeline (7 cols, 2x2 Grid)                  */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col min-h-0">
          {/* CRM Header Bar */}
          <div className="flex-none flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <h2 className="text-[12px] font-semibold text-slate-200 uppercase tracking-wider">
                Live Agency CRM Pipeline
              </h2>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                Automated 4-Stage Routing
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">Total Active Pipeline:</span>
              <span className="text-[13px] font-bold text-amber-300 font-mono">
                AED 48,200,000
              </span>
            </div>
          </div>

          {/* 2x2 Balanced Pipeline Grid (No Empty Wasteland) */}
          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-3.5">
            
            {/* Stage 1: New Inquiry */}
            <PipelineStageCard
              stageNumber="01"
              title="New Inquiry"
              subtitle="Instant Inbound Response"
              colorTheme="sky"
              leads={getLeadsByStage("inquiry")}
              highlightId="lead-james"
              activeHighlight={activeHighlight}
            />

            {/* Stage 2: Qualified & Brochure Sent */}
            <PipelineStageCard
              stageNumber="02"
              title="Qualified & Brochure Sent"
              subtitle="Project & Plan Delivered"
              colorTheme="violet"
              leads={getLeadsByStage("qualified")}
              highlightId="lead-james"
              activeHighlight={activeHighlight}
            />

            {/* Stage 3: Viewing Scheduled */}
            <PipelineStageCard
              stageNumber="03"
              title="Viewing Scheduled"
              subtitle="VIP Walkthrough Confirmed"
              colorTheme="emerald"
              leads={getLeadsByStage("viewing")}
              highlightId="lead-james"
              activeHighlight={activeHighlight}
            />

            {/* Stage 4: Broker Follow-Up */}
            <PipelineStageCard
              stageNumber="04"
              title="Broker Follow-Up"
              subtitle="Direct Broker Handover"
              colorTheme="amber"
              leads={getLeadsByStage("broker")}
              highlightId="lead-james"
              activeHighlight={activeHighlight}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE STAGE CARD COMPONENT (2x2 Grid Tile)
// ─────────────────────────────────────────────────────────────────────────────
interface PipelineStageCardProps {
  stageNumber: string;
  title: string;
  subtitle: string;
  colorTheme: "sky" | "violet" | "emerald" | "amber";
  leads: LeadRecord[];
  highlightId: string;
  activeHighlight: boolean;
}

function PipelineStageCard({
  stageNumber,
  title,
  subtitle,
  colorTheme,
  leads,
  highlightId,
}: PipelineStageCardProps) {
  // Color configuration mapping
  const themeMap = {
    sky: {
      dot: "bg-sky-400",
      pill: "bg-sky-500/15 text-sky-300 border-sky-500/25",
      border: "border-sky-500/30",
      activeBg: "bg-sky-500/[0.04]",
    },
    violet: {
      dot: "bg-violet-400",
      pill: "bg-violet-500/15 text-violet-300 border-violet-500/25",
      border: "border-violet-500/30",
      activeBg: "bg-violet-500/[0.04]",
    },
    emerald: {
      dot: "bg-emerald-400",
      pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
      border: "border-emerald-500/40",
      activeBg: "bg-emerald-500/[0.05]",
    },
    amber: {
      dot: "bg-amber-400",
      pill: "bg-amber-500/15 text-amber-300 border-amber-500/25",
      border: "border-amber-500/30",
      activeBg: "bg-amber-500/[0.04]",
    },
  };

  const theme = themeMap[colorTheme];

  return (
    <div className="flex flex-col min-h-0 rounded-2xl border border-white/[0.08] bg-[#0A0E17] overflow-hidden shadow-sm">
      {/* Stage Header */}
      <div className="flex-none flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.07] bg-[#0E1420]">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white tracking-tight leading-none truncate">
              {stageNumber}. {title}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-1 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${theme.pill}`}>
          {leads.length} {leads.length === 1 ? "Lead" : "Leads"}
        </span>
      </div>

      {/* Leads List (Scrollable if multiple, balanced compact display) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
        {leads.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-[11px] text-slate-500">Awaiting automation trigger</p>
          </div>
        ) : (
          leads.map((lead) => {
            const isCurrentInquiry = lead.id === highlightId;

            return (
              <motion.div
                layout
                key={lead.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl p-2.5 border transition-all ${
                  isCurrentInquiry
                    ? `bg-[#0D1624] ${theme.border} ring-1 ring-amber-400/30 shadow-md shadow-black/40`
                    : "bg-[#0E131E] border-white/[0.06] hover:border-white/10"
                }`}
              >
                {/* Header: Name, Location, Score */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px]">{lead.flag}</span>
                      <p className="text-[12px] font-semibold text-white truncate">
                        {lead.name}
                      </p>
                      {isCurrentInquiry && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-full uppercase">
                          Active Chat
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {lead.phone} • {lead.origin}
                    </p>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        lead.leadScore >= 95
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : lead.leadScore >= 85
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-white/[0.06] text-slate-300 border-white/10"
                      }`}
                    >
                      Score: {lead.leadScore}
                    </span>
                  </div>
                </div>

                {/* Details: Project, Budget, Speed */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] border-t border-white/[0.06] pt-1.5 mb-1.5">
                  <div>
                    <span className="text-slate-500 block">Project</span>
                    <span className="text-slate-200 font-medium truncate block">
                      {lead.project}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Budget</span>
                    <span className="text-amber-300 font-mono font-semibold truncate block">
                      {lead.budget}
                    </span>
                  </div>
                </div>

                {/* Automation Action Status */}
                <div className="flex items-center justify-between text-[10px] bg-black/40 rounded-lg px-2.5 py-1 border border-white/[0.05]">
                  <span className="text-emerald-400 font-medium truncate">
                    {lead.status}
                  </span>
                  <span className="text-slate-400 font-mono text-[9px] flex-shrink-0 ml-1">
                    {lead.speedToLead}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
