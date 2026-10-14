import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { 
  SwipeCards, 
  type SwipeCardsRef, 
  type SwipeCardItem 
} from '@/components/ui/image-stack-carousel';
import { 
  ChevronRight, 
  ChevronLeft,
  Scissors, 
  Building2, 
  BarChart3, 
  Target, 
  Package, 
  Zap, 
  Dumbbell, 
  Stethoscope, 
  UtensilsCrossed,
  ArrowRight,
  Hand,
  type LucideIcon
} from 'lucide-react';

interface ModuleCardItem extends SwipeCardItem {
  id: string;
  name: string;
  tag: string;
  code: string;
  detail: string;
  metric: { value: string; label: string };
  highlights: string[];
  icon: LucideIcon;
  blueprintType: 'salon' | 'farmhouse' | 'dashboards' | 'crm' | 'inventory' | 'automation' | 'gym' | 'clinic' | 'restaurant';
}

const MODULE_DATA: ModuleCardItem[] = [
  {
    id: 'salon',
    name: "Salon Management",
    tag: "Multi-Location",
    code: "SYS-01 // SALON-CORE",
    detail: "Appointments, staff schedules, service menus, and client history in one live system.",
    metric: { value: "+42%", label: "Daily Booking Velocity" },
    highlights: ["Multi-Branch Sync", "Staff Commission Engine", "WhatsApp Reminders", "Client Formula History"],
    icon: Scissors,
    blueprintType: 'salon',
  },
  {
    id: 'farmhouse',
    name: "Farmhouse Booking",
    tag: "Hospitality",
    code: "SYS-02 // GUEST-ENGINE",
    detail: "Public booking engine with availability calendars, pricing rules, and instant confirmations.",
    metric: { value: "0 hrs", label: "Manual Phone-Tag Coordination" },
    highlights: ["Dynamic Weekend Rates", "Live Availability Matrix", "Automated Gate Codes", "Instant WhatsApp Receipts"],
    icon: Building2,
    blueprintType: 'farmhouse',
  },
  {
    id: 'dashboards',
    name: "Business Dashboards",
    tag: "Executive Analytics",
    code: "SYS-03 // OWNER-VIEW",
    detail: "Real-time views into revenue, bookings, and operations — built around how owners actually check numbers.",
    metric: { value: "< 80ms", label: "P&L Metric Refresh SLA" },
    highlights: ["Consolidated Bank Feeds", "Expense Leakage Alerts", "Role-Based Permissions", "Nightly PDF Executive Brief"],
    icon: BarChart3,
    blueprintType: 'dashboards',
  },
  {
    id: 'crm',
    name: "CRM Systems",
    tag: "Client Pipelines",
    code: "SYS-04 // PIPELINE-PRO",
    detail: "Track leads, clients, and follow-ups without a spreadsheet duct-taped to email.",
    metric: { value: "3.4x", label: "Lead-to-Close Velocity" },
    highlights: ["Visual Funnel Stages", "Auto-Enrich Contacts", "1-Click WhatsApp Direct", "Automated Stale-Lead Pings"],
    icon: Target,
    blueprintType: 'crm',
  },
  {
    id: 'inventory',
    name: "Inventory & Billing",
    tag: "Commerce & POS",
    code: "SYS-05 // STOCK-LEDGER",
    detail: "Stock levels, invoicing, and POS flows that stay in sync with what's actually sold.",
    metric: { value: "99.9%", label: "Inventory Count Accuracy" },
    highlights: ["Barcode Scanner API", "Low-Stock Push Alerts", "Instant GST E-Invoicing", "Supplier Purchase Orders"],
    icon: Package,
    blueprintType: 'inventory',
  },
  {
    id: 'automation',
    name: "Business Automation",
    tag: "Workflow Engine",
    code: "SYS-06 // FLOW-NEXUS",
    detail: "Notifications, reminders, and workflows that remove the manual middle step.",
    metric: { value: "18 hrs", label: "Weekly Manual Labor Saved" },
    highlights: ["Webhook Ingestion Engine", "Multi-Branch Logic Flow", "Self-Healing Worker Queues", "Slack & WhatsApp Triggers"],
    icon: Zap,
    blueprintType: 'automation',
  },
  {
    id: 'gym',
    name: "Gym Management",
    tag: "Health & Fitness",
    code: "SYS-07 // FITNESS-PASS",
    detail: "Member subscriptions, class scheduling, and automated billing for fitness centers.",
    metric: { value: "94%", label: "On-Time Renewal Rate" },
    highlights: ["Turnstile RFID Hardware API", "Class Capacity Engine", "Recurring Auto-Debit", "Trainer Roster Sync"],
    icon: Dumbbell,
    blueprintType: 'gym',
  },
  {
    id: 'clinic',
    name: "Clinic Management",
    tag: "Healthcare",
    code: "SYS-08 // CLINIC-VAULT",
    detail: "Patient records, appointment scheduling, secure billing, and automated reminders.",
    metric: { value: "0 min", label: "Patient Record Retrieval" },
    highlights: ["Encrypted Health Vault", "Live Token Queue Display", "Digital Rx Generator", "Diagnostic Lab Webhook"],
    icon: Stethoscope,
    blueprintType: 'clinic',
  },
  {
    id: 'restaurant',
    name: "Restaurant Systems",
    tag: "F&B Operations",
    code: "SYS-09 // DINE-CORE",
    detail: "Table reservations, digital menus, order management, and seamless POS integration.",
    metric: { value: "-22%", label: "Order-to-Table Turnaround" },
    highlights: ["Kitchen Display System (KDS)", "Live Floor Plan Table Map", "QR Self-Ordering", "Split-Bill POS Integration"],
    icon: UtensilsCrossed,
    blueprintType: 'restaurant',
  },
];

