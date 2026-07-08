import { useState } from 'react';

export function Nav() {
  const [active, setActive] = useState('Work');
  const links = ['Work', 'Services', 'Process', 'Contact'];

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setActive(id);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Left: Logo + Wordmark */}
      <div className="flex items-center gap-2">
        <img 
          src="/logo.png" 
          alt="DuoKarma Logo" 
          className="w-7 h-7 object-contain drop-shadow-md"
          onError={(e) => {
            // Fallback to inline SVG if logo.png is missing
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
        <svg 
          className="hidden w-[26px] h-[26px]" 
          viewBox="0 0 256 256" 
          fill="#ffffff"
        >
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z"/>
        </svg>
        <span className="text-white text-2xl font-playfair italic font-medium tracking-tight">DuoKarma</span>
      </div>

      {/* Center Pill */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {links.map(link => (
          <button
            key={link}
            onClick={() => scrollTo(link)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === link 
                ? 'text-white' 
                : 'text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {link}
          </button>
        ))}
      </div>

      {/* Right: Book a call */}
      <button 
        className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
        onClick={() => scrollTo('Contact')}
      >
        Book a call
      </button>
    </nav>
  );
}