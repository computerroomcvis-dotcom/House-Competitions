// Default official Crestview International School House Crest Logos (SVG Data URLs)

export const DEFAULT_HOUSE_LOGOS: Record<string, string> = {
  'house-earthshakers': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="es-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%2312B76A"/>
        <stop offset="60%" stop-color="%23027A48"/>
        <stop offset="100%" stop-color="%23054F31"/>
      </linearGradient>
      <linearGradient id="gold-trim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FCD34D"/>
        <stop offset="50%" stop-color="%23F59E0B"/>
        <stop offset="100%" stop-color="%23B45309"/>
      </linearGradient>
    </defs>
    <!-- Outer Shield Frame -->
    <path d="M100 15 L175 42 C175 115 145 165 100 188 C55 165 25 115 25 42 Z" fill="url(%23es-bg)" stroke="url(%23gold-trim)" stroke-width="6" stroke-linejoin="round"/>
    <!-- Inner Accent Border -->
    <path d="M100 24 L165 48 C165 110 138 153 100 174 C62 153 35 110 35 48 Z" fill="none" stroke="%23ffffff" stroke-width="1.8" opacity="0.35"/>
    <!-- Center Elephant Crest Motif -->
    <g fill="%23FFFFFF" transform="translate(100, 92) scale(0.95)">
      <!-- Head / Brow -->
      <path d="M-36 -32 C-20 -50 20 -50 36 -32 C48 -18 52 4 44 24 C38 38 28 42 22 40 C24 30 22 18 16 12 C10 6 -10 6 -16 12 C-22 18 -24 30 -22 40 C-28 42 -38 38 -44 24 C-52 4 -48 -18 -36 -32 Z" opacity="0.95"/>
      <!-- Ears & Tusks -->
      <path d="M-18 8 C-14 26 -28 36 -32 40 C-36 34 -30 20 -24 8 Z" fill="%23FDE68A"/>
      <path d="M18 8 C14 26 28 36 32 40 C36 34 30 20 24 8 Z" fill="%23FDE68A"/>
      <!-- Trunk -->
      <path d="M-9 14 C-10 34 -8 54 -2 60 C4 64 12 60 8 52 C5 46 2 34 2 14 Z" fill="%23FFFFFF"/>
      <!-- Crown / Stars -->
      <circle cx="0" cy="-38" r="4.5" fill="%23F59E0B"/>
      <circle cx="-16" cy="-32" r="3" fill="%23F59E0B"/>
      <circle cx="16" cy="-32" r="3" fill="%23F59E0B"/>
    </g>
    <!-- Banner Ribbon -->
    <path d="M38 148 L100 156 L162 148 L152 168 L100 174 L48 168 Z" fill="url(%23gold-trim)"/>
    <text x="100" y="165" font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="%230F172A" text-anchor="middle" letter-spacing="1.2">EARTHSHAKERS</text>
  </svg>`,

  'house-mountainhearts': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="mh-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23F76808"/>
        <stop offset="60%" stop-color="%23C4320A"/>
        <stop offset="100%" stop-color="%237C1A04"/>
      </linearGradient>
      <linearGradient id="gold-trim-mh" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FEF08A"/>
        <stop offset="50%" stop-color="%23FBBF24"/>
        <stop offset="100%" stop-color="%23D97706"/>
      </linearGradient>
    </defs>
    <!-- Outer Shield Frame -->
    <path d="M100 15 L175 42 C175 115 145 165 100 188 C55 165 25 115 25 42 Z" fill="url(%23mh-bg)" stroke="url(%23gold-trim-mh)" stroke-width="6" stroke-linejoin="round"/>
    <!-- Inner Accent Border -->
    <path d="M100 24 L165 48 C165 110 138 153 100 174 C62 153 35 110 35 48 Z" fill="none" stroke="%23ffffff" stroke-width="1.8" opacity="0.35"/>
    <!-- Mountain Peaks Background -->
    <path d="M48 126 L82 82 L100 102 L128 66 L158 126 Z" fill="%239A3412" opacity="0.5"/>
    <path d="M68 126 L100 78 L134 126 Z" fill="%23C2410C" opacity="0.7"/>
    <!-- Center Agile Ibex Motif -->
    <g fill="%23FFFFFF" transform="translate(100, 94) scale(0.95)">
      <!-- Curved Horns -->
      <path d="M-6 -20 C-18 -48 -44 -48 -46 -38 C-44 -44 -24 -40 -12 -16 Z" fill="%23FEF08A"/>
      <path d="M6 -20 C18 -48 44 -48 46 -38 C44 -44 24 -40 12 -16 Z" fill="%23FEF08A"/>
      <!-- Ibex Head / Face -->
      <path d="M0 -22 C-14 -22 -22 -10 -18 8 C-14 22 -6 34 0 38 C6 34 14 22 18 8 C22 -10 14 -22 0 -22 Z"/>
      <!-- Beard -->
      <path d="M-4 36 L0 48 L4 36 Z" fill="%23FEF08A"/>
      <!-- Eyes & Nose -->
      <circle cx="-7" cy="2" r="2.5" fill="%239A3412"/>
      <circle cx="7" cy="2" r="2.5" fill="%239A3412"/>
      <!-- Star on forehead -->
      <polygon points="0,-16 2.5,-10 8,-10 3.5,-6 5.5,0 0,-4 -5.5,0 -3.5,-6 -8,-10 -2.5,-10" fill="%23FBBF24"/>
    </g>
    <!-- Banner Ribbon -->
    <path d="M34 148 L100 156 L166 148 L156 168 L100 174 L44 168 Z" fill="url(%23gold-trim-mh)"/>
    <text x="100" y="165" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="%23431407" text-anchor="middle" letter-spacing="1">MOUNTAINHEARTS</text>
  </svg>`,

  'house-stormchasers': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="sc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%2338BDF8"/>
        <stop offset="50%" stop-color="%232E90FA"/>
        <stop offset="100%" stop-color="%23175CD3"/>
      </linearGradient>
      <linearGradient id="gold-trim-sc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23E0F2FE"/>
        <stop offset="50%" stop-color="%2338BDF8"/>
        <stop offset="100%" stop-color="%230284C7"/>
      </linearGradient>
    </defs>
    <!-- Outer Shield Frame -->
    <path d="M100 15 L175 42 C175 115 145 165 100 188 C55 165 25 115 25 42 Z" fill="url(%23sc-bg)" stroke="%23F8FAFC" stroke-width="6" stroke-linejoin="round"/>
    <!-- Inner Accent Border -->
    <path d="M100 24 L165 48 C165 110 138 153 100 174 C62 153 35 110 35 48 Z" fill="none" stroke="%2338BDF8" stroke-width="1.8" opacity="0.6"/>
    <!-- Lightning Bolt Accents -->
    <path d="M52 56 L42 86 L56 86 L48 116 L74 76 L60 76 Z" fill="%23FDE047" opacity="0.8"/>
    <path d="M148 56 L158 86 L144 86 L152 116 L126 76 L140 76 Z" fill="%23FDE047" opacity="0.8"/>
    <!-- Center Majestic Eagle Motif -->
    <g fill="%23FFFFFF" transform="translate(100, 92) scale(0.95)">
      <!-- Spread Wings -->
      <path d="M0 -8 C-22 -38 -56 -36 -62 -18 C-52 -10 -42 -2 -34 16 C-22 2 -12 6 0 14 C12 6 22 2 34 16 C42 -2 52 -10 62 -18 C56 -36 22 -38 0 -8 Z"/>
      <!-- Eagle Head / Beak -->
      <path d="M0 -34 C-10 -34 -14 -24 -12 -12 L0 0 L12 -12 C14 -24 10 -34 0 -34 Z"/>
      <path d="M-4 -16 L0 -4 L4 -16 L6 -10 L0 4 L-6 -10 Z" fill="%23F59E0B"/>
      <!-- Eyes -->
      <circle cx="-6" cy="-20" r="2.5" fill="%230F172A"/>
      <circle cx="6" cy="-20" r="2.5" fill="%230F172A"/>
      <!-- Golden Crest Stars -->
      <polygon points="0,-44 2.5,-38 8,-38 3.5,-34 5.5,-28 0,-32 -5.5,-28 -3.5,-34 -8,-38 -2.5,-38" fill="%23FDE047"/>
    </g>
    <!-- Banner Ribbon -->
    <path d="M34 148 L100 156 L166 148 L156 168 L100 174 L44 168 Z" fill="%230F172A"/>
    <text x="100" y="165" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="%2338BDF8" text-anchor="middle" letter-spacing="1.2">STORMCHASERS</text>
  </svg>`,

  'house-thunderhooves': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="th-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%239333EA"/>
        <stop offset="50%" stop-color="%237A5AF8"/>
        <stop offset="100%" stop-color="%234C1D95"/>
      </linearGradient>
      <linearGradient id="gold-trim-th" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FDF2F8"/>
        <stop offset="50%" stop-color="%23F472B6"/>
        <stop offset="100%" stop-color="%23DB2777"/>
      </linearGradient>
    </defs>
    <!-- Outer Shield Frame -->
    <path d="M100 15 L175 42 C175 115 145 165 100 188 C55 165 25 115 25 42 Z" fill="url(%23th-bg)" stroke="url(%23gold-trim-th)" stroke-width="6" stroke-linejoin="round"/>
    <!-- Inner Accent Border -->
    <path d="M100 24 L165 48 C165 110 138 153 100 174 C62 153 35 110 35 48 Z" fill="none" stroke="%23ffffff" stroke-width="1.8" opacity="0.35"/>
    <!-- Center Spirited Horse / Stallion Motif -->
    <g fill="%23FFFFFF" transform="translate(100, 94) scale(0.95)">
      <!-- Horse Mane & Head in Dynamic Profile -->
      <path d="M-8 -38 C-2 -44 14 -42 22 -30 C30 -18 36 -4 40 16 C34 14 26 8 22 2 C22 14 16 26 8 36 C-4 44 -20 46 -30 38 C-24 24 -16 10 -12 -6 C-22 -8 -30 -16 -32 -26 C-24 -24 -14 -20 -8 -26 Z"/>
      <!-- Golden Mane Highlights -->
      <path d="M18 -26 C28 -18 32 -6 34 8 C30 2 24 -2 20 -12 Z" fill="%23F472B6"/>
      <path d="M8 -38 C12 -30 14 -20 16 -10 C12 -16 8 -24 4 -32 Z" fill="%23FDF2F8"/>
      <!-- Eyes & Muzzle -->
      <circle cx="-16" cy="-14" r="2.8" fill="%23581C87"/>
      <!-- Golden Crown / Tiara -->
      <path d="M-12 -38 L-6 -48 L0 -40 L6 -48 L12 -38 Z" fill="%23FBBF24"/>
      <!-- Stars -->
      <circle cx="-38" cy="8" r="2.5" fill="%23FDF2F8"/>
      <circle cx="38" cy="-20" r="2.5" fill="%23FDF2F8"/>
      <circle cx="-28" cy="-2" r="1.8" fill="%23FBBF24"/>
    </g>
    <!-- Banner Ribbon -->
    <path d="M34 148 L100 156 L166 148 L156 168 L100 174 L44 168 Z" fill="%231E1B4B"/>
    <text x="100" y="165" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="%23F472B6" text-anchor="middle" letter-spacing="1">THUNDERHOOVES</text>
  </svg>`,
};

export function getDefaultHouseLogo(houseId: string): string {
  return DEFAULT_HOUSE_LOGOS[houseId] || DEFAULT_HOUSE_LOGOS['house-earthshakers'];
}
