import { motion } from "framer-motion";

interface AnimatedTextRevealProps {
  text: string;
  className?: string;
  delayOffset?: number;
}

export function AnimatedTextReveal({ text, className = "", delayOffset = 0 }: AnimatedTextRevealProps) {
  // Split the text into an array of characters
  const characters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03, // Delay between each letter
        delayChildren: delayOffset,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      }
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span 
          key={index} 
          variants={childVariants} 
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
