export interface MagazinePage {
  pageNumber: number | string;
  category: string;
  title: string;
  subtitle?: string;
  content: string;
  highlights?: string[];
  metadata?: { label: string; value: string }[];
  accentColor?: string;
  theme?: 'dark' | 'light';
  isCover?: boolean;
  isBackCover?: boolean;
}

export interface MagazineSpread {
  spreadIndex: number;
  leftPage: MagazinePage;
  rightPage: MagazinePage;
}

export const MAGAZINE_SPREADS: MagazineSpread[] = [
  // Spread 0: Inside Cover & Foreword
  {
    spreadIndex: 0,
    leftPage: {
      pageNumber: 'Cover',
      category: 'Official Monograph',
      title: 'DUOKARMA',
      subtitle: 'Two Founders. One Standard. Exceptional Software.',
      content: 'A comprehensive folio documenting the systems, engineering discipline, and digital infrastructure built by DuoKarma.',
      metadata: [
        { label: 'Principals', value: 'Moiz Dheela & Hatim' },
        { label: 'Volume', value: 'I // 2026 Edition' },
        { label: 'Discipline', value: 'Software Engineering Studio' },
      ],
      theme: 'dark',
      isCover: true,
    },
    rightPage: {
      pageNumber: '01',
      category: 'Founders Foreword',
      title: 'Two People. One Discipline.',
      subtitle: 'Build the software a business will still run in five years.',
      content: 'We founded DuoKarma with a singular rule: software should be engineered around how a company actually operates, not forced into a generic template. When you collaborate with DuoKarma, there are no middlemen, account managers, or junior handoffs. You speak directly with the two engineers designing the architecture and writing every single line of code.',
      highlights: [
        'No Middlemen — direct contact with both founding engineers',
        'Business First — eliminating manual bottlenecks before coding',
        'Built Properly — foundational scalability that lasts half a decade',
        'Total Visibility — weekly staging reviews and transparent architecture',
      ],
      metadata: [
        { label: 'Founders', value: 'Moiz Dheela & Hatim' },
        { label: 'Headquarters', value: 'Mumbai, India' },
      ],
      theme: 'light',
    },
  },

  // Spread 1: Our Digital Presence & Engineering Architecture
  {
    spreadIndex: 1,
    leftPage: {
      pageNumber: '02',
      category: 'Our Digital Presence',
      title: 'Obsidian & Champagne Gold',
      subtitle: 'A bespoke editorial web identity for high-end engineering.',
      content: 'Our public website reflects our software ethos: restraint, craftsmanship, and surgical clarity. Rather than chasing generic AI glowing effects or heavy bloated frameworks, we engineered a custom typography-driven design system with obsidian black surfaces, warm ivory typography, and champagne gold accents.',
      highlights: [
        'Sub-second global edge loading via Vercel Edge Network',
        'Zero-glow luxury editorial aesthetic with 1px architectural borders',
        'Real-time mouse light tracking and GPU-accelerated video canvas',
        'Accessible color contrast and reduced-motion compliance',
      ],
      metadata: [
        { label: 'Aesthetic', value: 'Architectural Luxury' },
        { label: 'Stack', value: 'React, Tailwind CSS, Vite' },
      ],
      theme: 'dark',
    },
    rightPage: {
      pageNumber: '03',
      category: 'Software Engineering',
      title: 'Boring Tools, Used Creatively',
      subtitle: 'Bulletproof technological foundations.',
      content: 'We select technologies known for absolute reliability and enterprise stability. We favor typed code, schema validation, and stateless serverless functions over fragile experimental trends. Every system is built to endure traffic surges, complex relational queries, and continuous zero-downtime releases.',
      highlights: [
        'PostgreSQL & Supabase for bulletproof transactional integrity',
        'TypeScript end-to-end for zero-runtime type errors',
        'Serverless edge functions and background workers',
        'Native WebGL / Three.js for immersive physical micro-interactions',
      ],
      metadata: [
        { label: 'Database', value: 'PostgreSQL with Row-Level Security' },
        { label: 'Runtime', value: 'Node.js & Edge V8' },
      ],
      theme: 'light',
    },
  },

  // Spread 2: Real Production Systems (WOW Salon & Ten11 Farmhouse)
  {
    spreadIndex: 2,
    leftPage: {
      pageNumber: '04',
      category: 'Case Study 01 // Admin Systems',
      title: 'WOW Salon Management Platform',
      subtitle: 'Multi-location real-time operational dashboard.',
      content: 'Prior to DuoKarma, three busy salon branches were managing bookings through phone calls, paper ledgers, and fragmented WhatsApp chats. We engineered a centralized management console unifying stylist schedules, service menus, commissions, inventory tracking, and client appointment history into a live system.',
      highlights: [
        'Live appointment calendar with stylist allocation engine',
        'Automated billing, GST calculations, and client visit ledger',
        'Role-based permissions for managers, stylists, and accountants',
        'Replaced 3 disparate legacy spreadsheets with 1 unified dashboard',
      ],
      metadata: [
        { label: 'Client', value: 'WOW Salons' },
        { label: 'Impact', value: '100% Paperless Operations' },
      ],
      theme: 'dark',
    },
    rightPage: {
      pageNumber: '05',
      category: 'Case Study 02 // Booking Engines',
      title: 'Ten11 Farmhouse Reservation System',
      subtitle: 'Direct-to-consumer automated reservation engine.',
      content: 'A premier weekend estate rental required an automated guest booking pipeline without expensive third-party commission cuts or manual availability phone-tag. We deployed a customer booking engine featuring live calendar availability, dynamic seasonal pricing, instant WhatsApp confirmations, and a companion owner dashboard.',
      highlights: [
        'Real-time date availability checker with instant blackout lock',
        'Integrated payment gateway with automated receipt generation',
        'Companion owner mobile portal for check-in coordination',
        'Zero double-bookings across 24 months of production use',
      ],
      metadata: [
        { label: 'Client', value: 'Ten11 Farmhouse Retreat' },
        { label: 'Type', value: 'Public Booking Engine' },
      ],
      theme: 'light',
    },
  },

  // Spread 3: Business Hub & Automation
  {
    spreadIndex: 3,
    leftPage: {
      pageNumber: '06',
      category: 'Enterprise Automation',
      title: 'DuoKarma Business Hub',
      subtitle: 'Eliminating the manual middle step.',
      content: 'If human team members are repeating the same copy-paste operations, data re-entry, or email follow-ups every day, we build custom scripts and background daemons that run automatically. From lead enrichment to invoice generation, our automation engines free businesses to focus on strategic growth.',
      highlights: [
        'Automated lead intake with instant score classification',
        'Background sync between CRM databases and financial ledgers',
        'Custom webhook pipelines for third-party API connectivity',
        'Proactive telemetry alerting before errors impact operations',
      ],
      metadata: [
        { label: 'Category', value: 'Business Process Automation' },
        { label: 'Uptime', value: '99.98% Monitored SLA' },
      ],
      theme: 'dark',
    },
    rightPage: {
      pageNumber: '07',
      category: 'Security & Infrastructure',
      title: 'Enterprise-Grade Security',
      subtitle: 'Protecting proprietary data at every layer.',
      content: 'We enforce stringent security standards across every software system we build. From cryptographic token management and strict database Row-Level Security (RLS) to automated daily encrypted backups and zero-trust authentication, your proprietary client records and financial transactions remain impenetrable.',
      highlights: [
        'Row-Level Security (RLS) policies isolating tenant data',
        'Encrypted credentials, OAuth2, and session revocation',
        'Automated daily backup snapshots with failover redundancy',
        'Complete activity audit logging for compliance visibility',
      ],
      metadata: [
        { label: 'Compliance', value: 'Zero-Trust Architecture' },
        { label: 'Storage', value: 'Encrypted S3 & PostgreSQL' },
      ],
      theme: 'light',
    },
  },

  // Spread 4: Global Presence & Colophon
  {
    spreadIndex: 4,
    leftPage: {
      pageNumber: '08',
      category: 'Global Presence',
      title: 'Building Beyond Borders',
      subtitle: 'A worldwide engineering network.',
      content: 'DuoKarma engineers robust software solutions for forward-thinking enterprises across continents. Our distributed engineering practice operates with zero geographic compromise:',
      highlights: [
        'India — Engineering Digital Products & High-Performance Platforms',
        'Kuwait — Business Automation & Corporate Operations Systems',
        'Australia — Scalable SaaS Solutions & Cloud Architecture',
        'Dubai — Digital Transformation & Enterprise Workflows',
        'USA — Enterprise Innovation & Strategic Software Engineering',
      ],
      metadata: [
        { label: 'Footprint', value: '5 International Hubs' },
        { label: 'Collaboration', value: 'Remote-First Engineering' },
      ],
      theme: 'dark',
    },
    rightPage: {
      pageNumber: 'Back',
      category: 'Colophon & Inquiries',
      title: 'DuoKarma Studio',
      subtitle: 'Let\'s build something exceptional together.',
      content: 'Ready to replace fragile spreadsheets and disconnected software with a unified system engineered for longevity? Start a direct conversation with founders Moiz Dheela & Hatim today.',
      highlights: [
        'Direct consultation — no sales pressure',
        'Tailored scope proposals within 24 hours',
        'Production delivery in phased weekly sprints',
      ],
      metadata: [
        { label: 'Direct Line', value: '+91 93138 46266' },
        { label: 'Inquiries', value: 'duokarma54@gmail.com' },
        { label: 'Founders', value: 'Moiz Dheela & Hatim' },
      ],
      theme: 'dark',
      isBackCover: true,
    },
  },
];
