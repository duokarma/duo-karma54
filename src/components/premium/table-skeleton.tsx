import { m as motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export function TableSkeleton({ columns = 5, rows = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-[var(--radius-card)] border border-edge", className)}>
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="flex w-full items-center justify-between border-b border-edge bg-white/[0.02] px-4 py-3">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 w-16 bg-white/[0.05]" />
          ))}
        </div>
        {/* Rows Skeleton */}
        <div className="flex flex-col">
          {[...Array(rows)].map((_, r) => (
            <motion.div
              key={`row-${r}`}
              className="flex w-full items-center justify-between border-b border-edge/60 px-4 py-4 last:border-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: r * 0.05, duration: 0.3 }}
            >
              {[...Array(columns)].map((_, c) => (
                <Skeleton 
                  key={`cell-${r}-${c}`} 
                  className={cn("h-4 bg-white/[0.03]", c === 0 ? "w-24" : "w-16")} 
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
