import { useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Loader2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { verifyOrSetPartnerPassword, type PartnerId } from "@/lib/partner-auth";

// ── Partner definitions ──────────────────────────────────────────────────────
const PARTNERS = [
  {
    id: "hatim" as PartnerId,
    name: "Hatim",
    email: "hatimsuttar@gmail.com",
    color: "#6366F1", // indigo
    initial: "H",
    tagline: "Co-founder · Tech & Product",
  },
  {
    id: "moiz" as PartnerId,
    name: "Moiz",
    email: "moizdhilawala99@gmail.com",
    color: "#10B981", // emerald
    initial: "M",
    tagline: "Co-founder · Growth & Operations",
  },
] as const;

const STORAGE_KEY = "dk_last_partner";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { loginAsPartner } = useAuth();
  const from = (location.state as any)?.from?.pathname || "/admin";

  const [step, setStep] = useState<"select" | "password">("select");
  const [selectedId, setSelectedId] = useState<PartnerId | null>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Partner avatars loaded from cache + Supabase partner_profiles
  const [avatars, setAvatars] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    PARTNERS.forEach((p) => {
      const cached = localStorage.getItem(`dk_avatar_${p.id}`);
      if (cached) initial[p.id] = cached;
    });
    return initial;
  });

  useEffect(() => {
    // Check remembered partner on this device
    const saved = localStorage.getItem(STORAGE_KEY) as PartnerId | null;
    if (saved && PARTNERS.some((p) => p.id === saved)) {
      setSelectedId(saved);
      setStep("password");
    }

    // Fetch latest partner avatars from Supabase
    const loadAvatars = async () => {
      try {
        const { data } = await supabase
          .from("partner_profiles")
          .select("id, avatar_url");

        if (data && Array.isArray(data)) {
          const updated: Record<string, string> = {};
          data.forEach((row: any) => {
            if (row.id && row.avatar_url) {
              updated[row.id] = row.avatar_url;
              localStorage.setItem(`dk_avatar_${row.id}`, row.avatar_url);
            }
          });
          setAvatars((prev) => ({ ...prev, ...updated }));
        }
      } catch {
        // Silently use cached avatars
      }
    };
    loadAvatars();
  }, []);

  const selectedPartner = PARTNERS.find((p) => p.id === selectedId);

  const handleSelectPartner = (id: PartnerId) => {
    setSelectedId(id);
    setError(null);
    setPassword("");
    setStep("password");
  };

  const handleBack = () => {
    setStep("select");
    setError(null);
    setPassword("");
  };

  // Direct login handler: zero email links!
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Verify or set partner password directly
      const result = await verifyOrSetPartnerPassword(selectedPartner.id, password);

      if (!result.success) {
        setError(result.error || "Incorrect password. Please try again.");
        setIsLoading(false);
        return;
      }

      // 2. Remember choice on this device
      localStorage.setItem(STORAGE_KEY, selectedPartner.id);

      // 3. Authenticate locally in AuthContext
      loginAsPartner({
        id: selectedPartner.id,
        email: selectedPartner.email,
        displayName: selectedPartner.name,
      });

      // 4. Also attempt Supabase Auth in background (optional, doesn't block)
      supabase.auth.signInWithPassword({
        email: selectedPartner.email,
        password,
      }).catch(() => {
        // Silent fallback — direct partner session handles auth!
      });

      if (result.isFirstTime) {
        toast({
          title: `Welcome, ${selectedPartner.name}!`,
          description: "Your login password has been saved. You can change it anytime in Settings.",
        });
      } else {
        toast({
          title: `Welcome back, ${selectedPartner.name}!`,
          description: "Entering DuoKarma Business Hub...",
        });
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] px-4 py-8">
      {/* Background glow blobs */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 40%, #6366F130 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 60%, #10B98130 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col items-center gap-2"
      >
        <img
          src="/duokarma-logo.jpeg"
          alt="DuoKarma"
          className="h-12 w-12 rounded-xl object-cover shadow-lg"
        />
        <p className="text-sm font-semibold tracking-tight text-white">DuoKarma</p>
        <p className="text-[11px] text-white/40">Business Hub</p>
      </motion.div>

      {/* Main Form Container */}
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <h2 className="mb-1 text-center text-xl font-semibold text-white">
              Who's logging in?
            </h2>
            <p className="mb-8 text-center text-sm text-white/40">
              Select your partner account to continue
            </p>

            <div className="grid grid-cols-2 gap-4">
              {PARTNERS.map((partner) => (
                <motion.button
                  key={partner.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectPartner(partner.id)}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-lg transition-colors hover:border-white/20 hover:bg-white/8 focus:outline-none cursor-pointer"
                >
                  {avatars[partner.id] ? (
                    <img
                      src={avatars[partner.id]}
                      alt={partner.name}
                      className="h-16 w-16 rounded-full object-cover shadow-lg"
                      style={{ border: `2px solid ${partner.color}` }}
                    />
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
                      style={{ background: `${partner.color}33`, border: `2px solid ${partner.color}66` }}
                    >
                      <span style={{ color: partner.color }}>{partner.initial}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-white">{partner.name}</p>
                    <p className="text-[11px] text-white/40">{partner.name === "Hatim" ? "Tech & Product" : "Growth & Ops"}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "password" && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Switch partner
            </button>

            {selectedPartner && (
              <div className="mb-6 flex flex-col items-center gap-3">
                {avatars[selectedPartner.id] ? (
                  <img
                    src={avatars[selectedPartner.id]}
                    alt={selectedPartner.name}
                    className="h-16 w-16 rounded-full object-cover shadow-lg"
                    style={{ border: `2px solid ${selectedPartner.color}` }}
                  />
                ) : (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold shadow-lg"
                    style={{
                      background: `${selectedPartner.color}22`,
                      border: `2px solid ${selectedPartner.color}55`,
                      color: selectedPartner.color,
                    }}
                  >
                    {selectedPartner.initial}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">
                    Welcome, {selectedPartner.name}
                  </p>
                  <p className="text-xs text-white/40">Enter your password to continue</p>
                </div>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30 z-20" />
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  className="h-11 border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="h-11 w-full text-sm font-medium cursor-pointer"
                style={
                  selectedPartner
                    ? {
                        background: selectedPartner.color,
                        color: "#fff",
                        border: "none",
                      }
                    : undefined
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Entering Dashboard...
                  </>
                ) : (
                  <>
                    Enter Dashboard
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-[11px] text-white/25">
                Passwords can be modified anytime in Partner Settings
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="absolute bottom-6 text-[11px] text-white/20">
        © {new Date().getFullYear()} DuoKarma. All rights reserved.
      </p>
    </div>
  );
}

