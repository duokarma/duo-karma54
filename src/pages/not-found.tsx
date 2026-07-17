import { Link } from "react-router-dom";
import { m as motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrystalScene } from "@/components/three/crystal-scene";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-electric/[0.07] blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[450px] w-[450px] rounded-full bg-violet/[0.06] blur-[120px]" />
      </div>

      <div className="absolute inset-0 opacity-60">
        <CrystalScene className="h-full w-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md rounded-[var(--radius-panel)] glass-panel-strong p-10 text-center shadow-[var(--shadow-panel)]"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-edge">
          <Compass className="h-6 w-6 text-ink-faint" />
        </div>
        <p className="font-display text-5xl font-semibold tracking-tight text-gradient-brand">404</p>
        <h1 className="mt-3 font-display text-lg font-semibold text-ink">This page drifted off course</h1>
        <p className="mt-2 text-sm text-ink-faint">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
