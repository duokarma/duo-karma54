import { useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Loader2, ChevronLeft, Eye, EyeOff, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

// ── Partner config — add emails here if more partners join ──────────────────
const PARTNERS = [
  {
    id: "hatim",
    name: "Hatim",
    email: "hatimsuttar@gmail.com",
    color: "#6366F1",        // indigo
    initial: "H",
    tagline: "Co-founder",
  },
  {
    id: "moiz",
    name: "Moiz",
    email: "moizdhilawala99@gmail.com",
    color: "#10B981",        // emerald
    initial: "M",
    tagline: "Co-founder",
  },
] as const;

type PartnerId = (typeof PARTNERS)[number]["id"];
type LoginStep = "select" | "password" | "setup-request" | "set-new-password";

const STORAGE_KEY = "dk_last_partner";

export function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { toast } = useToast();
  const from      = (location.state as any)?.from?.pathname || "/admin";

  // Which step: select partner → enter password → setup request → set new password
  const [step, setStep]             = useState<LoginStep>("select");
  const [selectedId, setSelectedId] = useState<PartnerId | null>(null);
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // New password setup form fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Partner avatars loaded from localStorage cache and synced from Supabase
  const [avatars, setAvatars] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    PARTNERS.forEach((p) => {
      const cached = localStorage.getItem(`dk_avatar_${p.id}`);
      if (cached) initial[p.id] = cached;
    });
    return initial;
  });

  // On mount: detect recovery links, saved partner, and fetch latest avatars
  useEffect(() => {
    // 1. Check if the URL contains a recovery or invite token
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isRecovery =
      hash.includes("type=recovery") ||
      hash.includes("type=invite") ||
      search.includes("type=recovery") ||
      search.includes("code=");

    if (isRecovery) {
      setStep("set-new-password");
    }

    // 2. Listen to Supabase Auth State changes for recovery events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("set-new-password");
        if (session?.user?.email) {
          const partner = PARTNERS.find(
            (p) => p.email.toLowerCase() === session.user.email?.toLowerCase()
          );
          if (partner) setSelectedId(partner.id);
        }
      }
    });

    // 3. Check for remembered device partner
    if (!isRecovery) {
      const saved = localStorage.getItem(STORAGE_KEY) as PartnerId | null;
      if (saved && PARTNERS.some((p) => p.id === saved)) {
        setSelectedId(saved);
        setStep("password");
      }
    }

    // 4. Fetch latest partner avatars from Supabase partner_profiles table
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
        // Fallback cleanly to cached avatars
      }
    };
    loadAvatars();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const selectedPartner = PARTNERS.find((p) => p.id === selectedId);

  const handleSelectPartner = (id: PartnerId) => {
    setSelectedId(id);
    setError(null);
    setSuccessInfo(null);
    setPassword("");
    setStep("password");
  };

  const handleBack = () => {
    setStep("select");
    setError(null);
    setSuccessInfo(null);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Sign in with existing password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    setIsLoading(true);
    setError(null);
    setSuccessInfo(null);

    const { error } = await supabase.auth.signInWithPassword({
      email:    selectedPartner.email,
      password,
    });

    if (error) {
      setError(
        `Incorrect password. If this is your first time logging in as ${selectedPartner.name}, tap "Set up password" below to create one.`
      );
      setIsLoading(false);
    } else {
      localStorage.setItem(STORAGE_KEY, selectedPartner.id);
      navigate(from, { replace: true });
    }
  };

  // Trigger password setup/reset email link
  const handleSendSetupEmail = async () => {
    if (!selectedPartner) return;
    setIsLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(selectedPartner.email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSuccessInfo(
        `Setup link sent to ${selectedPartner.email}! Open the link in your email on this phone to set your password.`
      );
      toast({
        title: "Setup Link Sent",
        description: `Check ${selectedPartner.email} for the verification link.`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to send setup email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger magic link OTP login
  const handleSendMagicLink = async () => {
    if (!selectedPartner) return;
    setIsLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await supabase.auth.signInWithOtp({
        email: selectedPartner.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setSuccessInfo(
        `Magic login link sent to ${selectedPartner.email}! Tap the link in your email to instantly log in.`
      );
      toast({
        title: "Magic Link Sent",
        description: `Check ${selectedPartner.email} to sign in without a password.`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set brand-new password (during recovery / first-time setup)
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      if (selectedPartner) {
        localStorage.setItem(STORAGE_KEY, selectedPartner.id);
      }

      toast({
        title: "Password Set Successfully",
        description: "Welcome to DuoKarma! Entering your dashboard...",
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Could not set new password. Please request a fresh setup link.");
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
          src="/logo.jpeg"
          alt="DuoKarma"
          className="h-12 w-12 rounded-xl object-cover shadow-lg"
        />
        <p className="text-sm font-semibold tracking-tight text-white">DuoKarma</p>
        <p className="text-[11px] text-white/40">Business Hub</p>
      </motion.div>

      {/* Main Form Container */}
      <AnimatePresence mode="wait">
        {step === "select" && (
          /* ── Step 1: Partner selection ─────────────────────────────────── */
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
                  {/* Avatar circle or photo */}
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
                    <p className="text-[11px] text-white/40">{partner.tagline}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "password" && (
          /* ── Step 2: Password entry ────────────────────────────────────── */
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

            {/* Partner identity */}
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
                      border:     `2px solid ${selectedPartner.color}55`,
                      color:       selectedPartner.color,
                    }}
                  >
                    {selectedPartner.initial}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">
                    Welcome back, {selectedPartner.name}
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
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("setup-request");
                  }}
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Set up password for {selectedPartner?.name} now →
                </button>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Enter Dashboard
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Set up password trigger */}
            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessInfo(null);
                  setStep("setup-request");
                }}
                className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer py-1"
              >
                <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                <span>First time logging in or forgot password? <strong className="text-emerald-400 underline">Set up password</strong></span>
              </button>
              <p className="text-[11px] text-white/25">
                Your device will remember your selection
              </p>
            </div>
          </motion.div>
        )}

        {step === "setup-request" && (
          /* ── Step 3: Password setup & recovery request ──────────────────── */
          <motion.div
            key="setup-request"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <button
              onClick={() => {
                setError(null);
                setSuccessInfo(null);
                setStep("password");
              }}
              className="mb-6 flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to password
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 shadow-lg">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Set Up Password for {selectedPartner?.name}
              </h2>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                First time logging in? Verify via your email (
                <span className="text-white font-mono">{selectedPartner?.email}</span>) to create your password.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
              >
                {error}
              </motion.div>
            )}

            {successInfo && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5 leading-relaxed"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Email Sent!</p>
                  <p className="mt-0.5">{successInfo}</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              {/* Option 1: Send Password Setup Link */}
              <Button
                type="button"
                onClick={handleSendSetupEmail}
                disabled={isLoading}
                className="h-11 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Password Setup Link to Email
                  </>
                )}
              </Button>

              {/* Option 2: Magic Link Sign In */}
              <Button
                type="button"
                variant="outline"
                onClick={handleSendMagicLink}
                disabled={isLoading}
                className="h-11 w-full border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" />
                Sign in with One-Click Magic Link
              </Button>

              {/* Option 3: Already have link or want to enter new password directly */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessInfo(null);
                    setStep("set-new-password");
                  }}
                  className="text-xs text-white/40 hover:text-white transition-colors underline cursor-pointer"
                >
                  Already have a setup link opened? Enter password directly →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "set-new-password" && (
          /* ── Step 4: Create new password ────────────────────────────────── */
          <motion.div
            key="set-new-password"
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
              Back to partners
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/25 text-blue-400 shadow-lg">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Create Your New Password
              </h2>
              <p className="mt-1 text-xs text-white/50">
                {selectedPartner
                  ? `Set a secure dashboard password for ${selectedPartner.name}`
                  : "Set your permanent dashboard password to log in"}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              {/* New Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30 z-20" />
                <Input
                  type={showNewPw ? "text" : "password"}
                  placeholder="New password (min 6 characters)"
                  className="h-11 border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:ring-0"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30 z-20" />
                <Input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="h-11 border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:ring-0"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="h-11 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving password...
                  </>
                ) : (
                  <>
                    Save Password & Enter Dashboard
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep("password")}
                className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                Return to standard login
              </button>
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
