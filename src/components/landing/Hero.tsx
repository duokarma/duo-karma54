import { AnimatedTextReveal } from './ui/AnimatedTextReveal';
import { GridPattern } from './ui/GridPattern';
import { CrystalScene } from '../three/crystal-scene';
import { MagneticWrapper } from '@/components/premium/magnetic-wrapper';

const SPOTLIGHT_R = 260;
const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

function RevealLayer({ image, cursorX, cursorY }: { image: string, cursorX: number, cursorY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!canvas || !reveal) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (cursorX !== -999 && cursorY !== -999) {
      const gradient = ctx.createRadialGradient(
        cursorX, cursorY, 0,
        cursorX, cursorY, SPOTLIGHT_R
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
      gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();

      const maskImage = `url(${canvas.toDataURL()})`;
      reveal.style.maskImage = maskImage;
      reveal.style.webkitMaskImage = maskImage;
      reveal.style.maskSize = '100% 100%';
      reveal.style.webkitMaskSize = '100% 100%';
    }
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div 
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{ backgroundImage: `url(${image})`, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}
      />
    </>
  );
}


export function Hero() {
  return (
    <div className="tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="relative w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>
        
        {/* Layer 1: Background Crystal Scene */}
        <div className="absolute inset-0 z-10 hero-zoom bg-black">
          <CrystalScene className="w-full h-full opacity-60 mix-blend-screen" />
          {/* Gradient overlays to blend smoothly into the dark theme */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-transparent to-transparent opacity-100 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 pointer-events-none" />
        </div>
        
        {/* Layer 1.5: Grid Pattern */}
        <GridPattern />

        {/* Layer 3: Heading */}
        <h1 className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50 text-white leading-[0.95] tracking-tight">
          <AnimatedTextReveal 
            text="We build software" 
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl" 
            delayOffset={0.25} 
          />
          <AnimatedTextReveal 
            text="businesses actually use" 
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1" 
            delayOffset={0.7} 
          />
        </h1>

        {/* Layer 4: Bottom-left paragraph */}
        <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm text-white/80 leading-relaxed">
            Every line of code records a chapter of your business, from early spreadsheets to automated workflows, layered securely in the cloud.
          </p>
        </div>

        {/* Layer 5: Bottom-right block */}
        <div className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade" style={{ animationDelay: '0.85s' }}>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            We engineer scalable, intuitive platforms that transform complex operations into streamlined workflows. Discover how intelligent automation and purposeful design drive measurable business growth.
          </p>
          <MagneticWrapper>
            <button 
              className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 relative overflow-hidden group"
              onClick={() => {
                document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="relative z-10">Start Building</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </MagneticWrapper>
        </div>
      </section>
    </div>
  );
}