import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  X,
  Phone,
  Instagram,
  User,
  FileText,
  Download,
  MessageCircle,
  Lock,
  Unlock,
  Image as ImageIcon,
  DollarSign,
  Sliders,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Info,
  Heart,
  Menu,
  Loader2,
  RefreshCw
} from 'lucide-react';

// ============================================================================
// 0. GOOGLE APPS SCRIPT API ENDPOINT (TINA STUDIO - SEATTLE, WA)
// ============================================================================

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwpIM1imVxZZsuI79KMZPOqAocQP0vxP9cAhxNhDX3kDxzzH4h3lpO8zaE7LLkJH9kNpQ/exec';

// ============================================================================
// 1. LOCAL STORAGE KEYS & DATE UTILITIES (TIMEZONE-SAFE)
// ============================================================================

const STORAGE_KEYS = {
  SERVICES: 'tina_studio_services_v1',
  BOOKINGS: 'tina_studio_bookings_v1',
  BLOCKED: 'tina_studio_blocked_v1',
  NAILS_ENABLED: 'tina_studio_nails_enabled_v1',
};

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatEditorialDate(dateKey, includeYear = true) {
  if (!dateKey) return '';
  const date = parseLocalDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

function getUpcomingOpenDates(count = 4) {
  const results = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (results.length < count) {
    const dayOfWeek = cursor.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      results.push(toLocalDateKey(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

// Studio's strict 3 daily appointment blocks on Fridays & Saturdays
const STUDIO_TIME_SLOTS = [
  { id: '9:00 AM', apiTime: '09:00', label: '9:00 AM', sublabel: 'Morning Session', hour24: 9, minute: 0 },
  { id: '12:30 PM', apiTime: '12:30', label: '12:30 PM', sublabel: 'Midday Session', hour24: 12, minute: 30 },
  { id: '4:00 PM', apiTime: '16:00', label: '4:00 PM', sublabel: 'Afternoon Session', hour24: 16, minute: 0 },
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ============================================================================
// 2. COMPLETE SERVICE CATALOG & STYLE METADATA
// ============================================================================

const INITIAL_SERVICES = [
  // --- LASHES ---
  {
    id: 'lash-lifting',
    category: 'Lashes',
    name: 'Lifting',
    price: 50,
    fullnessLevel: 1,
    fullnessLabel: 'Natural Curl',
    curlStyle: 'Keratin Lift & Deep Tint',
    durationText: '1 – 1.5 hrs (or part of 2.5 hr block)',
    shortDesc: 'Natural lash curl & tint enhancement using your own lashes.',
    fullDesc: 'A gentle keratin-infused lift that curls your natural lashes upward from the root, paired with a rich black tint for an effortless mascara-free wake-up look lasting 6–8 weeks.',
    idealFor: 'Clients with healthy natural lashes who want zero-maintenance curl without extensions.',
    illustrationType: 'lash-lifting',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-classic',
    category: 'Lashes',
    name: 'Classic',
    price: 60,
    fullnessLevel: 2,
    fullnessLabel: 'Natural Mascara',
    curlStyle: '1:1 Single Extension • C / CC Curl',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: '1:1 natural mascara look, one extension per natural lash.',
    fullDesc: 'One ultra-lightweight silk/mink extension is bonded to each individual natural lash. Adds clean length, curl, and subtle definition—like wearing your favorite lengthening mascara.',
    idealFor: 'First-time lash clients or anyone desiring timeless, understated everyday elegance.',
    illustrationType: 'lash-classic',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-hybrid',
    category: 'Lashes',
    name: 'Hybrid',
    price: 65,
    fullnessLevel: 3,
    fullnessLabel: 'Soft Textured',
    curlStyle: '50% Classic + 50% Volume Fans',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: '50/50 blend of Classic and Volume fans for textured fullness.',
    fullDesc: 'The perfect middle ground between Classic and Volume. Alternating single lashes and handmade multi-lash fans create soft density, gentle fluff, and natural dimension.',
    idealFor: 'Clients who want more fullness than Classic without going full glam.',
    illustrationType: 'lash-hybrid',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-wispy',
    category: 'Lashes',
    name: 'Wispy',
    price: 65,
    fullnessLevel: 3,
    fullnessLabel: 'Feathery Spikes',
    curlStyle: 'Staggered Peaks • Kim-K Inspired',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: 'Staggered spike lengths for a feathery, Kim-K inspired look.',
    fullDesc: 'Crafted with alternating closed peaks (spikes) and soft airy fans to achieve that coveted fluttery, textured strip-lash silhouette with noticeable high points.',
    idealFor: 'Clients who love an airy, fluttery, editorial "strip lash" look with soft peaks.',
    illustrationType: 'lash-wispy',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-wet',
    category: 'Lashes',
    name: 'Wet Set',
    price: 65,
    fullnessLevel: 3,
    fullnessLabel: 'Sleek Glossy',
    curlStyle: 'Closed Narrow Fans • Glossy Finish',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: "Closed volume fans creating a sleek, glossy 'fresh out of water' look.",
    fullDesc: 'Uses narrow, closed volume fans instead of wide fluffy fans, creating sleek, dark, glossy spikes that mimic lashes right after stepping out of water or applying fresh serum.',
    idealFor: 'Clients who want darker definition than Classic with a modern, chic, spiky texture.',
    illustrationType: 'lash-wet',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-hawaiian',
    category: 'Lashes',
    name: 'Hawaiian',
    price: 70,
    fullnessLevel: 3,
    fullnessLabel: 'Airy Tropical',
    curlStyle: 'Light Wispy Texture • Soft Flutter',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: 'Soft, airy, tropical wispy texture with light volume.',
    fullDesc: 'A breezy, romantic custom mapping featuring delicate wispy tips and light, breathable fans that frame the eyes softly without feeling heavy.',
    idealFor: 'Vacation-ready beauty lovers who want a light, dreamy, sun-kissed flutter.',
    illustrationType: 'lash-hawaiian',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-egypt',
    category: 'Lashes',
    name: 'Egypt Set',
    price: 70,
    fullnessLevel: 4,
    fullnessLabel: 'Foxy Cat-Eye',
    curlStyle: 'Elongated Outer Wing • L / M / CC Curl',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: 'Bold, defined, elongated cat-eye / foxy wispy styling.',
    fullDesc: 'Signature elongated outer-corner mapping with sharp wispy peaks that visually lift and lengthen the eye shape for an exotic, sculpted foxy-eye eyeliner effect.',
    idealFor: 'Clients who love winged eyeliner and want a lifted, sultry almond-eye silhouette.',
    illustrationType: 'lash-egypt',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-volume',
    category: 'Lashes',
    name: 'Volume',
    price: 80,
    fullnessLevel: 4,
    fullnessLabel: 'Fluffy Glam',
    curlStyle: '3D–6D Handmade Fluffy Fans',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: 'Handmade fluffy fans (3D–6D) for a full, glamorous lash line.',
    fullDesc: 'Every fan is hand-crafted during your appointment using 3 to 6 ultra-fine fibers wrapped around a single natural lash—delivering a plush, velvety, uniform dark lash line.',
    idealFor: 'Clients who love full, fluffy, red-carpet glamour and a dark lash-line effect.',
    illustrationType: 'lash-volume',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-mega-volume',
    category: 'Lashes',
    name: 'Mega Volume',
    price: 80,
    fullnessLevel: 5,
    fullnessLabel: 'Ultra Dramatic',
    curlStyle: '8D–14D Featherlight Dense Fans',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: 'Ultra-dense, dramatic dark lash line with lightweight fans.',
    fullDesc: 'Our boldest, darkest, most luxurious set. Crafted with microscopic 0.03mm fibers so even ultra-dense fans remain weightless and safe for your natural lashes.',
    idealFor: 'Clients seeking maximum drama, pitch-black density, and show-stopping fullness.',
    illustrationType: 'lash-mega',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-wispy-volume',
    category: 'Lashes',
    name: 'Wispy Volume',
    price: 80,
    fullnessLevel: 5,
    fullnessLabel: 'Glam + Spikes',
    curlStyle: 'Fluffy Volume Base + Tall Peaks',
    durationText: '2.5 – 3 hrs session block',
    shortDesc: 'Full fluffy volume base combined with prominent textured spikes.',
    fullDesc: 'Combines the plush, dark fullness of a Volume base with dramatic, high-contrast wispy spikes for bold texture and unmistakable dimension.',
    idealFor: 'Clients who want both dense volume fullness AND dramatic, spiky wispy peaks.',
    illustrationType: 'lash-wispy-volume',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-refill',
    category: 'Lashes',
    name: 'Refill',
    price: 55,
    fullnessLevel: 3,
    fullnessLabel: 'Maintenance Fill',
    curlStyle: '2–3 Week Maintenance (40%+ Remaining)',
    durationText: '2 – 2.5 hrs session block',
    shortDesc: 'Maintenance fill (must have at least 40% extensions remaining).',
    fullDesc: 'Outgrown extensions are gently removed and new extensions are applied to fresh natural lash growth. Note: At least 40% of extensions must remain; otherwise a Full Set is required.',
    idealFor: 'Returning clients within 2 to 3 weeks of their previous lash appointment.',
    illustrationType: 'lash-refill',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'lash-remove',
    category: 'Lashes',
    name: 'Remove',
    price: 40,
    fullnessLevel: 1,
    fullnessLabel: 'Gentle Removal',
    curlStyle: 'Soothing Cream Dissolver + Lash Bath',
    durationText: '45 min – 1 hr',
    shortDesc: 'Gentle, damage-free cream removal & nourishing lash bath.',
    fullDesc: 'Professional cream bond dissolver safely slides off existing extensions without tugging or damaging your natural lashes, finished with a soothing foaming lash cleanse.',
    idealFor: 'Clients ready for a fresh bare-lash break or transitioning from another studio.',
    illustrationType: 'lash-remove',
    photoUrl: '',
    isAddOnFriendly: true,
  },

  // --- EYEBROW ---
  {
    id: 'brow-lamination',
    category: 'Eyebrow',
    name: 'Lamination',
    price: 20,
    fullnessLevel: 3,
    fullnessLabel: 'Fluffy & Lifted',
    curlStyle: 'Keratin Brow Restructure (6–8 Weeks)',
    durationText: '40 min (Great Add-On)',
    shortDesc: 'Sleek, brushed-up fuller brow shape lasting 6–8 weeks.',
    fullDesc: 'Realigns unruly or downward-growing brow hairs into a lifted, feathery, symmetrical arch that stays brushed-up and full with minimal daily styling.',
    idealFor: 'Anyone wanting fuller-looking, symmetrical, editorial brushed-up brows.',
    illustrationType: 'brow-lamination',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'brow-wax-mapping',
    category: 'Eyebrow',
    name: 'Wax + Mapping',
    price: 35,
    fullnessLevel: 2,
    fullnessLabel: 'Sculpted Arch',
    curlStyle: 'Golden-Ratio Facial Mapping + Gentle Wax',
    durationText: '35 min (Great Add-On)',
    shortDesc: 'Precision facial symmetry mapping and clean brow shaping.',
    fullDesc: 'Custom architectural brow mapping tailored to your bone structure, followed by gentle precision waxing and trimming for crisp, balanced arches.',
    idealFor: 'Clients seeking clean, symmetrical brow architecture tailored to their face.',
    illustrationType: 'brow-mapping',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'brow-tint-henna',
    category: 'Eyebrow',
    name: 'Brow Tint (Henna)',
    price: 40,
    fullnessLevel: 4,
    fullnessLabel: 'Defined Fill',
    curlStyle: 'Natural Botanical Henna Stain',
    durationText: '45 min (Great Add-On)',
    shortDesc: 'Long-lasting skin stain and brow hair tint for a filled-in look.',
    fullDesc: 'Rich botanical henna tints both the brow hairs and the underlying skin—filling sparse gaps with a soft powder-brow makeup shadow.',
    idealFor: 'Sparse brows or clients who want to skip filling in their eyebrows every morning.',
    illustrationType: 'brow-henna',
    photoUrl: '',
    isAddOnFriendly: true,
  },

  // --- WAXING ---
  {
    id: 'wax-arm',
    category: 'Waxing',
    name: 'Arm',
    price: 15,
    fullnessLevel: 1,
    fullnessLabel: 'Silky Smooth',
    curlStyle: 'Gentle Low-Temp Creamy Wax',
    durationText: '20 min (Great Add-On)',
    shortDesc: 'Smooth, gentle arm hair removal with soothing post-care.',
    fullDesc: 'Delicate waxing formula removes hair cleanly from the root for weeks of smooth, soft skin without razor irritation.',
    idealFor: 'Effortlessly smooth arms with finer regrowth over time.',
    illustrationType: 'waxing',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'wax-underarm',
    category: 'Waxing',
    name: 'Underarm',
    price: 15,
    fullnessLevel: 1,
    fullnessLabel: 'Clean & Smooth',
    curlStyle: 'Sensitive-Skin Hard Wax',
    durationText: '15 min (Great Add-On)',
    shortDesc: 'Quick, clean underarm waxing for silky smooth skin.',
    fullDesc: 'Fast, gentle sensitive-area waxing that reduces dark shadow and ingrown hairs while keeping underarms smooth for weeks.',
    idealFor: 'Quick add-on to any lash or brow appointment.',
    illustrationType: 'waxing',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'wax-lips',
    category: 'Waxing',
    name: 'Lips',
    price: 5,
    fullnessLevel: 1,
    fullnessLabel: 'Precision Touch',
    curlStyle: 'Ultra-Gentle Facial Hard Wax',
    durationText: '10 min (Quick Add-On)',
    shortDesc: 'Gentle upper lip precision waxing with calming aloe finish.',
    fullDesc: 'Quick, gentle upper lip hair removal designed specifically for delicate facial skin, leaving makeup application flawless.',
    idealFor: 'An easy $5 add-on during your lash or brow visit.',
    illustrationType: 'waxing',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'wax-bikini-trad',
    category: 'Waxing',
    name: 'Traditional Bikini',
    price: 20,
    fullnessLevel: 2,
    fullnessLabel: 'Classic Clean',
    curlStyle: 'Gentle Low-Heat Hard Wax',
    durationText: '20 min (Great Add-On)',
    shortDesc: 'Clean, natural bikini-line grooming outside swimwear edges.',
    fullDesc: 'Removes hair cleanly along the classic panty/swimwear line using gentle, skin-hugging hard wax for minimal discomfort.',
    idealFor: 'Clean, natural swimwear-ready upkeep.',
    illustrationType: 'waxing',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'wax-bikini-ext',
    category: 'Waxing',
    name: 'Extended Bikini',
    price: 30,
    fullnessLevel: 3,
    fullnessLabel: 'Deep Sculpt',
    curlStyle: 'Precision Comfort Hard Wax',
    durationText: '30 min',
    shortDesc: 'Deeper bikini-line shaping tailored to your comfort.',
    fullDesc: 'Takes more in from the sides and top than a traditional bikini wax for a sleeker, longer-lasting finish.',
    idealFor: 'Clients wanting extra smoothness beyond a standard bikini line.',
    illustrationType: 'waxing',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'wax-half-leg',
    category: 'Waxing',
    name: 'Half Leg',
    price: 25,
    fullnessLevel: 2,
    fullnessLabel: 'Knee to Ankle',
    curlStyle: 'Creamy Soft Wax + Hydrating Oil',
    durationText: '25 min',
    shortDesc: 'Smooth waxing from knee to ankle with calming botanical oil.',
    fullDesc: 'Removes hair cleanly from knees down to ankles/toes, leaving skin radiant, exfoliated, and touchably soft.',
    idealFor: 'Quick lower-leg smoothness between full treatments.',
    illustrationType: 'waxing',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'wax-full-leg',
    category: 'Waxing',
    name: 'Full Leg',
    price: 35,
    fullnessLevel: 3,
    fullnessLabel: 'Hip to Ankle',
    curlStyle: 'Full-Length Silky Wax Treatment',
    durationText: '45 min',
    shortDesc: 'Complete silky smooth waxing from hip to ankle.',
    fullDesc: 'Comprehensive full-leg hair removal leaving skin luminous and smooth for 3–4 weeks without daily shaving.',
    idealFor: 'Complete head-to-toe smoothness for vacations or special occasions.',
    illustrationType: 'waxing',
    photoUrl: '',
    isAddOnFriendly: true,
  },

  // --- FACIAL ---
  {
    id: 'facial-extractions',
    category: 'Facial',
    name: 'Facial with Extractions',
    price: 40,
    fullnessLevel: 3,
    fullnessLabel: '40 Min Deep Glow',
    curlStyle: 'Steam • Pore Extractions • Calming Mask',
    durationText: '40 min',
    shortDesc: '40 min deep pore cleansing, steam, and gentle extractions.',
    fullDesc: 'A revitalizing 40-minute clinical-meets-spa facial featuring double enzymatic cleansing, warm steam, meticulous gentle pore extractions, high-frequency purification, and a cooling hydrating mask.',
    idealFor: 'Congested pores, dullness, or anyone craving a clear, glass-skin glow.',
    illustrationType: 'facial',
    photoUrl: '',
    isAddOnFriendly: true,
  },

  // --- NAILS (LAUNCHING MID-DECEMBER — TOGGLEABLE IN ADMIN) ---
  {
    id: 'nails-acrylic',
    category: 'Nails',
    name: 'Acrylic Full Set',
    price: 55,
    fullnessLevel: 4,
    fullnessLabel: 'Sculpted Length',
    curlStyle: 'Custom Shape & Gloss Gel Topcoat',
    durationText: '2 – 2.5 hrs session block',
    shortDesc: 'Sculpted custom-length acrylic extensions with glossy gel finish.',
    fullDesc: 'Durable, precision-sculpted acrylic nail extensions customized to your desired shape (almond, coffin, square) and finished with high-shine gel polish.',
    idealFor: 'Clients wanting strong, structured length and flawless cuticle work.',
    illustrationType: 'nails',
    photoUrl: '',
    isAddOnFriendly: false,
  },
  {
    id: 'nails-gel-mani',
    category: 'Nails',
    name: 'Gel Manicure',
    price: 40,
    fullnessLevel: 2,
    fullnessLabel: 'Natural Gloss',
    curlStyle: 'Russian-Inspired Cuticle Care + Gel',
    durationText: '1 hr (Great Add-On)',
    shortDesc: 'Detailed cuticle care, shaping, and chip-free glossy gel polish.',
    fullDesc: 'Meticulous natural nail shaping, gentle cuticle detailing, and curing high-gloss gel color that stays chip-free for up to 3 weeks.',
    idealFor: 'Natural nail lovers wanting clean, glossy, long-lasting polish.',
    illustrationType: 'nails',
    photoUrl: '',
    isAddOnFriendly: true,
  },
  {
    id: 'nails-soft-gel',
    category: 'Nails',
    name: 'Soft Gel Extensions',
    price: 50,
    fullnessLevel: 3,
    fullnessLabel: 'Lightweight Chic',
    curlStyle: 'Full-Cover Soak-Off Soft Gel Tips',
    durationText: '1.5 – 2 hrs',
    shortDesc: 'Lightweight, natural-feeling full-cover soft gel extensions.',
    fullDesc: 'Flexible, odor-free soft gel tips bonded seamlessly over your natural nail for instant salon-perfect shape and lightweight comfort.',
    idealFor: 'Clients wanting natural-feeling extensions without heavy acrylic.',
    illustrationType: 'nails',
    photoUrl: '',
    isAddOnFriendly: false,
  },
];

// ============================================================================
// 3. BESPOKE SVG ILLUSTRATIONS (TINA STUDIO LOGO & LASH/BEAUTY LOOK ART)
// ============================================================================

function TinaStudioWordmark({ compact = false }) {
  return (
    <div className="inline-flex flex-col items-center select-none">
      <svg
        viewBox="0 0 260 66"
        className={compact ? 'h-9 w-auto' : 'h-12 sm:h-14 w-auto'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TINA STUDIO"
      >
        <path
          d="M18 14C10 14 5 19 5 26C5 31 8 34 12 34C10 31 11 27 16 27H25V54H37V27H45C52 27 57 22 57 14H54C52 18 48 19 42 19H28C24 16 21 14 18 14Z"
          fill="#222120"
        />
        <rect x="65" y="15" width="12" height="39" fill="#222120" />
        <path
          d="M86 15H99L122 41V15H133V54H122L97 26V54H86V15Z"
          fill="#222120"
        />
        <path
          d="M164 14C172 14 180 22 186 38C190 48 196 51 202 47C200 53 194 56 187 56C179 56 174 51 170 41H152L147 54H136L155 19C152 17 149 16 146 16C151 14 158 14 164 14ZM161 23L154 38H168L161 23Z"
          fill="#222120"
        />
        <circle cx="216" cy="22" r="2.5" fill="#C5A059" />
        <text
          x="224"
          y="33"
          fill="#222120"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="11"
          letterSpacing="3"
          fontWeight="600"
        >
          STUDIO
        </text>
        <text
          x="224"
          y="46"
          fill="#6E685F"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontSize="6.5"
          letterSpacing="1.8"
          fontWeight="500"
        >
          EST. BEAUTY
        </text>
      </svg>
      {!compact && (
        <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#6E685F] font-medium -mt-1">
          By Valentina Arraiz
        </span>
      )}
    </div>
  );
}

function ServiceLookIllustration({ type, customPhotoUrl, name }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [customPhotoUrl]);

  if (customPhotoUrl && !imgError) {
    return (
      <div className="relative w-full h-40 overflow-hidden bg-[#F7F4EF]">
        <img
          src={customPhotoUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#222120]/25 via-transparent to-transparent" />
      </div>
    );
  }

  const renderArt = () => {
    switch (type) {
      case 'lash-lifting':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M45 78 Q120 58 195 78" stroke="#222120" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {[60, 76, 92, 108, 124, 140, 156, 172, 184].map((x, idx) => (
              <path
                key={x}
                d={`M${x} ${72 - Math.sin((idx / 8) * Math.PI) * 8} Q${x + 4} ${42 - Math.sin((idx / 8) * Math.PI) * 10} ${x + 12} ${32 - Math.sin((idx / 8) * Math.PI) * 8}`}
                stroke="#222120"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            ))}
            <circle cx="195" cy="30" r="3" fill="#C5A059" opacity="0.7" />
          </svg>
        );
      case 'lash-classic':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M40 80 Q120 55 200 80" stroke="#222120" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {Array.from({ length: 15 }).map((_, i) => {
              const t = i / 14;
              const x = 52 + t * 136;
              const baseY = 76 - Math.sin(t * Math.PI) * 11;
              const len = 24 + Math.sin(t * Math.PI) * 14;
              return (
                <path
                  key={i}
                  d={`M${x} ${baseY} Q${x + (t - 0.5) * 10} ${baseY - len * 0.6} ${x + (t - 0.5) * 18} ${baseY - len}`}
                  stroke="#222120"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        );
      case 'lash-hybrid':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M40 80 Q120 55 200 80" stroke="#222120" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            {Array.from({ length: 13 }).map((_, i) => {
              const t = i / 12;
              const x = 54 + t * 132;
              const baseY = 76 - Math.sin(t * Math.PI) * 11;
              const len = 26 + Math.sin(t * Math.PI) * 15;
              const isFan = i % 2 === 1;
              return isFan ? (
                <g key={i} stroke="#222120" strokeWidth="1.2" opacity="0.85">
                  <line x1={x} y1={baseY} x2={x - 5} y2={baseY - len} />
                  <line x1={x} y1={baseY} x2={x} y2={baseY - len - 2} />
                  <line x1={x} y1={baseY} x2={x + 5} y2={baseY - len} />
                </g>
              ) : (
                <line key={i} x1={x} y1={baseY} x2={x + (t - 0.5) * 10} y2={baseY - len - 3} stroke="#222120" strokeWidth="1.8" strokeLinecap="round" />
              );
            })}
          </svg>
        );
      case 'lash-wispy':
      case 'lash-hawaiian':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M40 82 Q120 56 200 82" stroke="#222120" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            {Array.from({ length: 18 }).map((_, i) => {
              const t = i / 17;
              const x = 50 + t * 140;
              const baseY = 77 - Math.sin(t * Math.PI) * 12;
              const len = 18 + Math.sin(t * Math.PI) * 10;
              return (
                <line key={`b-${i}`} x1={x} y1={baseY} x2={x + (t - 0.5) * 12} y2={baseY - len} stroke="#222120" strokeWidth="1" opacity="0.55" />
              );
            })}
            {[0.18, 0.34, 0.5, 0.66, 0.82].map((t, idx) => {
              const x = 50 + t * 140;
              const baseY = 77 - Math.sin(t * Math.PI) * 12;
              const spikeLen = 34 + Math.sin(t * Math.PI) * 14;
              return (
                <g key={`s-${idx}`}>
                  <line x1={x - 1} y1={baseY} x2={x + (t - 0.5) * 14} y2={baseY - spikeLen} stroke="#222120" strokeWidth="2.1" strokeLinecap="round" />
                  <line x1={x + 1} y1={baseY} x2={x + (t - 0.5) * 14} y2={baseY - spikeLen} stroke="#C5A059" strokeWidth="0.9" strokeLinecap="round" />
                </g>
              );
            })}
          </svg>
        );
      case 'lash-wet':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M40 80 Q120 56 200 80" stroke="#222120" strokeWidth="3" fill="none" strokeLinecap="round" />
            {Array.from({ length: 12 }).map((_, i) => {
              const t = i / 11;
              const x = 54 + t * 132;
              const baseY = 76 - Math.sin(t * Math.PI) * 11;
              const len = 28 + Math.sin(t * Math.PI) * 14;
              return (
                <polygon
                  key={i}
                  points={`${x - 1.5},${baseY} ${x + 1.5},${baseY} ${x + (t - 0.5) * 12},${baseY - len}`}
                  fill="#222120"
                />
              );
            })}
          </svg>
        );
      case 'lash-egypt':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M38 82 Q125 62 205 70" stroke="#222120" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            {Array.from({ length: 16 }).map((_, i) => {
              const t = i / 15;
              const x = 48 + t * 150;
              const baseY = 79 - t * 9;
              const len = 16 + Math.pow(t, 1.35) * 34;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={baseY}
                  x2={x + 8 + t * 16}
                  y2={baseY - len}
                  stroke="#222120"
                  strokeWidth={i % 3 === 0 ? '2.1' : '1.2'}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        );
      case 'lash-volume':
      case 'lash-mega':
      case 'lash-wispy-volume':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M38 82 Q120 54 202 82" stroke="#222120" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            {Array.from({ length: 22 }).map((_, i) => {
              const t = i / 21;
              const x = 46 + t * 148;
              const baseY = 78 - Math.sin(t * Math.PI) * 13;
              const isExtraSpike = type === 'lash-wispy-volume' && i % 4 === 2;
              const len = (type === 'lash-mega' ? 34 : 29) + Math.sin(t * Math.PI) * 14 + (isExtraSpike ? 9 : 0);
              return (
                <g key={i} stroke="#222120" strokeWidth={type === 'lash-mega' ? '1.6' : '1.3'} opacity="0.88">
                  <line x1={x} y1={baseY} x2={x - 4 + (t - 0.5) * 10} y2={baseY - len} />
                  <line x1={x} y1={baseY} x2={x + (t - 0.5) * 12} y2={baseY - len - 1} />
                  <line x1={x} y1={baseY} x2={x + 4 + (t - 0.5) * 14} y2={baseY - len} />
                </g>
              );
            })}
          </svg>
        );
      case 'lash-refill':
      case 'lash-remove':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <circle cx="120" cy="60" r="34" stroke="#D49BA7" strokeWidth="1.2" fill="#F3DCE0" fillOpacity="0.35" />
            <path d="M72 64 Q120 46 168 64" stroke="#222120" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {[86, 102, 120, 138, 154].map((x, idx) => (
              <line
                key={x}
                x1={x}
                y1={58 - Math.sin((idx / 4) * Math.PI) * 4}
                x2={x + (idx - 2) * 4}
                y2={36 - Math.sin((idx / 4) * Math.PI) * 4}
                stroke="#222120"
                strokeWidth="1.5"
                strokeDasharray={type === 'lash-remove' ? '3 3' : 'none'}
                strokeLinecap="round"
              />
            ))}
          </svg>
        );
      case 'brow-lamination':
      case 'brow-mapping':
      case 'brow-henna':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path
              d="M46 72 Q115 36 194 64 Q145 55 112 58 Q74 63 46 72 Z"
              fill={type === 'brow-henna' ? '#4A3B32' : '#222120'}
              fillOpacity={type === 'brow-henna' ? '0.82' : '0.14'}
              stroke="#222120"
              strokeWidth="1.4"
            />
            {Array.from({ length: 16 }).map((_, i) => {
              const t = i / 15;
              const x = 52 + t * 134;
              const y = 68 - Math.sin(t * Math.PI) * 16;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={y + 4}
                  x2={x + (type === 'brow-lamination' ? 3 : 8)}
                  y2={y - (type === 'brow-lamination' ? 14 : 9)}
                  stroke="#222120"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              );
            })}
            {type === 'brow-mapping' && (
              <g stroke="#C5A059" strokeWidth="1" strokeDasharray="3 3">
                <line x1="46" y1="22" x2="46" y2="95" />
                <line x1="128" y1="22" x2="128" y2="95" />
                <line x1="194" y1="22" x2="194" y2="95" />
              </g>
            )}
          </svg>
        );
      case 'waxing':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path d="M55 82 C95 42, 145 42, 185 82" stroke="#C5A059" strokeWidth="1.8" fill="none" />
            <path d="M70 72 C105 46, 135 46, 170 72" stroke="#D49BA7" strokeWidth="1.5" fill="none" />
            <path d="M120 26 L124 38 L136 42 L124 46 L120 58 L116 46 L104 42 L116 38 Z" fill="#C5A059" fillOpacity="0.65" />
          </svg>
        );
      case 'facial':
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <ellipse cx="120" cy="60" rx="28" ry="38" stroke="#222120" strokeWidth="1.5" fill="#F3DCE0" fillOpacity="0.3" />
            <path d="M106 54 Q112 50 116 54" stroke="#222120" strokeWidth="1.4" fill="none" />
            <path d="M124 54 Q128 50 134 54" stroke="#222120" strokeWidth="1.4" fill="none" />
            <path d="M114 72 Q120 76 126 72" stroke="#222120" strokeWidth="1.4" fill="none" />
            <circle cx="164" cy="36" r="3" fill="#C5A059" />
            <circle cx="76" cy="44" r="2.5" fill="#D49BA7" />
          </svg>
        );
      case 'nails':
      default:
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            {[94, 112, 130, 148].map((x, i) => {
              const h = i === 1 || i === 2 ? 46 : 38;
              const y = 78 - h;
              return (
                <g key={x}>
                  <path
                    d={`M${x - 6} 88 V${y + 8} Q${x} ${y - 4} ${x + 6} ${y + 8} V88`}
                    fill="#F3DCE0"
                    stroke="#222120"
                    strokeWidth="1.4"
                  />
                  <path
                    d={`M${x - 5} ${y + 11} Q${x} ${y + 3} ${x + 5} ${y + 11}`}
                    stroke="#C5A059"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </g>
              );
            })}
          </svg>
        );
    }
  };

  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-[#F7F4EF] via-[#EDEAE4] to-[#F3DCE0]/45 flex flex-col items-center justify-center overflow-hidden border-b border-[#DDD6CC]/70">
      <div className="w-full h-28 px-4 transition-transform duration-500 group-hover:scale-105">
        {renderArt()}
      </div>
      <span className="text-[10px] uppercase tracking-[0.22em] text-[#7D766D] font-medium pb-2">
        Studio Style Preview
      </span>
    </div>
  );
}

