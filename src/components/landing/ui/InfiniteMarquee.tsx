import { motion } from "framer-motion";

export function InfiniteMarquee() {
  const items = [
    "React",
    "Supabase",
    "AI",
    "Automation",
    "CRM",
    "Booking Systems",
    "Dashboards",
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-4 border-t border-white/10 bg-black/50 backdrop-blur-md z-40">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-8 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20,
          }}
        >
          {/* Duplicate the array to create a seamless loop */}
          {[...items, ...items, ...items, ...items].map((item, index) => (
            <div key={index} className="flex items-center gap-8">
              <span className="text-white/60 font-mono text-sm tracking-widest uppercase">
                {item}
              </span>
              <span className="text-[#e8702a] text-xs">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
