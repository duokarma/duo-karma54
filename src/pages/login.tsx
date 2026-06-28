import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrystalScene } from "@/components/three/crystal-scene";
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  const loginAs = (role: "admin" | "user") => {
    const targetEmail = role === "admin" ? "admin@duokarrma.com" : "user@duokarrma.com";
    const targetPassword = "password123";
    
    setEmail(targetEmail);
    setPassword(targetPassword);
    
    // Automatically submit after state update
    setTimeout(() => {
      handleLoginAs(targetEmail, targetPassword);
    }, 0);
  };

  const handleLoginAs = async (targetEmail: string, targetPassword: string) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-electric/[0.08] blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[450px] w-[450px] rounded-full bg-violet/[0.07] blur-[120px]" />
      </div>

      {/* Left: Crystal hero */}
      <div className="relative hidden items-center justify-center lg:flex">
        <div className="absolute inset-0">
          <CrystalScene className="h-full w-full" />
        </div>
        <div className="relative z-10 max-w-sm px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl font-semibold tracking-tight text-ink"
          >
            Run your business like an operating system.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-3 text-sm text-ink-faint"
          >
            Clients, projects, and revenue — orchestrated in one elegant hub.
          </motion.p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm rounded-[var(--radius-panel)] glass-panel-strong p-8 shadow-[var(--shadow-panel)]"
        >
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-black shadow-[var(--shadow-glow-blue)]">
              <img src="/logo.jpeg" alt="DuoKarma Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-ink">DuoKarma</p>
              <p className="text-[11px] text-ink-faint">Business Hub</p>
            </div>
          </div>

          <h1 className="font-display text-xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-faint">Sign in to access your dashboard.</p>

          <div className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={() => loginAs("admin")}
              disabled={isLoading}
            >
              <Users className="mr-2 h-3.5 w-3.5" />
              Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={() => loginAs("user")}
              disabled={isLoading}
            >
              <Users className="mr-2 h-3.5 w-3.5" />
              User
            </Button>
          </div>

          <div className="relative mt-5 mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-edge" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-ink-faint">Or continue with</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-rose/10 p-3 text-sm text-rose">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input 
                  type="email" 
                  placeholder="you@company.com" 
                  className="pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium text-ink-dim">Password</label>
                <a href="#" className="text-xs text-electric hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-dim"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
