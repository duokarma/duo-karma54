import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

const GRADIENTS = [
  "from-electric to-indigo",
  "from-violet to-rose",
  "from-cyan to-electric",
  "from-amber to-rose",
  "from-emerald to-cyan",
  "from-indigo to-violet",
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface AvatarProps {
  seed: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ seed, size = "md", className }: AvatarProps) {
  const gradient = GRADIENTS[hashSeed(seed) % GRADIENTS.length];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display font-semibold text-white ring-1 ring-white/15",
        gradient,
        sizeClasses[size],
        className
      )}
    >
      {initials(seed)}
    </div>
  );
}
