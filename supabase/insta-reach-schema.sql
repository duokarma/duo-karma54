-- =====================================================================
-- DuoKarma Business Hub: Insta Reach Outbound CRM Schema
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.insta_reach_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insta_handle TEXT NOT NULL,
    insta_name TEXT NOT NULL,
    direct_link TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT DEFAULT 'Salon & Beauty',
    phone TEXT,
    whatsapp_link TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_day_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.insta_reach_leads ENABLE ROW LEVEL SECURITY;

-- Allow full access for dashboard users
DROP POLICY IF EXISTS "Allow full access to insta_reach_leads" ON public.insta_reach_leads;
CREATE POLICY "Allow full access to insta_reach_leads" 
ON public.insta_reach_leads 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Enable real-time replication if supported
ALTER PUBLICATION supabase_realtime ADD TABLE public.insta_reach_leads;

-- Seed with your first 3 Dubai leads
INSERT INTO public.insta_reach_leads (insta_handle, insta_name, direct_link, location, category, phone, whatsapp_link, status, notes, created_day_date)
VALUES 
(
    'ptcluxe',
    'Beauty Salon Dubai | PTC Luxe',
    'https://instagram.com/ptcluxe',
    'Aurora Tower - Marina - Shop No 5 - Marina Promenade, Dubai Marina',
    'Luxury Salon & Beauty',
    '+971 545434664',
    'https://wa.me/971545434664',
    'dm_sent',
    'Tested WhatsApp line: got default greeting, no automated booking assistant. Sent IG DM opener.',
    'Sunday, 11 Oct 2026 • 04:30 PM'
),
(
    'eser_turkish__gents_salon',
    'Eser Turkish Gents Salon 💈',
    'https://instagram.com/eser_turkish__gents_salon',
    'Al Barsha 1, Dubai UAE',
    'Barbershop',
    '+971 50 871 7868',
    'https://wa.me/971508717868',
    'dm_sent',
    'Has no booking link in bio, only Google Maps link. Sent IG DM for haircut/beard automation.',
    'Sunday, 11 Oct 2026 • 04:40 PM'
),
(
    'goodlucksalon.ae',
    'Good Luck Salon',
    'https://instagram.com/goodlucksalon.ae',
    'China Tower Shop - 2 Baniyas Rd, Al Rigga, Deira, Dubai',
    'Beauty & Hair Salon',
    NULL,
    NULL,
    'new',
    'High-volume salon with AED 380 hair coloring posts. Uses Linktree funnel leak.',
    'Sunday, 11 Oct 2026 • 04:45 PM'
)
ON CONFLICT DO NOTHING;