/* ─── Blueprint Mockup Sub-Components inside Cards ─── */
const BlueprintMockup = memo(function BlueprintMockup({ type }: { type: ModuleCardItem['blueprintType'] }) {
  switch (type) {
    case 'salon':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>STATION 01 // HAIRSTYLIST</span>
            <span className="text-[#AFDDFF]">LIVE</span>
          </div>
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between bg-white/[0.03] p-1.5 rounded border border-white/5">
              <span className="text-white/80">11:30 AM • Balayage + Cut</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px]">IN SERVICE</span>
            </div>
            <div className="flex items-center justify-between bg-white/[0.03] p-1.5 rounded border border-white/5">
              <span className="text-white/80">01:15 PM • Keratin Touchup</span>
              <span className="text-[#AFDDFF] bg-[#AFDDFF]/10 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px]">CONFIRMED</span>
            </div>
          </div>
        </div>
      );
    case 'farmhouse':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>AVAILABILITY CALENDAR</span>
            <span className="text-[#86EFAC]">SYNCED</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center text-[9px] sm:text-[10px]">
            <div className="bg-white/5 p-1 rounded text-white/40">Thu 15</div>
            <div className="bg-[#AFDDFF]/15 border border-[#AFDDFF]/30 p-1 rounded text-[#AFDDFF] font-semibold">Fri 16</div>
            <div className="bg-[#AFDDFF]/15 border border-[#AFDDFF]/30 p-1 rounded text-[#AFDDFF] font-semibold">Sat 17</div>
            <div className="bg-white/5 p-1 rounded text-white/40">Sun 18</div>
          </div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/70 pt-1 border-t border-white/5">
            <span>Weekend: $320/night</span>
            <span className="text-emerald-400">Gate #881 Locked</span>
          </div>
        </div>
      );
    case 'dashboards':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>REVENUE TRAJECTORY (MRR)</span>
            <span className="text-emerald-400 font-semibold">+24.8%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-white">$142,850</span>
            <span className="text-[9px] sm:text-[10px] text-white/40">3 entities</span>
          </div>
          <div className="h-5 sm:h-6 w-full flex items-end gap-1 pt-1">
            {[35, 45, 40, 60, 55, 75, 70, 85, 95, 100].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-t transition-all"
                style={{ 
                  height: `${h}%`, 
                  background: i === 9 ? '#AFDDFF' : 'rgba(175, 221, 255, 0.25)' 
                }} 
              />
            ))}
          </div>
        </div>
      );
    case 'crm':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>PIPELINE VELOCITY</span>
            <span className="text-[#AFDDFF]">AUTO-SYNC</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[8px] sm:text-[9px]">
            <div className="bg-white/[0.04] p-1.5 rounded border border-white/5">
              <div className="text-white/40">LEADS</div>
              <div className="text-white font-semibold text-xs">28</div>
            </div>
            <div className="bg-[#AFDDFF]/10 p-1.5 rounded border border-[#AFDDFF]/20">
              <div className="text-[#AFDDFF]/70">DISCOVERY</div>
              <div className="text-[#AFDDFF] font-semibold text-xs">14</div>
            </div>
            <div className="bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
              <div className="text-emerald-400/70">CLOSED</div>
              <div className="text-emerald-400 font-semibold text-xs">$94k</div>
            </div>
          </div>
        </div>
      );
    case 'inventory':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>STOCK MONITOR // POS SYNC</span>
            <span className="text-amber-400 text-[8px] sm:text-[9px]">1 REORDER ALERT</span>
          </div>
          <div className="space-y-1 text-[9px] sm:text-[10px]">
            <div className="flex justify-between items-center text-white/70">
              <span>SKU-904 Ceramic Glaze</span>
              <span className="text-white">142 units</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[78%]" />
            </div>
            <div className="flex justify-between items-center text-white/70 pt-1">
              <span>SKU-412 Resin Pack</span>
              <span className="text-amber-400">12 units (Low)</span>
            </div>
          </div>
        </div>
      );
    case 'automation':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>WORKFLOW TRIGGER GRAPH</span>
            <span className="text-[#AFDDFF]">0 MS DRIFT</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] text-white/80 overflow-x-auto py-1">
            <span className="bg-white/10 px-2 py-1 rounded">Order Paid</span>
            <span className="text-[#AFDDFF]">→</span>
            <span className="bg-[#AFDDFF]/15 text-[#AFDDFF] px-2 py-1 rounded">Generate PDF</span>
            <span className="text-[#AFDDFF]">→</span>
            <span className="bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded">WhatsApp</span>
          </div>
        </div>
      );
    case 'gym':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>TURNSTILE RFID // LIVE ACCESS</span>
            <span className="text-emerald-400">GATE ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-white font-bold text-sm sm:text-base">184</span>
              <span className="text-white/50 text-[9px] sm:text-[10px] ml-1">in gym</span>
            </div>
            <div className="text-right text-[9px] sm:text-[10px] text-white/70">
              <div>HIIT Class • 06:00 PM</div>
              <div className="text-[#AFDDFF]">26/30 Registered</div>
            </div>
          </div>
        </div>
      );
    case 'clinic':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>PATIENT QUEUE DISPATCH</span>
            <span className="text-[#AFDDFF]">TOKEN #14</span>
          </div>
          <div className="space-y-1 text-[9px] sm:text-[10px]">
            <div className="flex justify-between items-center bg-white/[0.03] p-1.5 rounded border border-white/5">
              <span className="text-white/80">Dr. Mehta • Room 2</span>
              <span className="text-emerald-400 font-semibold">IN-CABIN</span>
            </div>
            <div className="flex justify-between items-center text-white/50 px-1">
              <span>Next: Token #15 (Waiting: 4m)</span>
              <span className="text-[#AFDDFF]">256-bit EMR</span>
            </div>
          </div>
        </div>
      );
    case 'restaurant':
      return (
        <div className="bg-black/40 rounded-xl p-2.5 sm:p-3 border border-white/5 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center justify-between text-white/50 text-[9px] sm:text-[10px]">
            <span>KITCHEN DISPLAY // FLOOR MAP</span>
            <span className="text-emerald-400">8 TABLES BUSY</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[8px] sm:text-[9px]">
            <div className="bg-white/[0.04] p-1 rounded border border-white/5">
              <div className="text-[#AFDDFF] font-semibold">Table 04 • 4p</div>
              <div className="text-white/60">Mains Dispatched</div>
            </div>
            <div className="bg-white/[0.04] p-1 rounded border border-white/5">
              <div className="text-amber-400 font-semibold">Table 07 • 2p</div>
              <div className="text-white/60">Bill Requested</div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
});

