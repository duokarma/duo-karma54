import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-void)] backdrop-blur-3xl overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-96 h-96 bg-[var(--color-accent)] rounded-full blur-[100px]"
        />
      </div>

      {/* Main Loader Content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Glowing Logo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
          className="mb-12 relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[var(--color-accent)] blur-2xl opacity-20 rounded-full animate-pulse" />
          <img src="/logo.jpeg" alt="DuoKarma" className="h-16 w-auto object-contain rounded-xl shadow-2xl z-10 border border-white/10" />
        </motion.div>

        {/* Skeleton Grid (Fakes the dashboard layout for smooth transition) */}
        <div className="w-full space-y-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Skeleton className="h-8 w-64 rounded-md" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <Skeleton className="mt-2 h-4 w-48 rounded-md" />
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Skeleton className="h-10 w-32 rounded-[var(--radius-control)]" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Skeleton className="h-32 rounded-[var(--radius-card)]" />
              </motion.div>
            ))}
          </div>
          
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
          >
             <Skeleton className="h-80 w-full rounded-[var(--radius-card)]" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
