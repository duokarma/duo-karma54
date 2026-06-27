import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CrystalScene } from "@/components/three/crystal-scene";
import { Link } from "react-router-dom";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input type="email" placeholder="you@company.com" className="pl-10" defaultValue="admin@duokarrma.com" />
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
                  defaultValue="password123"
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

            <Button type="submit" className="w-full" size="lg" asChild>
              <Link to="/">
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-faint">
            This is a UI template — authentication is not yet implemented.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
