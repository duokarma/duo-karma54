import { m as motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartLoaderProps {
  className?: string;
}

export function ChartLoader({ className }: ChartLoaderProps) {
  return (
    <div className={cn("flex h-full w-full items-end justify-between gap-2 p-4", className)}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="w-full rounded-t-sm bg-white/[0.05]"
          initial={{ height: "10%" }}
          animate={{ height: ["10%", `${40 + Math.random() * 50}%`, "10%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
