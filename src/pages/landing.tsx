import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Search, Sparkles, Paperclip, MoreHorizontal, Inbox, Star, Send, File, Archive, Trash2, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppleLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 384 512" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const LogoMark = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 256 256" fill="white">
    <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
  </svg>
);

const AppleButton = ({ label = "Download Aura", full = false }: { label?: string, full?: boolean }) => (
  <button className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] ${full ? 'w-full' : ''}`}>
    <AppleLogo />
    {label}
    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-[1px]" />
  </button>
);

const SectionEyebrow = ({ label, tag }: { label: string, tag?: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      <span className="text-sm font-semibold tracking-wide text-white">{label}</span>
    </div>
    {tag && (
      <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-xs">
        {tag}
      </span>
    )}
  </div>
);

export function LandingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      {/* Global Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover pointer-events-none opacity-50"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" 
        />
      </div>

      {/* Vertical Guidelines */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      {/* SVG Noise Filters */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <filter id="c3-noise-root">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      <div className="relative z-10">
        {/* Section 1 — Navbar */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <LogoMark />
          </div>
          <div className="hidden md:flex gap-8">
            {['Solutions', 'Pricing', 'Blog', 'Documentation', 'Careers'].map((link, i) => (
              <motion.a 
                key={link}
                href="#"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="text-white/70 text-sm font-medium hover:text-white transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
            <AppleButton />
          </div>
          <button className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <Menu className="w-5 h-5 text-white/70" />
          </button>
        </motion.nav>

        {/* Section 2 — Hero */}
        <section className="pt-16 md:pt-28 pb-20 text-center flex flex-col items-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.9]"
          >
            <div className="text-white">Your email.</div>
            <div 
              className="animate-shiny"
              style={{
                backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                filter: 'url(#c3-noise-root)'
              }}
            >
              Revitalized
            </div>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-white/60 max-w-md text-base leading-[1.5]"
          >
            Aura is the premier inbox platform for the current era. It leverages powerful AI to organize, prioritize, and refine your messages into total clarity.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <AppleButton />
            <span className="text-xs text-white/40">Download for Intel / Apple Silicon</span>
          </motion.div>
        </section>

        {/* Section 3 — macOS Menu Bar Strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-full h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10"
        >
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <AppleLogo className="w-3.5 h-3.5" />
              <span className="font-bold text-white">Aura</span>
              {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map((item, i) => (
                <span 
                  key={item} 
                  className={`font-medium text-white/90 hover:bg-white/10 px-2 py-0.5 rounded cursor-default ${i > 2 ? 'hidden sm:inline' : ''} ${i > 3 ? 'hidden md:inline' : ''}`}
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Search className="w-3.5 h-3.5" />
              <span>Wed May 6 1:09 PM</span>
            </div>
          </div>
        </motion.div>

        {/* Section 4 — Inbox Mockup */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl"
          >
            {/* Title Bar */}
            <div className="h-10 border-b border-white/10 flex items-center px-4 justify-center relative bg-white/5">
              <div className="absolute left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs text-white/50 font-medium tracking-wide">Aura — Inbox</span>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 h-auto md:h-[520px]">
              
              {/* Sidebar */}
              <div className="hidden md:block col-span-3 border-r border-white/10 bg-black/30 p-4">
                <button className="w-full flex items-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2 hover:bg-white/90 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" /> Compose with Aura
                </button>
                <div className="mt-6 space-y-1">
                  <a href="#" className="flex justify-between items-center px-3 py-2 bg-white/10 text-white rounded-md text-xs font-medium">
                    <div className="flex items-center gap-2"><Inbox className="w-4 h-4" /> Inbox</div>
                    <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-full font-bold">12</span>
                  </a>
                  <a href="#" className="flex justify-between items-center px-3 py-2 text-white/60 hover:bg-white/5 rounded-md text-xs font-medium transition-colors">
                    <div className="flex items-center gap-2"><Star className="w-4 h-4" /> Starred</div>
                    <span className="text-[10px] font-bold">3</span>
                  </a>
                  <a href="#" className="flex justify-between items-center px-3 py-2 text-white/60 hover:bg-white/5 rounded-md text-xs font-medium transition-colors">
                    <div className="flex items-center gap-2"><Send className="w-4 h-4" /> Sent</div>
                  </a>
                  <a href="#" className="flex justify-between items-center px-3 py-2 text-white/60 hover:bg-white/5 rounded-md text-xs font-medium transition-colors">
                    <div className="flex items-center gap-2"><File className="w-4 h-4" /> Drafts</div>
                    <span className="text-[10px] font-bold">2</span>
                  </a>
                  <a href="#" className="flex justify-between items-center px-3 py-2 text-white/60 hover:bg-white/5 rounded-md text-xs font-medium transition-colors">
                    <div className="flex items-center gap-2"><Archive className="w-4 h-4" /> Archive</div>
                  </a>
                  <a href="#" className="flex justify-between items-center px-3 py-2 text-white/60 hover:bg-white/5 rounded-md text-xs font-medium transition-colors">
                    <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Trash</div>
                  </a>
                </div>

                <div className="mt-8">
                  <h3 className="uppercase tracking-widest text-[10px] font-bold text-white/40 px-3 mb-2">Labels</h3>
                  <div className="space-y-1">
                    <a href="#" className="flex items-center gap-2 px-3 py-1.5 text-white/60 hover:bg-white/5 rounded-md text-xs transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#00d2ff]" /> Work
                    </a>
                    <a href="#" className="flex items-center gap-2 px-3 py-1.5 text-white/60 hover:bg-white/5 rounded-md text-xs transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#A4F4FD]" /> Personal
                    </a>
                    <a href="#" className="flex items-center gap-2 px-3 py-1.5 text-white/60 hover:bg-white/5 rounded-md text-xs transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Travel
                    </a>
                    <a href="#" className="flex items-center gap-2 px-3 py-1.5 text-white/60 hover:bg-white/5 rounded-md text-xs transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Finance
                    </a>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="hidden md:flex flex-col col-span-4 border-r border-white/10">
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 text-white/40">
                  <Search className="w-4 h-4" />
                  <span className="text-xs">Search mail</span>
                </div>
                <div className="overflow-y-auto flex-1">
                  {[
                    { name: 'Linear', subject: 'Weekly product digest', preview: 'Your team shipped 23 issues this week...', time: '9:41 AM', active: true, unread: true },
                    { name: 'Sophia Chen', subject: 'Re: Q3 roadmap review', preview: 'Thanks for sending the deck over. I had a few thoughts...', time: '8:12 AM', unread: true },
                    { name: 'Figma', subject: 'Marcus commented on your file', preview: 'Love the new direction on the landing hero.', time: 'Yesterday' },
                    { name: 'Stripe', subject: 'Payout of $12,480.00 sent', preview: 'Your payout is on its way to your bank...', time: 'Yesterday' },
                    { name: 'Vercel', subject: 'Deployment ready for aura-web', preview: 'Preview is live at aura-web-g3f.vercel.app', time: 'Mon' },
                    { name: 'GitHub', subject: '[aura/core] PR #482 approved', preview: 'david-lim approved your pull request.', time: 'Mon' },
                  ].map((msg, idx) => (
                    <div key={idx} className={`p-4 border-b border-white/5 cursor-default ${msg.active ? 'bg-brand/10' : 'hover:bg-white/5'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                          {msg.unread && <span className="w-2 h-2 rounded-full bg-brand" />}
                          <span className={`text-sm ${msg.unread ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>{msg.name}</span>
                        </div>
                        <span className={`text-xs ${msg.unread ? 'text-brand font-medium' : 'text-white/40'}`}>{msg.time}</span>
                      </div>
                      <p className="text-xs font-medium text-white/90 mb-0.5 truncate">{msg.subject}</p>
                      <p className="text-xs text-white/50 truncate">{msg.preview}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reader pane */}
              <div className="col-span-12 md:col-span-5 flex flex-col h-[500px] md:h-auto">
                {/* Toolbar */}
                <div className="h-12 border-b border-white/10 flex items-center justify-between px-4">
                  <div className="flex gap-1 text-white/70">
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"><Archive className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <button className="w-7 h-7 flex items-center justify-center rounded-md text-white/70 hover:bg-white/10 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                
                {/* Email Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Weekly product digest</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] flex items-center justify-center font-semibold text-sm">L</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Linear</span>
                          <span className="text-xs text-white/50">to me · 9:41 AM</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded border border-brand/30 bg-brand/10 text-brand text-[10px] font-semibold uppercase tracking-wider">Work</span>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="liquid-glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#A4F4FD]" />
                      <span className="text-xs font-semibold text-[#A4F4FD]">Summary by Aura</span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Your team closed 23 issues, merged 14 PRs, and shipped 2 features. Top contributor: Marcus. No action needed.
                    </p>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-4 text-sm text-white/80 leading-relaxed">
                    <p>Hi team,</p>
                    <p>Here is your weekly digest of everything happening across your projects. This was a strong week with significant progress on the Q3 roadmap.</p>
                    <p>Twenty-three issues were closed, fourteen pull requests were merged, and two customer-facing features went out. The velocity trend continues to climb.</p>
                    <p>Let me know if you would like a deeper breakdown by project or contributor.</p>
                    <p className="text-white/50">— The Linear team</p>
                  </div>

                  {/* Attachment */}
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-xs font-medium">
                    <Paperclip className="w-3.5 h-3.5 text-white/50" />
                    digest-may-6.pdf
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* Section 5 — FeatureTriage */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <SectionEyebrow label="Triage" tag="AI-native" />
              <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
                Clear your inbox <br/> in a single pass.
              </h2>
              <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
                Aura reads every message, understands intent, and routes the noise away from the signal. Focus on what moves your day forward — the rest handles itself.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {['Auto-categorize', 'Snooze for later', 'Silent newsletters', 'One-tap unsubscribe'].map(chip => (
                  <span key={chip} className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="liquid-glass rounded-2xl p-5"
            >
              <div className="text-xs font-medium text-white/50 mb-4 px-2">Today · 42 messages triaged</div>
              <div className="space-y-3">
                {[
                  { name: 'Priority', count: 4, color: '#ffffff', items: ['Sophia Chen — Q3 review', 'David Lim — contract signoff'] },
                  { name: 'Follow-up', count: 7, color: '#e5e5e5', items: ['Marcus — design review', 'Figma — comment thread'] },
                  { name: 'Updates', count: 18, color: '#a3a3a3', items: ['Vercel — deploy ready', 'GitHub — PR #482 merged'] },
                  { name: 'Archived', count: 13, color: '#525252', items: ['Stripe payout · Newsletter · Receipts'] },
                ].map(group => (
                  <div key={group.name} className="liquid-glass rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: group.color }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }} />
                        {group.name}
                      </div>
                      <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full text-white/70">{group.count}</span>
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item, i) => (
                        <div key={i} className="text-xs text-white/50 truncate pl-3.5">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 6 — LogoCloud */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          <div className="text-xs uppercase tracking-widest text-white/40">Trusted by the world's most thoughtful teams</div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
            {['Linear', 'Vercel', 'Figma', 'Stripe', 'Ramp', 'Notion', 'Loom', 'Arc'].map((logo, i) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="text-sm font-semibold tracking-tight text-white/50 hover:text-white transition-colors cursor-default"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 7 — Testimonials */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Aura gave our leadership team four hours of their week back. It reads like email from the future.", name: "Parker Wilf", role: "Group Product Manager", company: "MERCURY" },
              { quote: "The command palette alone has changed how I process messages. I can't imagine going back to a traditional client.", name: "Andrew von Rosenbach", role: "Senior Engineering Program Manager", company: "COHERE" },
              { quote: "Triage that actually understands context. Our team stopped dreading Monday morning inboxes.", name: "Mathies Christensen", role: "Engineering Manager", company: "LUNAR" }
            ].map((t, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="liquid-glass rounded-2xl p-6 flex flex-col justify-between"
              >
                <blockquote className="text-sm text-white/80 leading-[1.6]">"{t.quote}"</blockquote>
                <figcaption className="mt-6 pt-5 border-t border-white/10">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-white/50 mb-1">{t.role}</div>
                  <div className="text-xs text-white font-semibold tracking-wide uppercase">{t.company}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* Section 8 — Pricing */}
        <section className="c3-pricing-section">
          <svg className="absolute w-0 h-0 pointer-events-none">
            <filter id="c3-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
              <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
              <feComposite in2="SourceGraphic" operator="in" result="noise" />
              <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
            </filter>
          </svg>

          <div className="c3-watermark-container">
            <div className="c3-watermark-main">
              <span className="c3-watermark-line-1">Your email.</span>
              <span className="c3-watermark-line-2">Revitalized</span>
            </div>
          </div>

          <div className="c3-grid">
            <div className="c3-card">
              <div className="c3-tier-small">Free</div>
              <div className="c3-tier-large">Free</div>
              <div className="c3-desc">For creators taking their first steps with Forma.</div>
              <ul className="c3-list">
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Up to 3 projects in the cloud</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Image export up to 1080p</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Basic editing tools</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Free templates and icons</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Access via web and mobile app</li>
              </ul>
              <button className="c3-btn">Choose Plan</button>
            </div>

            <div className="c3-card">
              <div className="c3-tier-small">Standard</div>
              <div className="c3-tier-large">{yearly ? "$99,99/y" : "$9,99/m"}</div>
              <div className="c3-desc">For freelancers and small teams who need more freedom and flexibility.</div>
              <ul className="c3-list">
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Up to 50 projects in the cloud</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Export up to 4K</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Advanced editing toolkit</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Team collaboration (up to 5 members)</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Access to premium template library</li>
              </ul>
              <button className="c3-btn">Choose Plan</button>
            </div>

            <div className="c3-card c3-card-pro">
              <div className="c3-tier-small">Pro</div>
              <div className="c3-tier-large">{yearly ? "$199,99/y" : "$19,99/m"}</div>
              <div className="c3-desc">For studios, agencies, and professional creators working with brands.</div>
              <ul className="c3-list">
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Unlimited projects</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Export up to 8K + animations</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>AI-powered content generation tools</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Unlimited team members</li>
                <li><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>Brand customization</li>
              </ul>
              <button className="c3-btn">Choose Plan</button>
            </div>
          </div>

          <div className="c3-toggle-wrap">
            <span className="text-sm font-medium text-white/80">Yearly</span>
            <button className={`c3-toggle ${yearly ? 'active' : ''}`} onClick={() => setYearly(!yearly)}>
              <div className="c3-toggle-knob" />
            </button>
          </div>
        </section>

        {/* Section 9 — FinalCTA */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
          >
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                background: 'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)',
                opacity: 0.3 
              }} 
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                Close the tabs. <br/> Open your day.
              </h2>
              <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
                Join thousands of builders, founders, and operators who treat email like a tool — not an obligation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <AppleButton />
                <button className="rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-colors flex items-center gap-2">
                  Talk to sales <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
