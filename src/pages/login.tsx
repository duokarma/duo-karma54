import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";


export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  const loginAsAdmin = async () => {
    const targetEmail = "admin@duokarrma.com";
    setEmail(targetEmail);
    setPassword("password123");
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: "password123",
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="grid min-h-screen bg-[var(--color-void)] lg:grid-cols-2">
      {/* ── Left: Brand Panel ── */}
      <div className="hidden flex-col justify-between p-12 bg-[var(--color-graphite)] border-r border-[var(--color-edge)] lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
            <img src="/logo.jpeg" alt="DuoKarma" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">DuoKarma</p>
            <p className="text-[10px] text-ink-faint">Business Hub</p>
          </div>
        </div>

        {/* Core value prop */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-3xl font-semibold leading-tight tracking-tight text-ink"
          >
            Your business,
            <br />
            <span className="text-[var(--color-accent)]">fully orchestrated.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="mt-4 text-sm leading-relaxed text-ink-faint"
          >
            Clients, projects, invoices, and revenue — unified in one professional workspace built for modern agencies.
          </motion.p>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-ink-faint">
          © {new Date().getFullYear()} DuoKarma. All rights reserved.
        </p>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[360px]"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md">
              <img src="/logo.jpeg" alt="DuoKarma" className="h-full w-full object-cover" />
            </div>
            <p className="text-sm font-semibold text-ink">DuoKarma</p>
          </div>

          <h2 className="text-xl font-semibold text-ink">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-faint">Sign in to your workspace</p>

          {/* Quick login */}
          <div className="mt-6 flex">
            <button
              type="button"
              onClick={loginAsAdmin}
              disabled={isLoading}
              className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-[var(--color-accent)] hover:text-ink disabled:opacity-50"
            >
              Login as Admin
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--color-edge)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--color-void)] px-2 text-[10px] uppercase tracking-wider text-ink-faint">
                or sign in manually
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-[var(--radius-control)] border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#EF4444]">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-ink-dim">Password</label>
                <a href="#" className="text-[10px] text-[var(--color-accent)] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-dim"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