export function WhatWeBuild() {
  const [activeItem, setActiveItem] = useState<ModuleCardItem>(MODULE_DATA[0]);
  const swipeCardsRef = useRef<SwipeCardsRef>(null);

  // Active index for indicator
  const activeIndex = MODULE_DATA.findIndex((m) => m.id === activeItem.id);

  // Keyboard navigation support
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      swipeCardsRef.current?.next();
    } else if (e.key === 'ArrowLeft') {
      swipeCardsRef.current?.prev();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-10 lg:px-12"
      style={{ background: COLORS.surface }}
      id="work"
    >
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute top-10 left-1/4 -translate-x-1/2 w-[600px] h-[350px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(175,221,255,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1320px] mx-auto w-full">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-white/[0.08] gap-3">
            <div>
              <Eyebrow>What we build</Eyebrow>
              <h2
                className="text-2xl sm:text-3xl md:text-5xl font-normal tracking-tight mt-1 sm:mt-2"
                style={{
                  fontFamily: "'Fraunces', serif",
                  background: 'linear-gradient(135deg, #FFFFFF 30%, #D8EDFF 70%, #AFDDFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Nine kinds of systems, one build quality.
              </h2>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] sm:text-xs text-white/50 font-mono tracking-wider uppercase">
                Interactive Deck
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </Reveal>

        {/* ── MOBILE / TABLET VIEW (<1024px): FITS PERFECTLY IN ONE SINGLE SCREEN ── */}
        <div className="flex flex-col items-center lg:hidden w-full">
          {/* Swipeable 3D Deck */}
          <div className="relative w-full flex items-center justify-center my-2">
            <SwipeCards
              ref={swipeCardsRef}
              cards={MODULE_DATA}
              settings={{
                width: 330,
                height: 380,
                radius: 20,
                swipeThreshold: 70,
                stackRotation: 3,
                stackScale: 0.035,
                tiltStrength: 15,
                mobileBreakpoint: 480,
                mobileScale: 0.9,
              }}
              onCardChange={(card) => {
                setActiveItem(card as ModuleCardItem);
              }}
              renderCard={(card, _index, isFront) => {
                const m = card as ModuleCardItem;
                const IconComp = m.icon;

                return (
                  <div
                    className="relative w-full h-full p-5 flex flex-col justify-between overflow-hidden select-none"
                    style={{
                      background: 'linear-gradient(145deg, rgba(20, 26, 36, 0.96) 0%, rgba(10, 13, 18, 0.98) 100%)',
                      border: isFront
                        ? '1px solid rgba(175, 221, 255, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: isFront
                        ? '0 16px 40px rgba(0,0,0,0.8), 0 0 25px rgba(175,221,255,0.06)'
                        : '0 8px 24px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* Header Row */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#AFDDFF]/10 border border-[#AFDDFF]/25 flex items-center justify-center text-[#AFDDFF]">
                          <IconComp className="w-4.5 h-4.5 text-[#AFDDFF]" strokeWidth={1.8} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#AFDDFF]/10 text-[#AFDDFF] border border-[#AFDDFF]/25">
                            {m.tag}
                          </span>
                          <span className="text-[10px] text-white/50 font-mono">
                            0{MODULE_DATA.findIndex((it) => it.id === m.id) + 1}/09
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg font-normal text-white mb-1"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {m.name}
                      </h3>

                      <p className="text-[11px] text-white/70 leading-relaxed font-sans mb-2 line-clamp-2">
                        {m.detail}
                      </p>
                    </div>

                    {/* Live Blueprint Graphical Mockup */}
                    <div className="my-auto py-1">
                      <BlueprintMockup type={m.blueprintType} />
                    </div>

                    {/* Bottom Metric & Action */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-[#AFDDFF] font-medium">
                        <span className="font-mono text-white/90 font-bold">{m.metric.value}</span>
                        <span className="text-[10px] text-white/50">{m.metric.label.split(' ')[0]}</span>
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">
                        Swipe to flip
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>

          {/* Compact Mobile Controls Bar */}
          <div className="flex items-center justify-between w-full max-w-[340px] px-2 mt-3 mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => swipeCardsRef.current?.prev()}
                aria-label="Previous card"
                className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => swipeCardsRef.current?.next()}
                aria-label="Next card"
                className="w-8 h-8 rounded-lg bg-[#AFDDFF]/15 border border-[#AFDDFF]/35 flex items-center justify-center text-[#AFDDFF] active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center font-mono text-[11px] text-white/60">
              <span className="text-[#AFDDFF] font-semibold">{activeItem.name}</span>
            </div>

            <span className="text-[10px] text-white/40 font-mono">
              {activeIndex + 1}/09
            </span>
          </div>

          {/* Horizontal Quick-Select Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full py-1.5 px-2 scrollbar-none justify-start sm:justify-center">
            {MODULE_DATA.map((m) => {
              const isSelected = m.id === activeItem.id;
              return (
                <button
                  key={m.id}
                  onClick={() => swipeCardsRef.current?.bringToFront(m.id)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                    isSelected
                      ? 'bg-[#AFDDFF]/20 text-[#AFDDFF] border border-[#AFDDFF]/40 font-semibold'
                      : 'bg-white/[0.04] text-white/50 border border-white/5'
                  }`}
                >
                  {m.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DESKTOP VIEW (>=1024px): EXPANSIVE DUAL-COLUMN LAYOUT ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT COLUMN: System Inspector + 3x3 Matrix + Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Active System Details Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(20, 25, 34, 0.85) 0%, rgba(10, 12, 16, 0.95) 100%)',
                  border: '1px solid rgba(175, 221, 255, 0.22)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-mono tracking-widest text-[#AFDDFF]">
                    {activeItem.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#AFDDFF]/10 text-[#AFDDFF] border border-[#AFDDFF]/30">
                    {activeItem.tag}
                  </span>
                </div>

                {/* Big System Title */}
                <h3
                  className="text-2xl font-normal text-white mb-2"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {activeItem.name}
                </h3>

                <p className="text-xs md:text-sm text-white/70 leading-relaxed font-sans mb-5">
                  {activeItem.detail}
                </p>

                {/* Key Metric Callout */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                      Measured Impact
                    </div>
                    <div className="text-xs text-white/80 mt-0.5 font-medium">
                      {activeItem.metric.label}
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#AFDDFF]">
                    {activeItem.metric.value}
                  </div>
                </div>

                {/* Architecture Highlights Chips */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Core Capabilities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeItem.highlights.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-0.5 rounded-md text-[11px] bg-white/[0.04] text-white/80 border border-white/10"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Interactive 3x3 Selector Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/50 font-mono">
                <span>QUICK SYSTEM SELECTOR</span>
                <span>{activeIndex + 1} of {MODULE_DATA.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MODULE_DATA.map((m, idx) => {
                  const isSelected = m.id === activeItem.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        swipeCardsRef.current?.bringToFront(m.id);
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs font-mono transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#AFDDFF]/15 border-[#AFDDFF]/50 text-white shadow-md shadow-[#AFDDFF]/10 scale-[1.02]'
                          : 'bg-white/[0.03] border-white/5 text-white/50 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-[10px] text-white/40">0{idx + 1}</span>
                      <span className="font-sans font-medium text-xs truncate w-full mt-0.5">
                        {m.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deck Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => swipeCardsRef.current?.prev()}
                  aria-label="Previous system card"
                  className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => swipeCardsRef.current?.next()}
                  aria-label="Next system card"
                  className="w-10 h-10 rounded-xl bg-[#AFDDFF]/15 hover:bg-[#AFDDFF]/25 border border-[#AFDDFF]/40 flex items-center justify-center text-[#AFDDFF] hover:text-white transition-all active:scale-95 shadow-lg shadow-[#AFDDFF]/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-xs text-white/40 font-mono ml-2">
                  Swipe or tap arrows
                </span>
              </div>

              <button
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 text-xs text-[#AFDDFF] hover:text-white transition-colors font-medium"
              >
                <span>Request Custom Build</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Generous 3D Gesture Deck */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative py-4">
            
            {/* Subtle floating badge above stack */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/60 text-xs font-mono mb-4">
              <Hand className="w-3.5 h-3.5 text-[#AFDDFF]" />
              <span>Swipe or Drag to Cycle Cards</span>
            </div>

            {/* The 3D Interactive Stack Carousel Component */}
            <div className="relative w-full flex items-center justify-center">
              <SwipeCards
                ref={swipeCardsRef}
                cards={MODULE_DATA}
                settings={{
                  width: 420,
                  height: 480,
                  radius: 24,
                  swipeThreshold: 85,
                  stackRotation: 3.5,
                  stackScale: 0.04,
                  tiltStrength: 20,
                  mobileBreakpoint: 640,
                  mobileScale: 0.85,
                }}
                onCardChange={(card) => {
                  setActiveItem(card as ModuleCardItem);
                }}
                renderCard={(card, _index, isFront) => {
                  const m = card as ModuleCardItem;
                  const IconComp = m.icon;

                  return (
                    <div
                      className="relative w-full h-full p-6 sm:p-7 flex flex-col justify-between overflow-hidden select-none"
                      style={{
                        background: 'linear-gradient(145deg, rgba(22, 28, 38, 0.95) 0%, rgba(10, 13, 18, 0.98) 100%)',
                        border: isFront
                          ? '1px solid rgba(175, 221, 255, 0.35)'
                          : '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: isFront
                          ? '0 24px 60px -12px rgba(0,0,0,0.8), 0 0 40px rgba(175,221,255,0.08)'
                          : '0 16px 40px rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(24px)',
                      }}
                    >
                      {/* Top Accent Light Highlight */}
                      <div 
                        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(175,221,255,0.5) 50%, transparent 100%)',
                        }}
                      />

                      {/* Header Row */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-[#AFDDFF]/10 border border-[#AFDDFF]/25 flex items-center justify-center text-[#AFDDFF] shadow-inner">
                            <IconComp className="w-6 h-6 text-[#AFDDFF]" strokeWidth={1.7} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#AFDDFF]/10 text-[#AFDDFF] border border-[#AFDDFF]/30">
                              {m.tag}
                            </span>
                            <span
                              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                              className="text-xs text-white/50 font-mono"
                            >
                              0{MODULE_DATA.findIndex((it) => it.id === m.id) + 1}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className="text-2xl font-normal text-white mb-2"
                          style={{ fontFamily: "'Fraunces', serif" }}
                        >
                          {m.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans mb-4 line-clamp-2">
                          {m.detail}
                        </p>
                      </div>

                      {/* Live Blueprint Graphical Mockup */}
                      <div className="my-auto py-2">
                        <BlueprintMockup type={m.blueprintType} />
                      </div>

                      {/* Bottom Footer Action */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#AFDDFF] font-medium">
                          <span>Custom engineered</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-[11px] text-white/40 font-mono">
                          Swipe or drag
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
