import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const PRINCIPLES = [
  {
    title: "No Middlemen",
    description: "You talk directly to the two people writing your code. No project managers or sales reps, so nothing gets lost in translation."
  },
  {
    title: "Business First",
    description: "We care about how your company actually operates. We target bottlenecks in your daily workflow and engineer tools to fix them."
  },
  {
    title: "Built Properly",
    description: "Solid technical foundations from day one. Systems designed to easily handle your growth over years without painful rewrites."
  },
  {
    title: "Total Visibility",
    description: "Zero black boxes. We share weekly progress, provide early staging access, and explain architectural choices in plain English."
  }
];

export function About() {
  return (
    <section className="relative overflow-hidden py-16 md:py-32 px-5 md:px-[5%]" style={{ background: COLORS.bg }}>
      {/* Subtle ambient lighting connecting from Hero */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-25"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(175,221,255,0.2), transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto">
        <Reveal>
          <div className="mb-10 md:mb-16">
            <Eyebrow>About DuoKarma</Eyebrow>
            <h2
              className="text-3xl md:text-5xl font-normal tracking-tight max-w-[720px] mt-2"
              style={{
                fontFamily: "'Fraunces', serif",
                background: 'linear-gradient(135deg, #FFFFFF 30%, #D8EDFF 70%, #AFDDFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Two people, one discipline: build the software a business will still run in five years.
            </h2>
          </div>
        </Reveal>

        {/* 2x2 grid on mobile, 4-col on desktop for compact, engaging layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-4 border-t border-white/5">
          {PRINCIPLES.map((principle, i) => (
            <Reveal delay={i * 0.08} key={principle.title}>
              <div
                className="p-5 md:p-6 rounded-2xl h-full flex flex-col justify-between transition-all duration-300 hover:border-[#AFDDFF]/35"
                style={{
                  background: 'linear-gradient(145deg, rgba(18, 22, 28, 0.75) 0%, rgba(10, 12, 16, 0.92) 100%)',
                  border: '1px solid rgba(175, 221, 255, 0.14)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: '#AFDDFF',
                      marginBottom: 12,
                    }}
                  >
                    0{i + 1} //
                  </div>
                  <h3
                    className="text-lg md:text-xl font-normal text-white mb-2"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {principle.title}
                  </h3>
                  <p className="text-xs md:text-sm text-ink/70 leading-relaxed font-sans m-0">
                    {principle.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Seamless transition line to next section */}
      <div 
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] max-w-[800px] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(175,221,255,0.2) 50%, transparent 100%)'
        }}
      />
    </section>
  );
}
