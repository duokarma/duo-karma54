import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { supabase } from '@/lib/supabase';

const CONTACT_CARDS = [
  { label: "Google Meet", value: "Schedule a call" },
  { label: "WhatsApp", value: "Message us directly" },
  { label: "Email", value: "hello@duokarma.com" },
  { label: "LinkedIn", value: "@duokarma" },
];

export function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('leads').insert({
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        company: formData.company || 'Website Inquiry',
        source: 'Website',
        value: 0,
        stage: 'new',
        probability: 10,
        assignedTo: 'Unassigned',
        createdDate: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0]
      });
      setSuccess(true);
      setFormData({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: "120px 5% 100px", background: COLORS.bg }} id="contact">
      <Reveal>
        <Eyebrow>Contact</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(26px, 3.2vw, 40px)",
            color: COLORS.text,
            marginBottom: 50,
          }}
        >
          Start the conversation.
        </h2>
      </Reveal>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
        
        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input 
              required
              placeholder="Your Name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.line}`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none' }} 
            />
            <input 
              required
              type="email"
              placeholder="Your Email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.line}`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none' }} 
            />
            <input 
              placeholder="Company Name (Optional)" 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.line}`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none' }} 
            />
            <textarea 
              required
              placeholder="Tell us about your project" 
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              rows={4}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: `1px solid ${COLORS.line}`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'vertical' }} 
            />
            <button 
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                padding: "16px 30px",
                borderRadius: 12,
                border: "none",
                background: COLORS.accent,
                color: "#15130F",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            <AnimatePresence>
              {success && (
                <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{ color: COLORS.emerald, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                  Message sent successfully! We'll be in touch soon.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignContent: 'start' }}>
          {CONTACT_CARDS.map((c, i) => (
            <Reveal delay={i * 0.06} key={c.label}>
              <motion.div
                whileHover={{ y: -4, borderColor: COLORS.accent }}
                style={{
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 16,
                  padding: 26,
                  background: COLORS.surface,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  {c.label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.text }}>{c.value}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}