function FullnessMeter({ level = 3, label }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1" title={`Intensity: ${level}/5`}>
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={`h-1.5 w-4 rounded-full transition-colors ${
              step <= level ? 'bg-[#222120]' : 'bg-[#DDD6CC]'
            }`}
          />
        ))}
      </div>
      {label && (
        <span className="text-[11px] font-medium tracking-wide text-[#6E685F]">
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 4. ICS CALENDAR FILE DOWNLOAD GENERATOR (APPLE / GOOGLE / OUTLOOK)
// ============================================================================

function downloadBookingICS(booking, studioPhone = '+1 (000) 000-0000') {
  const [year, month, day] = booking.date.split('-').map(Number);
  const slotObj = STUDIO_TIME_SLOTS.find((s) => s.id === booking.time) || { hour24: 9, minute: 0 };
  const start = new Date(year, month - 1, day, slotObj.hour24, slotObj.minute, 0);
  const end = new Date(start.getTime() + 180 * 60 * 1000);

  const pad = (n) => String(n).padStart(2, '0');
  const formatICSDate = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const serviceNames = booking.services.map((s) => `${s.name} ($${s.price})`).join(', ');

  const description = [
    `Appointment at TINA STUDIO by Valentina Arraiz`,
    `Reference: ${booking.refCode}`,
    `Services: ${serviceNames}`,
    `Estimated Total: $${booking.total} (Pay at Studio)`,
    `Prep Reminder: Please arrive with clean, makeup-free lashes & eye area.`,
    `Studio Contact: ${studioPhone}`,
  ].join('\\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TINA STUDIO by Valentina Arraiz//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@tinastudio.beauty`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:TINA STUDIO — ${booking.services[0]?.name || 'Beauty Appointment'}`,
    `DESCRIPTION:${description}`,
    'LOCATION:TINA STUDIO by Valentina Arraiz (Seattle, WA)',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `TINA-STUDIO-booking-${booking.date}-${booking.refCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  useEffect(() => {
    const existingLink = document.getElementById('tina-studio-fonts');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'tina-studio-fonts';
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // --- Google Calendar Live Availability State (GET /exec) ---
  const [gcalBusySlots, setGcalBusySlots] = useState([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const fetchGoogleCalendarAvailability = async () => {
    setIsLoadingCalendar(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.busySlots)) {
        setGcalBusySlots(data.busySlots);
      }
    } catch (err) {
      console.error('Error sincronizando con Google Calendar:', err);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => {
    fetchGoogleCalendarAvailability();
  }, []);

  // --- Persistent State via localStorage ---
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to read services from storage', e);
    }
    return INITIAL_SERVICES;
  });

  const [nailsEnabled, setNailsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NAILS_ENABLED);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to read bookings from storage', e);
    }
    return [];
  });

  const [blockedSlots, setBlockedSlots] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOCKED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error(e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NAILS_ENABLED, JSON.stringify(nailsEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [nailsEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(blockedSlots));
    } catch (e) {
      console.error(e);
    }
  }, [blockedSlots]);

  // --- App Navigation & UI States ---
  const [mode, setMode] = useState('client');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? '' : prev));
    }, 3800);
  };

  // --- Client Booking Flow State ---
  const [bookingStep, setBookingStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['lash-wispy']);
  const [inspectService, setInspectService] = useState(null);

  const initialUpcomingKey = useMemo(() => getUpcomingOpenDates(1)[0], []);
  const [calendarMonth, setCalendarMonth] = useState(() => parseLocalDateKey(initialUpcomingKey));
  const [selectedDateKey, setSelectedDateKey] = useState(initialUpcomingKey);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const [clientForm, setClientForm] = useState({
    clientName: '',
    phone: '',
    instagram: '',
    notes: '',
  });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // --- Owner Admin State ---
  const [adminTab, setAdminTab] = useState('appointments');
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('All');
  const [blockReasonInput, setBlockReasonInput] = useState('Personal / Unavailable');

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [selectedServices]
  );

  const estimatedDurationLabel = useMemo(() => {
    if (selectedServices.length === 0) return '2.5 – 3 hrs';
    const hasFullSession = selectedServices.some(
      (s) =>
        (s.category === 'Lashes' && s.id !== 'lash-remove' && s.id !== 'lash-lifting') ||
        s.id === 'nails-acrylic' ||
        s.id === 'nails-soft-gel'
    );
    if (hasFullSession) {
      return selectedServices.length > 1 ? '2.5–3 hrs (Combined Session)' : '2.5 – 3 hrs';
    }
    return selectedServices.length > 1 ? '1–1.5 hrs (Combined)' : selectedServices[0].durationText;
  }, [selectedServices]);

  const toggleServiceSelection = (service) => {
    if (service.category === 'Nails' && !nailsEnabled) {
      showToast('Nails menu launches Mid-December!');
      return;
    }
    setSelectedServiceIds((prev) => {
      if (prev.includes(service.id)) {
        return prev.filter((id) => id !== service.id);
      }
      return [...prev, service.id];
    });
  };

  // Check if a specific dateKey + timeSlot is booked in Google Calendar, local bookings, or blocked
  const getSlotStatus = (dateKey, timeId) => {
    const slotObj = STUDIO_TIME_SLOTS.find((s) => s.id === timeId);
    if (slotObj && gcalBusySlots.length > 0) {
      const [y, m, d] = dateKey.split('-').map(Number);
      const slotStart = new Date(y, m - 1, d, slotObj.hour24, slotObj.minute, 0).getTime();
      const slotEnd = slotStart + 180 * 60 * 1000;

      const isBusyInGcal = gcalBusySlots.some((busy) => {
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();
        return slotStart < busyEnd && slotEnd > busyStart;
      });

      if (isBusyInGcal) {
        return { status: 'booked', source: 'gcal' };
      }
    }

    const existingBooking = bookings.find((b) => b.date === dateKey && b.time === timeId);
    if (existingBooking) {
      return { status: 'booked', booking: existingBooking };
    }

    const existingBlock = blockedSlots.find((bl) => bl.date === dateKey && bl.time === timeId);
    if (existingBlock) {
      return { status: 'blocked', block: existingBlock };
    }

    return { status: 'available' };
  };

  const getAvailableSlotCount = (dateKey) => {
    return STUDIO_TIME_SLOTS.filter((slot) => getSlotStatus(dateKey, slot.id).status === 'available').length;
  };

  // Handle final booking submission -> POST to Google Calendar Apps Script
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedDateKey || !selectedTimeSlot || selectedServices.length === 0) return;
    if (!clientForm.clientName.trim() || !clientForm.phone.trim()) return;

    if (getSlotStatus(selectedDateKey, selectedTimeSlot).status !== 'available') {
      showToast('Sorry, that slot was just taken. Please pick another time.');
      setBookingStep(2);
      return;
    }

    const slotObj = STUDIO_TIME_SLOTS.find((s) => s.id === selectedTimeSlot);
    const serviceSummary = selectedServices.map((s) => `${s.name} ($${s.price})`).join(' + ');
    const contactSummary = [
      clientForm.instagram.trim() ? `IG: ${clientForm.instagram.trim()}` : null,
      `Tel: ${clientForm.phone.trim()}`,
    ]
      .filter(Boolean)
      .join(' / ');

    setIsSubmittingBooking(true);

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          date: selectedDateKey,
          time: slotObj ? slotObj.apiTime : '09:00',
          clientName: clientForm.clientName.trim(),
          service: serviceSummary,
          contact: contactSummary,
          notes: clientForm.notes.trim(),
        }),
      });

      const result = await response.json();

      if (result.status === 'conflict') {
        showToast('Este horario acaba de ser reservado. Por favor elige otro.');
        await fetchGoogleCalendarAvailability();
        setBookingStep(2);
        return;
      }

      if (result.status !== 'success') {
        throw new Error(result.message || 'No se pudo registrar la reserva.');
      }

      const refNumber = Math.floor(1000 + Math.random() * 9000);
      const newBooking = {
        id: result.eventId || `bk-${Date.now()}`,
        refCode: `TINA-${refNumber}`,
        date: selectedDateKey,
        time: selectedTimeSlot,
        clientName: clientForm.clientName.trim(),
        phone: clientForm.phone.trim(),
        instagram: clientForm.instagram.trim(),
        notes: clientForm.notes.trim(),
        services: selectedServices.map(({ id, name, price, category }) => ({
          id,
          name,
          price,
          category,
        })),
        total: totalPrice,
        createdAt: new Date().toISOString(),
      };

      setBookings((prev) => [...prev, newBooking]);
      if (result.start && result.end) {
        setGcalBusySlots((prev) => [...prev, { start: result.start, end: result.end }]);
      }
      setConfirmedBooking(newBooking);
      setBookingStep(4);
      showToast('Bloque reservado. Envía DM a @tinastudioo para confirmar.');
    } catch (error) {
      console.error('Error al reservar en Google Calendar:', error);
      showToast(error.message || 'Error de conexión al reservar. Intenta nuevamente.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const resetClientFlow = () => {
    setBookingStep(1);
    setSelectedTimeSlot('');
    setClientForm({ clientName: '', phone: '', instagram: '', notes: '' });
    setConfirmedBooking(null);
    fetchGoogleCalendarAvailability();
  };

  const buildAdminToClientWhatsAppUrl = (booking) => {
    const cleanDigits = booking.phone.replace(/\D/g, '');
    const serviceNames = booking.services.map((s) => s.name).join(' + ');
    const message = `Hi ${booking.clientName}! Reminder from *TINA STUDIO by Valentina Arraiz* for your *${serviceNames}* appointment on *${formatEditorialDate(booking.date)} at ${booking.time}*. Please come with clean, makeup-free lashes! See you soon ✨`;
    return cleanDigits
      ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  // ============================================================================
  // 6. CALENDAR PICKER RENDERER (STRICT FRIDAYS & SATURDAYS ONLY)
  // ============================================================================

  const renderStudioCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(<div key={`empty-${i}`} className="h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day, 12, 0, 0);
      const cellMidnight = new Date(year, month, day, 0, 0, 0);
      const weekday = cellDate.getDay(); // 5 = Friday, 6 = Saturday
      const isStudioDay = weekday === 5 || weekday === 6;
      const isPast = cellMidnight < today;
      const isBeyond90Days = cellMidnight > maxDate;
      const dateKey = toLocalDateKey(cellDate);
      const openSlots = isStudioDay && !isPast && !isBeyond90Days ? getAvailableSlotCount(dateKey) : 0;
      const isDisabled = !isStudioDay || isPast || isBeyond90Days;
      const isSelected = selectedDateKey === dateKey;

      cells.push(
        <button
          key={dateKey}
          type="button"
          disabled={isDisabled}
          onClick={() => {
            setSelectedDateKey(dateKey);
            setSelectedTimeSlot('');
          }}
          className={`relative h-12 w-full rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
            isDisabled
              ? 'text-[#B5AEA4]/55 cursor-not-allowed bg-transparent'
              : isSelected
              ? 'bg-[#222120] text-white font-semibold shadow-md ring-2 ring-[#C5A059]/60'
              : openSlots === 0
              ? 'bg-[#F3DCE0]/40 text-[#8F7A7E] hover:bg-[#F3DCE0]/60 cursor-pointer border border-[#D49BA7]/40'
              : 'bg-[#F7F4EF] text-[#222120] hover:bg-[#F3DCE0]/45 border border-[#DDD6CC] font-medium cursor-pointer'
          }`}
        >
          <span>{day}</span>
          {!isDisabled && (
            <span
              className={`text-[9px] leading-none mt-0.5 tracking-wider uppercase ${
                isSelected
                  ? 'text-[#C5A059]'
                  : openSlots === 0
                  ? 'text-[#B86B79]'
                  : 'text-[#6E685F]'
              }`}
            >
              {isLoadingCalendar ? '...' : openSlots === 0 ? 'Full' : `${openSlots} left`}
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-[#DDD6CC] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#F7F4EF] border-b border-[#DDD6CC]">
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
            className="p-2 rounded-full hover:bg-[#EDEAE4] text-[#222120] transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="font-serif-editorial text-xl font-semibold text-[#222120]">
              {MONTHS_EN[month]} {year}
            </h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6E685F]">
              Fridays & Saturdays Only
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
            className="p-2 rounded-full hover:bg-[#EDEAE4] text-[#222120] transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {WEEKDAYS_EN.map((wd, idx) => (
              <div
                key={wd}
                className={`text-center text-xs uppercase tracking-wider py-1 font-medium ${
                  idx === 5 || idx === 6 ? 'text-[#222120]' : 'text-[#A8A096]'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">{cells}</div>

          <div className="mt-4 pt-3 border-t border-[#DDD6CC]/70 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E685F]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F7F4EF] border border-[#DDD6CC]" />
                Fri / Sat Open
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#222120]" />
                Selected
              </span>
            </div>
            <button
              type="button"
              onClick={fetchGoogleCalendarAvailability}
              className="inline-flex items-center gap-1 text-[11px] text-[#6E685F] hover:text-[#222120]"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
              <span>Sync Calendar</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 7. FILTERED SERVICES & UPCOMING DATES FOR ADMIN
  // ============================================================================

  const categories = ['All', 'Lashes', 'Eyebrow', 'Waxing', 'Facial', 'Nails'];

  const filteredServices = useMemo(() => {
    if (activeCategory === 'All') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  const quickAddOns = useMemo(
    () =>
      services.filter(
        (s) =>
          ['brow-lamination', 'brow-wax-mapping', 'wax-lips', 'wax-underarm'].includes(s.id) &&
          !selectedServiceIds.includes(s.id)
      ),
    [services, selectedServiceIds]
  );

  const upcomingStudioDates = useMemo(() => getUpcomingOpenDates(8), []);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const slotA = STUDIO_TIME_SLOTS.findIndex((s) => s.id === a.time);
      const slotB = STUDIO_TIME_SLOTS.findIndex((s) => s.id === b.time);
      return slotA - slotB;
    });
  }, [bookings]);

  // ============================================================================
  // 8. MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#EDEAE4] text-[#222120] font-sans-ui selection:bg-[#F3DCE0] selection:text-[#222120]">
      <style>{`
        .font-serif-editorial {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-sans-ui {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#222120] text-[#F7F4EF] px-5 py-3 rounded-full shadow-xl border border-[#C5A059]/40 flex items-center gap-2.5 text-sm">
          <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP EDITORIAL HEADER */}
      <header className="sticky top-0 z-30 bg-[#F7F4EF]/95 backdrop-blur-md border-b border-[#DDD6CC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              type="button"
              onClick={() => {
                setMode('client');
                setBookingStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left focus:outline-none group"
            >
              <TinaStudioWordmark />
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <a
                href="https://www.instagram.com/tinastudioo/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 mr-2 text-[#5C564E] hover:text-[#222120] transition-colors flex items-center justify-center rounded-full hover:bg-[#EDEAE4]"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setMode('client');
                  setBookingStep(1);
                }}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  mode === 'client' && bookingStep === 1
                    ? 'bg-[#EDEAE4] text-[#222120] font-medium'
                    : 'text-[#5C564E] hover:text-[#222120]'
                }`}
              >
                Services & Looks
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('client');
                  setBookingStep(selectedServices.length > 0 ? 2 : 1);
                }}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  mode === 'client' && bookingStep >= 2
                    ? 'bg-[#EDEAE4] text-[#222120] font-medium'
                    : 'text-[#5C564E] hover:text-[#222120]'
                }`}
              >
                Book Appointment
              </button>
              <div className="h-5 w-px bg-[#DDD6CC] mx-2" />
              <button
                type="button"
                onClick={() => setMode(mode === 'admin' ? 'client' : 'admin')}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all flex items-center gap-2 border ${
                  mode === 'admin'
                    ? 'bg-[#222120] text-[#F7F4EF] border-[#222120] shadow-sm'
                    : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-[#C5A059]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                {mode === 'admin' ? 'Exit Agenda' : "Valentina's Agenda"}
              </button>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <a
                href="https://www.instagram.com/tinastudioo/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#5C564E] hover:text-[#222120] transition-colors rounded-full hover:bg-[#EDEAE4]"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setMode(mode === 'admin' ? 'client' : 'admin')}
                className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium border ${
                  mode === 'admin'
                    ? 'bg-[#222120] text-white border-[#222120]'
                    : 'bg-white text-[#222120] border-[#DDD6CC]'
                }`}
              >
                {mode === 'admin' ? 'Client View' : 'Agenda'}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#222120]"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F7F4EF] border-b border-[#DDD6CC] px-4 py-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMode('client');
                setBookingStep(1);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#EDEAE4]"
            >
              Services & Looks
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('client');
                setBookingStep(selectedServices.length > 0 ? 2 : 1);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#EDEAE4]"
            >
              Book Appointment
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'admin' ? 'client' : 'admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium bg-[#222120] text-white"
            >
              {mode === 'admin' ? 'Switch to Client Booking' : "Valentina's Agenda (Owner)"}
            </button>
          </div>
        )}
      </header>

      {/* CLIENT EXPERIENCE */}
      {mode === 'client' ? (
        <main className="pb-28">
          {bookingStep === 1 && (
            <section className="bg-[#F7F4EF] border-b border-[#DDD6CC]">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3DCE0]/60 border border-[#D49BA7]/40 text-xs uppercase tracking-[0.2em] text-[#222120] font-medium mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Lashes • Brows • Waxing • Facials</span>
                </div>
                <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#222120] leading-[1.1]">
                  Bespoke Beauty, Crafted with
                  <span className="italic font-normal text-[#6E685F]"> Editorial Precision</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-[#5C564E] leading-relaxed">
                  Explore our lash styles, fullness guide, and studio treatments below. Reserve your private Friday or Saturday session online—no online prepayment required.
                </p>

                <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 py-3 rounded-2xl bg-white border border-[#DDD6CC] text-xs text-[#5C564E] shadow-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#222120]">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                    Open Fridays & Saturdays
                  </span>
                  <span className="hidden sm:inline text-[#DDD6CC]">|</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                    9:00 AM • 12:30 PM • 4:00 PM
                  </span>
                  <span className="hidden sm:inline text-[#DDD6CC]">|</span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#D49BA7]" />
                    Pay at Studio
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* 3-Step Progress Stepper */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
              {[
                { step: 1, label: '1. Select Services' },
                { step: 2, label: '2. Fri / Sat Time' },
                { step: 3, label: '3. Your Details' },
              ].map((item, idx) => {
                const isActive = bookingStep === item.step;
                const isCompleted = bookingStep > item.step;
                return (
                  <React.Fragment key={item.step}>
                    <button
                      type="button"
                      disabled={item.step > 1 && selectedServices.length === 0}
                      onClick={() => {
                        if (bookingStep !== 4) setBookingStep(item.step);
                      }}
                      className={`px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#222120] text-[#F7F4EF] shadow-sm'
                          : isCompleted
                          ? 'bg-white text-[#222120] border border-[#C5A059]'
                          : 'bg-[#F7F4EF] text-[#7D766D] border border-[#DDD6CC]'
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 text-[#C5A059]" />}
                      <span>{item.label}</span>
                    </button>
                    {idx < 2 && <div className="w-4 sm:w-8 h-px bg-[#DDD6CC]" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* STEP 1: SERVICES & VISUAL LOOKS */}
          {bookingStep === 1 && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-6">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const isNailsSoon = cat === 'Nails' && !nailsEnabled;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2.5 rounded-full text-xs sm:text-sm uppercase tracking-[0.14em] font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                        isActive
                          ? 'bg-[#222120] text-[#F7F4EF] border-[#222120] shadow-sm'
                          : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-[#222120]'
                      }`}
                    >
                      <span>{cat}</span>
                      {isNailsSoon && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3DCE0] text-[#222120] tracking-normal capitalize">
                          Mid-Dec
                        </span>
                      )}
                      {cat === 'Nails' && nailsEnabled && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059] text-white tracking-normal capitalize">
                          New
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!nailsEnabled && (activeCategory === 'Nails' || activeCategory === 'All') && (
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#F7F4EF] via-[#F3DCE0]/45 to-[#F7F4EF] border border-[#D49BA7]/50 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#DDD6CC] flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                      <Sparkles className="w-5 h-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#9E5B69] font-semibold">
                        Studio Expansion Coming Mid-December
                      </span>
                      <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                        Luxury Nail Menu Launching Soon
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5C564E] mt-1">
                        Acrylic Full Sets ($55), Gel Manicures ($40), and Soft Gel Extensions ($50) will open for booking in mid-December.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(activeCategory === 'All' || activeCategory === 'Lashes') && (
                <div className="mb-8 bg-white rounded-2xl border border-[#DDD6CC] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#222120]">
                        Not sure which Lash Set to choose?
                      </h4>
                      <p className="text-xs text-[#5C564E] mt-0.5">
                        Tap <span className="font-medium text-[#222120]">"View Style & Details"</span> on any card to compare fullness, spike texture, curl, and ideal eye match. Every full lash session includes a dedicated 3-hour studio block.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6E685F] shrink-0">
                    <span>Natural</span>
                    <FullnessMeter level={3} />
                    <span>Ultra Glam</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);
                  const isLockedNails = service.category === 'Nails' && !nailsEnabled;
                  return (
                    <div
                      key={service.id}
                      className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                        isSelected
                          ? 'border-[#222120] ring-2 ring-[#C5A059]/60 shadow-md'
                          : 'border-[#DDD6CC] hover:border-[#B8AEA0] shadow-xs'
                      } ${isLockedNails ? 'opacity-85' : ''}`}
                    >
                      <div
                        onClick={() => setInspectService(service)}
                        className="cursor-pointer relative"
                      >
                        <ServiceLookIllustration
                          type={service.illustrationType}
                          customPhotoUrl={service.photoUrl}
                          name={service.name}
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#DDD6CC] text-[10px] uppercase tracking-[0.16em] font-medium text-[#222120]">
                          {service.category}
                        </span>
                        {isLockedNails && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#F3DCE0] border border-[#D49BA7] text-[10px] uppercase tracking-wider font-semibold text-[#222120]">
                            Mid-December
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                              {service.name}
                            </h3>
                            <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                              ${service.price}
                            </span>
                          </div>

                          <div className="mt-2 mb-3">
                            <FullnessMeter
                              level={service.fullnessLevel}
                              label={service.fullnessLabel}
                            />
                          </div>

                          <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
                            {service.shortDesc}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#EDEAE4] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectService(service)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C564E] hover:text-[#222120] py-2 px-2.5 rounded-lg hover:bg-[#F7F4EF] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>View Style & Details</span>
                          </button>

                          {isLockedNails ? (
                            <span className="px-3.5 py-2 rounded-full bg-[#F7F4EF] text-[#7D766D] text-xs font-medium border border-[#DDD6CC]">
                              Coming Soon
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleServiceSelection(service)}
                              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#222120] text-[#F7F4EF]'
                                  : 'bg-[#F7F4EF] text-[#222120] border border-[#DDD6CC] hover:bg-[#222120] hover:text-white'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Select</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE FRIDAY OR SATURDAY DATE & TIME SLOT */}
          {bookingStep === 2 && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#222120]">
                  Choose Your Friday or Saturday Session
                </h2>
                <p className="text-sm text-[#5C564E] mt-1">
                  Appointments are reserved in dedicated 3-hour studio blocks (synced live with Valentina's calendar).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6">{renderStudioCalendar()}</div>

                <div className="lg:col-span-6 space-y-6">
                  <div className="bg-white rounded-2xl border border-[#DDD6CC] p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#EDEAE4] pb-4 mb-5">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
                          Selected Date
                        </span>
                        <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                          {selectedDateKey
                            ? formatEditorialDate(selectedDateKey)
                            : 'Select a Friday or Saturday'}
                        </h3>
                      </div>
                      <Clock className="w-5 h-5 text-[#6E685F]" />
                    </div>

                    {isLoadingCalendar ? (
                      <div className="py-10 flex flex-col items-center justify-center gap-2 text-sm text-[#6E685F]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" />
                        <span>Checking live availability...</span>
                      </div>
                    ) : selectedDateKey ? (
                      <div className="space-y-3">
                        {STUDIO_TIME_SLOTS.map((slot) => {
                          const slotInfo = getSlotStatus(selectedDateKey, slot.id);
                          const isAvailable = slotInfo.status === 'available';
                          const isChosen = selectedTimeSlot === slot.id;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => setSelectedTimeSlot(slot.id)}
                              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                                !isAvailable
                                  ? 'bg-[#F7F4EF]/70 border-[#DDD6CC]/70 text-[#9E978E] cursor-not-allowed'
                                  : isChosen
                                  ? 'bg-[#222120] text-[#F7F4EF] border-[#222120] shadow-md ring-2 ring-[#C5A059]/60'
                                  : 'bg-[#F7F4EF] text-[#222120] border-[#DDD6CC] hover:border-[#222120] hover:bg-white cursor-pointer'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2.5">
                                  <span className="font-serif-editorial text-xl font-semibold">
                                    {slot.label}
                                  </span>
                                  <span
                                    className={`text-xs ${
                                      isChosen ? 'text-[#C5A059]' : 'text-[#6E685F]'
                                    }`}
                                  >
                                    • {slot.sublabel}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs mt-0.5 ${
                                    isChosen ? 'text-[#DDD6CC]' : 'text-[#6E685F]'
                                  }`}
                                >
                                  {isAvailable
                                    ? '3-hr private appointment block'
                                    : slotInfo.status === 'booked'
                                    ? 'Reserved by another client'
                                    : 'Unavailable / Studio blocked'}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  !isAvailable
                                    ? 'bg-[#EDEAE4] text-[#8F887F]'
                                    : isChosen
                                    ? 'bg-[#C5A059] text-[#222120] font-semibold'
                                    : 'bg-white text-[#222120] border border-[#DDD6CC]'
                                }`}
                              >
                                {!isAvailable ? 'Unavailable' : isChosen ? 'Selected' : 'Open'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6E685F] py-6 text-center">
                        Please select an open Friday or Saturday on the calendar.
                      </p>
                    )}
                  </div>

                  {quickAddOns.length > 0 && (
                    <div className="bg-[#F7F4EF] rounded-2xl border border-[#DDD6CC] p-5">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#6E685F] font-semibold">
                        Complete Your Look (Same Session Add-Ons)
                      </span>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {quickAddOns.map((addon) => (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleServiceSelection(addon)}
                            className="p-3 rounded-xl bg-white border border-[#DDD6CC] hover:border-[#222120] text-left flex items-center justify-between transition-colors"
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#222120]">{addon.name}</p>
                              <p className="text-[11px] text-[#6E685F]">{addon.category}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#222120] bg-[#F3DCE0]/60 px-2.5 py-1 rounded-full">
                              <Plus className="w-3 h-3" />${addon.price}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="px-5 py-3 rounded-full bg-white border border-[#DDD6CC] text-sm font-medium text-[#222120] hover:bg-[#F7F4EF] inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Services</span>
                    </button>
                    <button
                      type="button"
                      disabled={!selectedDateKey || !selectedTimeSlot}
                      onClick={() => setBookingStep(3)}
                      className={`px-7 py-3 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                        selectedDateKey && selectedTimeSlot
                          ? 'bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] shadow-md'
                          : 'bg-[#CFC8BE] text-white cursor-not-allowed'
                      }`}
                    >
                      <span>Continue to Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ENTER CLIENT DETAILS */}
          {bookingStep === 3 && (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#222120]">
                  Your Appointment Details
                </h2>
                <p className="text-sm text-[#5C564E] mt-1">
                  Almost done! Fill in your contact details to lock in your studio time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5 bg-[#F7F4EF] rounded-2xl border border-[#DDD6CC] p-5 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
                      Appointment Summary
                    </span>
                    <h3 className="font-serif-editorial text-xl font-semibold text-[#222120] mt-1">
                      {formatEditorialDate(selectedDateKey)}
                    </h3>
                    <p className="text-sm font-medium text-[#5C564E] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-4 h-4 text-[#C5A059]" />
                      <span>{selectedTimeSlot}</span>
                    </p>
                  </div>

                  <div className="border-t border-[#DDD6CC] pt-3 space-y-2">
                    {selectedServices.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-[#222120]">
                          {s.name}{' '}
                          <span className="text-xs text-[#6E685F]">({s.category})</span>
                        </span>
                        <span className="font-medium">${s.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#DDD6CC] pt-3 flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#6E685F]">
                      Estimated Total
                    </span>
                    <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                      ${totalPrice}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#DDD6CC] text-xs text-[#5C564E] leading-relaxed">
                    <strong className="text-[#222120]">Pay at Studio:</strong> No online payment is charged today. Payment is collected at the studio after your service.
                  </div>
                </div>

                <form
                  onSubmit={handleConfirmBooking}
                  className="md:col-span-7 bg-white rounded-2xl border border-[#DDD6CC] p-6 space-y-4 shadow-xs"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[#222120] mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8F887F] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        disabled={isSubmittingBooking}
                        value={clientForm.clientName}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, clientName: e.target.value })
                        }
                        placeholder="e.g. Isabella Gomez"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm focus:outline-none focus:border-[#222120]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[#222120] mb-1.5">
                      WhatsApp / Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#8F887F] absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        disabled={isSubmittingBooking}
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        placeholder="e.g. +1 (206) 555-0123"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm focus:outline-none focus:border-[#222120]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[#222120] mb-1.5">
                      Instagram Handle (Recommended)
                    </label>
                    <div className="relative">
                      <Instagram className="w-4 h-4 text-[#8F887F] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        disabled={isSubmittingBooking}
                        value={clientForm.instagram}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, instagram: e.target.value })
                        }
                        placeholder="@yourhandle"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm focus:outline-none focus:border-[#222120]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[#222120] mb-1.5">
                      Notes, Style Goals, or Allergies (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-[#8F887F] absolute left-3.5 top-3.5" />
                      <textarea
                        rows={3}
                        disabled={isSubmittingBooking}
                        value={clientForm.notes}
                        onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                        placeholder="Tell Valentina if you have sensitive eyes, prefer a cat-eye shape, or need a refill..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm focus:outline-none focus:border-[#222120]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={isSubmittingBooking}
                      onClick={() => setBookingStep(2)}
                      className="px-4 py-3 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-sm font-medium text-[#222120] hover:bg-[#EDEAE4]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="flex-1 py-3 px-6 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] disabled:opacity-60 text-sm font-medium shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                          <span>Reserving Slot...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                          <span>Confirm Appointment (Pay at Studio)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* STEP 4: LUXURY CONFIRMATION CARD & INSTAGRAM DM REDIRECT */}
          {bookingStep === 4 && confirmedBooking && (
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl border border-[#DDD6CC] shadow-lg overflow-hidden">
                <div className="bg-[#222120] text-[#F7F4EF] px-6 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A059]">
                    Slot Reserved • {confirmedBooking.refCode}
                  </span>
                  <h2 className="font-serif-editorial text-3xl sm:text-4xl font-normal mt-1">
                    See You at TINA STUDIO
                  </h2>
                  <p className="text-xs text-[#DDD6CC] mt-1">
                    Reserved for {confirmedBooking.clientName}
                  </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F4EF] border border-[#DDD6CC]">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E685F]">
                        Date
                      </span>
                      <p className="font-serif-editorial text-lg font-semibold text-[#222120]">
                        {formatEditorialDate(confirmedBooking.date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E685F]">
                        Session Block
                      </span>
                      <p className="font-serif-editorial text-lg font-semibold text-[#222120]">
                        {confirmedBooking.time}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E685F]">
                      Selected Services
                    </span>
                    <div className="mt-2 divide-y divide-[#EDEAE4] border-y border-[#EDEAE4]">
                      {confirmedBooking.services.map((srv) => (
                        <div
                          key={srv.id}
                          className="py-2.5 flex items-center justify-between text-sm"
                        >
                          <span className="font-medium text-[#222120]">{srv.name}</span>
                          <span className="text-[#5C564E]">${srv.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-[#6E685F]">
                        Estimated Total (Pay at Studio)
                      </span>
                      <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                        ${confirmedBooking.total}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F3DCE0]/40 border border-[#D49BA7]/40 space-y-1.5">
                    <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#222120] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Studio Prep Instructions</span>
                    </h4>
                    <ul className="text-xs text-[#4A453F] space-y-1 list-disc list-inside">
                      <li>Please arrive with completely clean, makeup-free lashes & eye area.</li>
                      <li>Avoid oil-based cleansers or waterproof mascara 24 hours prior.</li>
                      <li>Allow 2.5 to 3 hours for relaxing, unhurried artistry.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-1">
                    <a
                      href="https://ig.me/m/tinastudioo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-5 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Instagram className="w-4 h-4 text-[#C5A059]" />
                      <span>Confirm via Instagram DM (@tinastudioo)</span>
                    </a>
                    <p className="text-[11px] text-center text-[#6E685F] leading-relaxed px-4 pb-2">
                      Almost there! <strong>Send Valentina a DM on Instagram</strong> with your selected services and time to officially confirm your spot.
                    </p>

                    <button
                      type="button"
                      onClick={() => downloadBookingICS(confirmedBooking)}
                      className="w-full py-3.5 px-5 rounded-full bg-[#F7F4EF] text-[#222120] border border-[#222120] hover:bg-[#EDEAE4] text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Calendar Reminder (.ics)</span>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={resetClientFlow}
                      className="text-xs text-[#6E685F] hover:text-[#222120] underline"
                    >
                      Book another appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STICKY MULTI-SERVICE CART BAR (STEP 1) */}
          {bookingStep === 1 && selectedServices.length > 0 && (
            <div className="fixed bottom-0 inset-x-0 z-30 bg-[#F7F4EF]/95 backdrop-blur-md border-t border-[#DDD6CC] shadow-lg">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#222120] text-[#F7F4EF] text-xs font-semibold">
                        {selectedServices.length}
                      </span>
                      <span className="text-sm font-semibold text-[#222120]">
                        {selectedServices.map((s) => s.name).join(' + ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E685F] mt-0.5">
                      Est. {estimatedDurationLabel} • Pay at studio
                    </p>
                  </div>
                  <div className="sm:hidden font-serif-editorial text-2xl font-semibold text-[#222120]">
                    ${totalPrice}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#6E685F] block">
                      Estimated Total
                    </span>
                    <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                      ${totalPrice}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-sm font-medium inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>Choose Fri / Sat Time</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* OWNER ADMIN DASHBOARD: VALENTINA'S AGENDA */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white rounded-3xl border border-[#DDD6CC] p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-semibold">
                Owner Dashboard • TINA STUDIO
              </span>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#222120] mt-1">
                Valentina's Agenda
              </h1>
              <p className="text-sm text-[#5C564E] mt-1">
                Manage your Friday & Saturday appointments, block personal hours, or update your menu.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[#F7F4EF] px-4 py-3 rounded-2xl border border-[#DDD6CC]">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#6E685F] block">
                  Web Bookings
                </span>
                <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                  {sortedBookings.length}
                </span>
              </div>
              <div className="h-8 w-px bg-[#DDD6CC]" />
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#6E685F] block">
                  Nails Menu
                </span>
                <span
                  className={`text-xs font-semibold ${
                    nailsEnabled ? 'text-[#222120]' : 'text-[#9E5B69]'
                  }`}
                >
                  {nailsEnabled ? 'Live Now' : 'Mid-Dec'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'appointments', label: 'My Upcoming Appointments', icon: CalendarIcon },
              { id: 'hours', label: 'Block / Manage Hours', icon: Lock },
              { id: 'services', label: 'Services & Photos', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-5 py-3 rounded-full text-sm font-medium flex items-center gap-2 transition-all border ${
                    isActive
                      ? 'bg-[#222120] text-[#F7F4EF] border-[#222120] shadow-sm'
                      : 'bg-white text-[#222120] border-[#DDD6CC] hover:bg-[#F7F4EF]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-[#6E685F]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ADMIN TAB 1 */}
          {adminTab === 'appointments' && (
            <div className="space-y-4">
              {sortedBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#DDD6CC] p-12 text-center">
                  <CalendarIcon className="w-10 h-10 text-[#B5AEA4] mx-auto mb-3" />
                  <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                    Synced with Google Calendar
                  </h3>
                  <p className="text-sm text-[#6E685F] mt-1">
                    All confirmed & pending appointments appear directly in your Google Calendar app with mobile reminders.
                  </p>
                </div>
              ) : (
                sortedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-[#DDD6CC] p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#222120] text-[#F7F4EF] text-xs font-medium">
                          {formatEditorialDate(booking.date)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#F3DCE0] text-[#222120] text-xs font-semibold">
                          {booking.time}
                        </span>
                        <span className="text-xs text-[#6E685F] font-mono">
                          #{booking.refCode}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                          {booking.clientName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C564E] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                            {booking.phone}
                          </span>
                          {booking.instagram && (
                            <span className="flex items-center gap-1">
                              <Instagram className="w-3.5 h-3.5 text-[#D49BA7]" />
                              {booking.instagram}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {booking.services.map((srv, idx) => (
                          <span
                            key={`${booking.id}-${idx}`}
                            className="px-3 py-1 rounded-lg bg-[#F7F4EF] border border-[#DDD6CC] text-xs font-medium text-[#222120]"
                          >
                            {srv.name} (${srv.price})
                          </span>
                        ))}
                        <span className="text-sm font-semibold text-[#222120] ml-1">
                          Total: ${booking.total}
                        </span>
                      </div>

                      {booking.notes && (
                        <p className="text-xs text-[#5C564E] bg-[#F7F4EF] px-3 py-2 rounded-lg border border-[#EDEAE4]">
                          <strong className="text-[#222120]">Note:</strong> {booking.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                      <a
                        href={buildAdminToClientWhatsAppUrl(booking)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        <span>Message on WhatsApp</span>
                      </a>

                      {confirmCancelId === booking.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setBookings((prev) => prev.filter((b) => b.id !== booking.id));
                              setConfirmCancelId(null);
                              showToast('Removed locally. Delete in Google Calendar to reopen slot.');
                            }}
                            className="flex-1 px-3 py-2 rounded-full bg-[#B84A58] text-white text-xs font-medium"
                          >
                            Confirm Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(null)}
                            className="px-3 py-2 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-xs"
                          >
                            Keep
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(booking.id)}
                          className="px-4 py-2.5 rounded-full bg-[#F7F4EF] text-[#6E685F] hover:text-[#B84A58] hover:border-[#B84A58]/40 border border-[#DDD6CC] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove from List</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ADMIN TAB 2 */}
          {adminTab === 'hours' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#DDD6CC] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                    Manage Friday & Saturday Time Blocks
                  </h3>
                  <p className="text-xs text-[#5C564E] mt-0.5">
                    Tip: Any event you add directly in your Google Calendar app also blocks that slot automatically.
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <label className="block text-[10px] uppercase tracking-wider text-[#6E685F] mb-1">
                    Block Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={blockReasonInput}
                    onChange={(e) => setBlockReasonInput(e.target.value)}
                    placeholder="e.g. Nail Course / Off"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcomingStudioDates.map((dateKey) => (
                  <div
                    key={dateKey}
                    className="bg-white rounded-2xl border border-[#DDD6CC] p-5 shadow-xs"
                  >
                    <h4 className="font-serif-editorial text-xl font-semibold text-[#222120] pb-3 mb-3 border-b border-[#EDEAE4]">
                      {formatEditorialDate(dateKey)}
                    </h4>
                    <div className="space-y-2.5">
                      {STUDIO_TIME_SLOTS.map((slot) => {
                        const info = getSlotStatus(dateKey, slot.id);
                        return (
                          <div
                            key={slot.id}
                            className="p-3 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="text-sm font-semibold text-[#222120]">
                                {slot.label}
                              </span>
                              <p className="text-[11px] text-[#6E685F]">
                                {info.status === 'booked'
                                  ? info.booking
                                    ? `Booked: ${info.booking.clientName}`
                                    : 'Booked in Google Calendar'
                                  : info.status === 'blocked'
                                  ? `Blocked (${info.block.reason || 'Unavailable'})`
                                  : 'Open for clients'}
                              </p>
                            </div>

                            {info.status === 'booked' ? (
                              <span className="px-3 py-1 rounded-full bg-[#F3DCE0] text-[#222120] text-xs font-medium">
                                Reserved
                              </span>
                            ) : info.status === 'blocked' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setBlockedSlots((prev) =>
                                    prev.filter(
                                      (b) => !(b.date === dateKey && b.time === slot.id)
                                    )
                                  );
                                  showToast(`Unblocked ${slot.label}`);
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-[#222120] text-white text-xs font-medium inline-flex items-center gap-1.5"
                              >
                                <Unlock className="w-3 h-3 text-[#C5A059]" />
                                <span>Unblock</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setBlockedSlots((prev) => [
                                    ...prev,
                                    {
                                      date: dateKey,
                                      time: slot.id,
                                      reason: blockReasonInput || 'Unavailable',
                                    },
                                  ]);
                                  showToast(`Blocked ${slot.label}`);
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-white border border-[#DDD6CC] hover:border-[#222120] text-xs font-medium inline-flex items-center gap-1.5"
                              >
                                <Lock className="w-3 h-3 text-[#6E685F]" />
                                <span>Block Slot</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN TAB 3 */}
          {adminTab === 'services' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-white via-[#F3DCE0]/35 to-white rounded-2xl border border-[#D49BA7]/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#9E5B69] font-semibold">
                    December Launch Control
                  </span>
                  <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120] mt-0.5">
                    Launch Nails Menu (December)
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C564E] mt-1">
                    {nailsEnabled
                      ? 'Nails (Acrylic Full Set, Gel Manicure, Soft Gel Extensions) are LIVE and bookable on your website.'
                      : 'Currently showing a "Coming Mid-December" preview banner. Flip this switch when you are ready to take Nail clients!'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={nailsEnabled}
                  onClick={() => {
                    const next = !nailsEnabled;
                    setNailsEnabled(next);
                    showToast(
                      next
                        ? 'Nails menu is now LIVE for client bookings!'
                        : 'Nails menu switched back to Coming Mid-December.'
                    );
                  }}
                  className={`relative inline-flex h-11 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out items-center px-1 ${
                    nailsEnabled ? 'bg-[#222120]' : 'bg-[#CFC8BE]'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out flex items-center justify-center ${
                      nailsEnabled ? 'translate-x-9' : 'translate-x-0'
                    }`}
                  >
                    <Sparkles
                      className={`w-4 h-4 ${
                        nailsEnabled ? 'text-[#C5A059]' : 'text-[#9E978E]'
                      }`}
                    />
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAdminCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border ${
                      adminCategoryFilter === cat
                        ? 'bg-[#222120] text-white border-[#222120]'
                        : 'bg-white text-[#222120] border-[#DDD6CC]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {services
                  .filter(
                    (s) => adminCategoryFilter === 'All' || s.category === adminCategoryFilter
                  )
                  .map((srv) => (
                    <div
                      key={srv.id}
                      className="bg-white rounded-2xl border border-[#DDD6CC] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#DDD6CC] bg-[#F7F4EF] shrink-0">
                          {srv.photoUrl ? (
                            <img
                              src={srv.photoUrl}
                              alt={srv.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8F887F]">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#6E685F]">
                            {srv.category}
                          </span>
                          <h4 className="font-serif-editorial text-xl font-semibold text-[#222120]">
                            {srv.name}
                          </h4>
                          <p className="text-xs text-[#6E685F] line-clamp-1">{srv.shortDesc}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:w-1/2">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase tracking-wider text-[#6E685F] mb-1">
                            Look Photo URL (Optional)
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="url"
                              value={srv.photoUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setServices((prev) =>
                                  prev.map((item) =>
                                    item.id === srv.id ? { ...item, photoUrl: val } : item
                                  )
                                );
                              }}
                              placeholder="Paste Instagram/photo image URL..."
                              className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs focus:outline-none focus:border-[#222120]"
                            />
                            {srv.photoUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setServices((prev) =>
                                    prev.map((item) =>
                                      item.id === srv.id ? { ...item, photoUrl: '' } : item
                                    )
                                  )
                                }
                                className="p-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-[#6E685F] hover:text-[#222120]"
                                title="Clear photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="w-full sm:w-28">
                          <label className="block text-[10px] uppercase tracking-wider text-[#6E685F] mb-1">
                            Price ($)
                          </label>
                          <div className="relative">
                            <DollarSign className="w-3.5 h-3.5 text-[#6E685F] absolute left-2.5 top-2.5" />
                            <input
                              type="number"
                              min="0"
                              value={srv.price}
                              onChange={(e) => {
                                const newPrice = Math.max(0, Number(e.target.value));
                                setServices((prev) =>
                                  prev.map((item) =>
                                    item.id === srv.id ? { ...item, price: newPrice } : item
                                  )
                                );
                              }}
                              className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs font-semibold focus:outline-none focus:border-[#222120]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* SERVICE VISUAL LOOK & DETAILS MODAL */}
      {inspectService && (
        <div
          className="fixed inset-0 z-50 bg-[#222120]/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectService(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#DDD6CC] max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <ServiceLookIllustration
                type={inspectService.illustrationType}
                customPhotoUrl={inspectService.photoUrl}
                name={inspectService.name}
              />
              <button
                type="button"
                onClick={() => setInspectService(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-[#DDD6CC] flex items-center justify-center text-[#222120] hover:bg-[#222120] hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
                    {inspectService.category}
                  </span>
                  <h3 className="font-serif-editorial text-3xl font-semibold text-[#222120]">
                    {inspectService.name}
                  </h3>
                </div>
                <span className="font-serif-editorial text-3xl font-semibold text-[#222120]">
                  ${inspectService.price}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F4EF] border border-[#DDD6CC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-[#6E685F] font-medium">
                    Fullness & Drama Level
                  </span>
                  <span className="font-semibold text-[#222120]">
                    {inspectService.fullnessLabel}
                  </span>
                </div>
                <FullnessMeter level={inspectService.fullnessLevel} />
              </div>

              <p className="text-sm text-[#4A453F] leading-relaxed">{inspectService.fullDesc}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EDEAE4]">
                  <span className="uppercase tracking-wider text-[#6E685F] block mb-0.5">
                    Technique & Curl
                  </span>
                  <span className="font-medium text-[#222120]">{inspectService.curlStyle}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EDEAE4]">
                  <span className="uppercase tracking-wider text-[#6E685F] block mb-0.5">
                    Session Block
                  </span>
                  <span className="font-medium text-[#222120]">{inspectService.durationText}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F3DCE0]/35 border border-[#D49BA7]/40 text-xs text-[#222120]">
                <strong>Ideal Match:</strong> {inspectService.idealFor}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInspectService(null)}
                  className="px-5 py-3 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-xs font-medium text-[#222120]"
                >
                  Close
                </button>
                {inspectService.category === 'Nails' && !nailsEnabled ? (
                  <span className="flex-1 py-3 px-5 rounded-full bg-[#F3DCE0] text-center text-xs font-semibold text-[#222120]">
                    Launching Mid-December
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedServiceIds.includes(inspectService.id)) {
                        toggleServiceSelection(inspectService);
                      }
                      setInspectService(null);
                    }}
                    className="flex-1 py-3 px-6 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-xs uppercase tracking-[0.14em] font-medium transition-colors"
                  >
                    {selectedServiceIds.includes(inspectService.id)
                      ? 'Already in Your Session'
                      : `Add to Appointment • $${inspectService.price}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Footer */}
      <footer className="bg-[#F7F4EF] border-t border-[#DDD6CC] py-10 px-4 text-center">
        <TinaStudioWordmark compact />
        <div className="mt-5 flex justify-center">
          <a
            href="https://www.instagram.com/tinastudioo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DDD6CC] text-[#222120] hover:border-[#222120] transition-all text-xs font-medium shadow-sm"
          >
            <Instagram className="w-4 h-4 text-[#C5A059]" />
            <span>@tinastudioo</span>
          </a>
        </div>
        <p className="text-xs text-[#6E685F] mt-4">
          By Valentina Arraiz • Fridays & Saturdays (9:00 AM, 12:30 PM, 4:00 PM)
        </p>
        <p className="text-[11px] text-[#8F887F] mt-1">
          No online prepayment • Reserve your session & pay at the studio
        </p>
      </footer>
    </div>
  );
}
