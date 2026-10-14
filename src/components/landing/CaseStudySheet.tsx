import { useEffect } from 'react';
import { m as motion } from 'framer-motion';
import { X, Zap, Cpu, CheckCircle2 } from 'lucide-react';

interface Project {
  title: string;
  category: string;
  problem: string;
  solution: string;
  result: string;
  features: string[];
  tech: string[];
  color: string;
}

interface CaseStudySheetProps {
  project: Project;
  onClose: () => void;
}

export function CaseStudySheet({ project, onClose }: CaseStudySheetProps) {
  // Lock body scroll while modal is open & listen for Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') onClose(); 
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const stages = [
    { label: 'Challenge', icon: Zap, text: project.problem, color: '#AFDDFF' },
    { label: 'Solution', icon: Cpu, text: project.solution, color: '#c8e8ff' },
    { label: 'Result', icon: CheckCircle2, text: project.result, color: '#6ee7b7' },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal / Sheet Card */}
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 25, scale: 0.96 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        aria-modal="true"
        role="dialog"
        aria-label={`Case study: ${project.title}`}
        className="relative z-10 w-full sm:max-w-2xl bg-[#0c1017] border border-white/10 sm:border-[#AFDDFF]/20 rounded-t-[28px] sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="flex sm:hidden justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto px-6 sm:px-8 py-5 sm:py-7">
          {/* Category Tag + Close Button */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[11px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border"
              style={{
                color: '#AFDDFF',
                background: 'rgba(175, 221, 255, 0.08)',
                borderColor: 'rgba(175, 221, 255, 0.25)',
              }}
            >
              {project.category}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Project Title */}
          <h2
            className="text-2xl sm:text-3xl font-normal text-white mb-6 leading-tight"
            style={{
              fontFamily: "'Fraunces', serif",
              background: 'linear-gradient(135deg, #FFFFFF 30%, #D8EDFF 70%, #AFDDFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {project.title}
          </h2>

          {/* Case study stages */}
          <div className="space-y-6 mb-8">
            {stages.map((stage, i) => {
              const StageIcon = stage.icon;
              return (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.35 }}
                  className="flex gap-4 items-start"
                >
                  {/* Icon Badge */}
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
                    style={{
                      background: 'rgba(175, 221, 255, 0.08)',
                      borderColor: 'rgba(175, 221, 255, 0.25)',
                      color: stage.color,
                    }}
                  >
                    <StageIcon className="w-4 h-4" strokeWidth={1.8} />
                  </div>

                  {/* Content */}
                  <div>
                    <span 
                      className="text-[11px] font-mono tracking-wider uppercase block mb-1 font-semibold"
                      style={{ color: stage.color }}
                    >
                      {stage.label}
                    </span>
                    <p className="text-sm text-white/80 leading-relaxed font-sans m-0">
                      {stage.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Features Pills */}
          <div className="pt-5 border-t border-white/10 mb-6">
            <span className="text-[11px] font-mono tracking-wider uppercase text-white/40 block mb-3">
              Delivered Architecture
            </span>
            <div className="flex flex-wrap gap-2">
              {project.features.map((f) => (
                <span
                  key={f}
                  className="text-xs px-3 py-1 rounded-lg bg-white/[0.04] text-white/75 border border-white/10 font-sans"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onClose();
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }}
            className="w-full py-3.5 rounded-xl bg-[#AFDDFF] hover:bg-[#c8e8ff] text-black font-semibold text-sm transition-all shadow-lg shadow-[#AFDDFF]/20"
          >
            Start a similar project →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
