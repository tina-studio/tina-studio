import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Lock,
  Globe,
  ChevronRight,
  ChevronLeft,
  Camera,
  Check,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  X,
  Download,
  Info,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Eye,
} from 'lucide-react';
import tinaLogo from '../tina studio (1).png';

// --- LOGOTIPO OFICIAL DE TINA STUDIO ---
const TinaLogo = ({ size = 'header' }) => (
  <img
    src={tinaLogo}
    alt="TINA STUDIO by Valentina Arraiz"
    className={
      size === 'footer'
        ? 'w-full max-w-[180px] h-auto object-contain mx-auto mix-blend-multiply select-none'
        : 'w-full max-w-[185px] sm:max-w-[235px] h-auto object-contain mx-auto mix-blend-multiply select-none transition-all'
    }
  />
);

// --- ILUSTRACIONES EDITORIALES DE ESTILOS DE PESTAÑAS ---
const LashStyleDiagram = ({ variant = 'classic' }) => {
  const configs = {
    lifting: { count: 13, spread: 18, baseLen: 26, spikeEvery: 0, width: 1.5, curl: 10 },
    classic: { count: 15, spread: 24, baseLen: 30, spikeEvery: 0, width: 1.7, curl: 14 },
    hybrid: { count: 21, spread: 28, baseLen: 32, spikeEvery: 3, width: 1.8, curl: 16 },
    wispy: { count: 23, spread: 30, baseLen: 28, spikeEvery: 4, width: 1.9, curl: 18 },
    wet: { count: 18, spread: 26, baseLen: 33, spikeEvery: 2, width: 2.3, curl: 16 },
    hawaiian: { count: 22, spread: 32, baseLen: 31, spikeEvery: 3, width: 1.8, curl: 19 },
    egypt: { count: 24, spread: 30, baseLen: 34, spikeEvery: 2, width: 2.1, curl: 18 },
    volume: { count: 30, spread: 32, baseLen: 34, spikeEvery: 0, width: 2.0, curl: 18 },
    megavolume: { count: 38, spread: 34, baseLen: 37, spikeEvery: 0, width: 2.4, curl: 20 },
    wispyvolume: { count: 34, spread: 34, baseLen: 33, spikeEvery: 4, width: 2.2, curl: 20 },
    refill: { count: 20, spread: 26, baseLen: 30, spikeEvery: 0, width: 1.8, curl: 15 },
    remove: { count: 11, spread: 16, baseLen: 20, spikeEvery: 0, width: 1.2, curl: 6 },
  };

  const cfg = configs[variant] || configs.classic;
  const fibers = Array.from({ length: cfg.count }, (_, i) => {
    const t = cfg.count === 1 ? 0.5 : i / (cfg.count - 1);
    const startX = 24 + t * 152;
    const startY = 58 - Math.sin(t * Math.PI) * 12;
    const isSpike = cfg.spikeEvery > 0 && i % cfg.spikeEvery === 0;
    const catEyeBoost = t * 8;
    const length = cfg.baseLen + (isSpike ? 10 : 0) + catEyeBoost;
    const angle = -cfg.spread + t * (cfg.spread * 2.15);
    const rad = (angle * Math.PI) / 180;
    const endX = startX + Math.sin(rad) * length;
    const endY = startY - Math.cos(rad) * length;
    const ctrlX = startX + Math.sin(rad) * (length * 0.45) + cfg.curl * 0.25;
    const ctrlY = startY - Math.cos(rad) * (length * 0.65);

    return { startX, startY, endX, endY, ctrlX, ctrlY, isSpike };
  });

  return (
    <svg viewBox="0 0 200 76" className="w-full h-16 overflow-visible">
      <defs>
        <linearGradient id={`lashGrad-${variant}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#222120" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#222120" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {fibers.map((f, idx) => (
        <path
          key={idx}
          d={`M ${f.startX.toFixed(1)} ${f.startY.toFixed(1)} Q ${f.ctrlX.toFixed(1)} ${f.ctrlY.toFixed(1)} ${f.endX.toFixed(1)} ${f.endY.toFixed(1)}`}
          fill="none"
          stroke={`url(#lashGrad-${variant})`}
          strokeWidth={f.isSpike ? cfg.width + 0.7 : cfg.width}
          strokeLinecap="round"
        />
      ))}
      <path
        d="M 20 59 Q 100 43 180 59"
        fill="none"
        stroke="#C5A059"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
};

// --- CATÁLOGO INICIAL ACTUALIZADO (PRECIOS CORREGIDOS Y SIN HENNA BROW TINT) ---
const INITIAL_SERVICES = [
  // LASHES
  {
    id: 'lash-lifting',
    category: 'lashes',
    name: 'Lifting',
    price: 50,
    duration: '1h 30m',
    intensity: 1,
    variant: 'lifting',
    descEN: 'Natural lash curl and lift from the root for an effortless, wide-awake look lasting 6–8 weeks.',
    descES: 'Rizado y elevación natural desde la raíz para una mirada abierta sin extensiones (dura 6–8 semanas).',
    policyEN: 'A 50% non-refundable deposit ($25) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($25) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-classic',
    category: 'lashes',
    name: 'Classic',
    price: 60,
    duration: '2h 30m',
    intensity: 2,
    variant: 'classic',
    descEN: 'One single extension applied to each natural lash (1:1). Clean, timeless mascara-like elegance.',
    descES: 'Una extensión por cada pestaña natural (1:1). Acabado limpio, elegante y natural tipo rímel.',
    policyEN: 'A 50% non-refundable deposit ($30) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($30) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-hybrid',
    category: 'lashes',
    name: 'Hybrid',
    price: 65,
    duration: '2h 30m',
    intensity: 3,
    variant: 'hybrid',
    descEN: '50/50 blend of Classic single lashes and soft Volume fans for balanced texture and fullness.',
    descES: 'Mezcla 50/50 de fibras Clásicas y abanicos de Volumen suave para lograr textura y densidad equilibrada.',
    policyEN: 'A 50% non-refundable deposit ($32.50) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($32.50) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-wispy',
    category: 'lashes',
    name: 'Wispy',
    price: 65,
    duration: '2h 30m',
    intensity: 3,
    variant: 'wispy',
    descEN: 'Feathery, staggered peaks paired with soft base lashes for an airy, textured editorial finish.',
    descES: 'Picos escalonados ligeros combinados con una base suave para un efecto plumoso y texturizado.',
    policyEN: 'A 50% non-refundable deposit ($32.50) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($32.50) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-wet',
    category: 'lashes',
    name: 'Wet Set',
    price: 65,
    duration: '2h 30m',
    intensity: 3,
    variant: 'wet',
    descEN: 'Closed lightweight volume fans creating a glossy, sleek, freshly-coated lash aesthetic.',
    descES: 'Abanicos cerrados ultraligeros que crean un efecto brillante, definido y estilizado.',
    policyEN: 'A 50% non-refundable deposit ($32.50) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($32.50) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-hawaiian',
    category: 'lashes',
    name: 'Hawaiian',
    price: 70,
    duration: '2h 45m',
    intensity: 3,
    variant: 'hawaiian',
    descEN: 'Soft, wispy curl with subtle cat-eye elongation for a breezy, sun-kissed gaze.',
    descES: 'Curvatura suave y abierta con ligero alargamiento externo para una mirada luminosa.',
    policyEN: 'A 50% non-refundable deposit ($35) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($35) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-egypt',
    category: 'lashes',
    name: 'Egypt set',
    price: 70,
    duration: '2h 45m',
    intensity: 4,
    variant: 'egypt',
    descEN: 'Defined eyeliner effect with sculpted peaks and rich dark lash-line density.',
    descES: 'Efecto delineado definido con picos esculpidos y mayor densidad en la línea de las pestañas.',
    policyEN: 'A 50% non-refundable deposit ($35) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($35) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-volume',
    category: 'lashes',
    name: 'Volume',
    price: 80,
    duration: '3h',
    intensity: 4,
    variant: 'volume',
    descEN: 'Handmade plush multi-lash fans applied to each natural lash for fluffy, glamorous fullness.',
    descES: 'Abanicos artesanales esponjosos en cada pestaña natural para un volumen glamoroso y uniforme.',
    policyEN: 'A 50% non-refundable deposit ($40) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($40) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-megavolume',
    category: 'lashes',
    name: 'Mega Volume',
    price: 90,
    duration: '3h',
    intensity: 5,
    variant: 'megavolume',
    descEN: 'Ultra-fine dense fans delivering maximum drama, darkness, and red-carpet intensity.',
    descES: 'Abanicos ultrafinos de alta densidad para máximo drama, profundidad e intensidad.',
    policyEN: 'A 50% non-refundable deposit ($45) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($45) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-wispyvolume',
    category: 'lashes',
    name: 'Wispy Volume',
    price: 85,
    duration: '3h',
    intensity: 5,
    variant: 'wispyvolume',
    descEN: 'Full-bodied Russian volume base elevated with dramatic, fluttery Kim-K style spikes.',
    descES: 'Base completa de volumen ruso realzada con picos largos y llamativos estilo Kim-K.',
    policyEN: 'A 50% non-refundable deposit ($42.50) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($42.50) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-refill',
    category: 'lashes',
    name: 'Refill',
    price: 60,
    duration: '2h',
    intensity: 3,
    variant: 'refill',
    descEN: 'Maintenance infill within 2–3 weeks (requires at least 40% of extensions remaining).',
    descES: 'Mantenimiento y relleno dentro de 2–3 semanas (requiere conservar al menos 40% de extensiones).',
    policyEN: 'A 50% non-refundable deposit ($30) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($30) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'lash-remove',
    category: 'lashes',
    name: 'Remove',
    price: 40,
    duration: '45m',
    intensity: 1,
    variant: 'remove',
    descEN: 'Gentle cream removal that protects and nourishes your natural lashes without damage.',
    descES: 'Retiro suave en crema que cuida y protege tus pestañas naturales sin maltratarlas.',
    policyEN: 'A 50% non-refundable deposit ($20) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($20) vía Instagram DM para reservar tu cupo.',
    image: '',
  },

  // EYEBROW (Brow tint henna eliminado)
  {
    id: 'brow-lamination',
    category: 'eyebrow',
    name: 'Lamination',
    price: 20,
    duration: '45m',
    descEN: 'Brow restructuring treatment that smooths, lifts, and sets hairs into a fuller, brushed-up shape.',
    descES: 'Tratamiento reestructurante que alisa, peina y fija las cejas logrando un aspecto más poblado.',
    policyEN: 'A 50% non-refundable deposit ($10) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($10) vía Instagram DM para reservar tu cupo.',
    image: '',
  },
  {
    id: 'brow-wax-mapping',
    category: 'eyebrow',
    name: 'Wax + mapping',
    price: 35,
    duration: '45m',
    descEN: 'Precision facial geometry brow mapping followed by gentle waxing for symmetrical arches.',
    descES: 'Diseño geométrico personalizado según tu rostro seguido de depilación precisa con cera.',
    policyEN: 'A 50% non-refundable deposit ($17.50) is required via Instagram DM to lock your date.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($17.50) vía Instagram DM para reservar tu cupo.',
    image: '',
  },

  // WAXING
  {
    id: 'wax-arm',
    category: 'waxing',
    name: 'Arm',
    price: 15,
    duration: '30m',
    descEN: 'Smooth full-arm hair removal using gentle, skin-soothing wax.',
    descES: 'Depilación completa de brazos con cera suave que cuida la piel.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
  {
    id: 'wax-underarm',
    category: 'waxing',
    name: 'Underarm',
    price: 15,
    duration: '20m',
    descEN: 'Quick, clean underarm waxing for silky, long-lasting smoothness.',
    descES: 'Depilación rápida y limpia de axilas para una suavidad duradera.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
  {
    id: 'wax-lips',
    category: 'waxing',
    name: 'Lips',
    price: 5,
    duration: '15m',
    descEN: 'Delicate upper-lip hair removal with soothing post-wax care.',
    descES: 'Depilación delicada de bozo con cuidado calmante posterior.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
  {
    id: 'wax-bikini-trad',
    category: 'waxing',
    name: 'Traditional bikini',
    price: 20,
    duration: '30m',
    descEN: 'Clean shaping along the classic bikini line with gentle low-temperature wax.',
    descES: 'Perfilado limpio de la línea clásica del bikini con cera suave de baja temperatura.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
  {
    id: 'wax-bikini-ext',
    category: 'waxing',
    name: 'Extended bikini',
    price: 30,
    duration: '40m',
    descEN: 'Comprehensive bikini waxing tailored for comfort, hygiene, and smooth results.',
    descES: 'Depilación de bikini completo realizada con máxima higiene, confort y suavidad.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
  {
    id: 'wax-half-leg',
    category: 'waxing',
    name: 'Half leg',
    price: 25,
    duration: '30m',
    descEN: 'Lower or upper leg waxing leaving skin soft and hair-free for weeks.',
    descES: 'Depilación de media pierna dejando la piel suave y libre de vello por semanas.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
  {
    id: 'wax-full-leg',
    category: 'waxing',
    name: 'Full leg',
    price: 35,
    duration: '45m',
    descEN: 'Complete leg waxing from ankle to upper thigh with calming hydration.',
    descES: 'Depilación completa de piernas con hidratación calmante final.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },

  // FACIAL
  {
    id: 'facial-extractions',
    category: 'facial',
    name: 'Facial with extractions (40 min)',
    price: 40,
    duration: '40m',
    descEN: 'Deep pore cleansing, gentle steam, manual extractions, and hydrating glow mask.',
    descES: 'Limpieza profunda de poros, vapor suave, extracciones manuales y mascarilla hidratante luminosa.',
    policyEN: 'A 50% non-refundable deposit ($20) is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable ($20) vía Instagram DM para confirmar tu hora.',
    image: '',
  },

  // NAILS (Oculto por defecto hasta que Valentina lo active)
  {
    id: 'nails-acrylic',
    category: 'nails',
    name: 'Acrylic Full Set',
    price: 45,
    duration: '2h 30m',
    descEN: 'Custom sculpted acrylic extensions with gel polish finish.',
    descES: 'Extensiones esculpidas en acrílico con acabado en esmalte semipermanente.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
  {
    id: 'nails-softgel',
    category: 'nails',
    name: 'Soft Gel Extensions',
    price: 40,
    duration: '2h',
    descEN: 'Lightweight, natural-feeling soft gel nail extensions with glossy finish.',
    descES: 'Extensiones ligeras en soft gel con acabado brillante y natural.',
    policyEN: 'A 50% non-refundable deposit is required via Instagram DM to confirm your slot.',
    policyES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para confirmar tu hora.',
    image: '',
  },
];

const TIME_SLOTS = ['9:00 AM', '12:30 PM', '4:00 PM'];

const DEFAULT_GLOBAL_POLICY = {
  EN: 'A 50% non-refundable deposit is required via Instagram DM (@tinastudioo) to secure your appointment.',
  ES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM (@tinastudioo) para asegurar tu cita.',
};

// --- UTILIDAD CALENDARIO MENSUAL ---
function formatDateISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function App() {
  const [lang, setLang] = useState('EN');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  // Carrito y flujo de reserva
  const [cartIds, setCartIds] = useState(['lash-hybrid']);
  const [bookingStep, setBookingStep] = useState(1); // 1: Fecha/Hora, 2: Datos, 3: Confirmación & DM
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientIg, setClientIg] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Estados persistentes (Editables desde Perfil Privado)
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_services_v3');
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });
  const [nailsEnabled, setNailsEnabled] = useState(() => {
    return localStorage.getItem('tina_studio_nails_v3') === 'true';
  });
  const [globalPolicy, setGlobalPolicy] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_policy_v3');
      return saved ? JSON.parse(saved) : DEFAULT_GLOBAL_POLICY;
    } catch {
      return DEFAULT_GLOBAL_POLICY;
    }
  });
  const [blockedSlots, setBlockedSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_blocked_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_bookings_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('tina_studio_pin_v3') || '2026';
  });
  const [scriptUrl, setScriptUrl] = useState(() => {
    return localStorage.getItem('tina_studio_script_v3') || '';
  });
  const [googleBusySlots, setGoogleBusySlots] = useState([]);

  // Estados de Perfil Privado & Modal PIN
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminTab, setAdminTab] = useState('catalog'); // 'catalog' | 'policies' | 'agenda' | 'security'
  const [newPinInput, setNewPinInput] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCat, setNewServiceCat] = useState('lashes');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Auto-guardado local
  useEffect(() => {
    localStorage.setItem('tina_studio_services_v3', JSON.stringify(services));
  }, [services]);
  useEffect(() => {
    localStorage.setItem('tina_studio_nails_v3', String(nailsEnabled));
  }, [nailsEnabled]);
  useEffect(() => {
    localStorage.setItem('tina_studio_policy_v3', JSON.stringify(globalPolicy));
  }, [globalPolicy]);
  useEffect(() => {
    localStorage.setItem('tina_studio_blocked_v3', JSON.stringify(blockedSlots));
  }, [blockedSlots]);
  useEffect(() => {
    localStorage.setItem('tina_studio_bookings_v3', JSON.stringify(bookings));
  }, [bookings]);

  // Leer disponibilidad desde Google Apps Script si está conectado
  useEffect(() => {
    if (!scriptUrl) return;
    fetch(scriptUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.busy)) {
          setGoogleBusySlots(data.busy.map((b) => `${b.date}|${b.slot}`));
        }
      })
      .catch(() => {});
  }, [scriptUrl]);

  const showSavedFeedback = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  // Textos bilingües
  const copy = {
    EN: {
      navServices: 'Services',
      navBook: 'Book Now',
      navPolicy: '50% Policy',
      heroTag: 'BY VALENTINA ARRAIZ · FRIDAYS & SATURDAYS',
      heroTitle: 'Refined Lashes, Sculpted Brows & Beauty Rituals.',
      heroSub:
        'Explore our visual style guide, choose your beauty session, and lock your Friday or Saturday appointment via Instagram DM.',
      heroCta: 'Explore Menu & Book',
      catAll: 'All Services',
      catLashes: 'Lashes',
      catEyebrow: 'Eyebrow',
      catWaxing: 'Waxing',
      catFacial: 'Facial',
      catNails: 'Nails',
      viewDetails: 'View Style & Policy',
      addBtn: 'Select',
      addedBtn: 'Selected',
      intensityLabel: 'Volume / Drama',
      bookingTitle: 'Reserve Your Appointment',
      bookingSubtitle: 'Appointments are exclusively available on Fridays & Saturdays at 9:00 AM, 12:30 PM & 4:00 PM.',
      step1: '1. Select Date & Time',
      step2: '2. Client Details',
      step3: '3. Review & Book via DM',
      selectFridaySat: 'Select an available Friday or Saturday on the calendar:',
      availableSlots: 'Available Time Blocks (2h 30m – 3h session)',
      bookedLabel: 'Booked',
      fullName: 'Full Name *',
      igHandle: 'Instagram Username (e.g. @maria) *',
      notesLabel: 'Notes or Lash Preferences (Optional)',
      continueBtn: 'Continue',
      backBtn: 'Back',
      selectedServices: 'Selected Services',
      estTotal: 'Estimated Total',
      depositRequired: '50% Non-Refundable Deposit Due',
      acceptCheckbox: 'I have read and accept the 50% non-refundable deposit condition.',
      bookDmBtn: 'Book via Instagram DM',
      downloadIcsBtn: 'Save Reminder (.ics)',
      dmHelper:
        'Clicking "Book via Instagram DM" automatically copies your appointment summary so you can paste it straight into @tinastudioo DM.',
      copiedSuccess: 'Appointment details copied! Redirecting to @tinastudioo...',
      privateProfile: 'Private Profile',
      adminHeader: "Valentina's Private Studio",
      exitAdmin: 'Exit Private Profile',
      enterPinTitle: 'Studio Private Access',
      enterPinSub: 'Enter your 4-digit security PIN',
    },
    ES: {
      navServices: 'Servicios',
      navBook: 'Agendar',
      navPolicy: 'Política 50%',
      heroTag: 'BY VALENTINA ARRAIZ · VIERNES Y SÁBADOS',
      heroTitle: 'Pestañas de Autor, Cejas Esculpidas y Rituales de Belleza.',
      heroSub:
        'Explora nuestra guía visual de estilos, elige tus servicios y asegura tu cita de viernes o sábado vía Instagram DM.',
      heroCta: 'Ver Menú y Reservar',
      catAll: 'Todos',
      catLashes: 'Pestañas',
      catEyebrow: 'Cejas',
      catWaxing: 'Depilación',
      catFacial: 'Faciales',
      catNails: 'Uñas',
      viewDetails: 'Ver Estilo y Condiciones',
      addBtn: 'Elegir',
      addedBtn: 'Seleccionado',
      intensityLabel: 'Volumen / Intensidad',
      bookingTitle: 'Agenda tu Cita',
      bookingSubtitle: 'Atendemos exclusivamente viernes y sábados en bloques de 9:00 AM, 12:30 PM y 4:00 PM.',
      step1: '1. Elige Fecha y Hora',
      step2: '2. Tus Datos',
      step3: '3. Resumen y DM',
      selectFridaySat: 'Selecciona un viernes o sábado disponible en el calendario:',
      availableSlots: 'Horarios Disponibles (sesión de 2h 30m – 3h)',
      bookedLabel: 'Ocupado',
      fullName: 'Nombre Completo *',
      igHandle: 'Usuario de Instagram (ej. @maria) *',
      notesLabel: 'Notas o preferencias (Opcional)',
      continueBtn: 'Continuar',
      backBtn: 'Volver',
      selectedServices: 'Servicios Seleccionados',
      estTotal: 'Total Estimado',
      depositRequired: 'Depósito 50% No Reembolsable',
      acceptCheckbox: 'He leído y acepto la condición del depósito del 50% no reembolsable.',
      bookDmBtn: 'Reservar por Instagram DM',
      downloadIcsBtn: 'Guardar Recordatorio (.ics)',
      dmHelper:
        'Al tocar "Reservar por Instagram DM" se copian automáticamente los datos de tu cita para pegarlos directo en el DM de @tinastudioo.',
      copiedSuccess: '¡Datos copiados! Abriendo @tinastudioo...',
      privateProfile: 'Perfil Privado',
      adminHeader: 'Perfil Privado de Valentina',
      exitAdmin: 'Salir del Perfil Privado',
      enterPinTitle: 'Acceso Privado del Estudio',
      enterPinSub: 'Ingresa tu PIN de seguridad de 4 dígitos',
    },
  };

  const t = copy[lang];

  const visibleServices = useMemo(() => {
    return services.filter((s) => (s.category === 'nails' ? nailsEnabled : true));
  }, [services, nailsEnabled]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return visibleServices;
    return visibleServices.filter((s) => s.category === activeCategory);
  }, [visibleServices, activeCategory]);

  const cartItems = useMemo(() => {
    return visibleServices.filter((s) => cartIds.includes(s.id));
  }, [visibleServices, cartIds]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [cartItems]);

  const toggleCartItem = (id) => {
    setCartIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // --- GENERACIÓN DE DÍAS DEL CALENDARIO MENSUAL ---
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Dom ... 6=Sab
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay(); // 5 = Viernes, 6 = Sábado
      const isFriOrSat = dayOfWeek === 5 || dayOfWeek === 6;
      const isPast = dateObj < today;
      const iso = formatDateISO(year, month, d);
      cells.push({
        day: d,
        iso,
        enabled: isFriOrSat && !isPast,
        isFriOrSat,
      });
    }
    return cells;
  }, [viewMonth]);

  const isSlotUnavailable = (dateISO, slot) => {
    const key = `${dateISO}|${slot}`;
    if (blockedSlots.includes(key)) return true;
    if (googleBusySlots.includes(key)) return true;
    return bookings.some((b) => b.date === dateISO && b.time === slot);
  };

  // Descargar recordatorio .ics
  const handleDownloadICS = () => {
    if (!selectedDate || !selectedTime) return;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const hour = selectedTime === '9:00 AM' ? 9 : selectedTime === '12:30 PM' ? 12 : 16;
    const min = selectedTime === '12:30 PM' ? 30 : 0;
    const start = new Date(y, m - 1, d, hour, min);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    const toICSDate = (dt) =>
      dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const serviceNames = cartItems.map((i) => i.name).join(', ');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TINA STUDIO//Booking//EN',
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:TINA STUDIO - ${serviceNames}`,
      `DESCRIPTION:Appointment with Valentina Arraiz (@tinastudioo). Total: $${totalAmount}. 50% Deposit required via DM.`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TinaStudio-${selectedDate}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Acción final: Copiar resumen, registrar en agenda/Google y abrir Instagram DM
  const handleBookViaInstagram = async (e) => {
    if (!policyAccepted || !selectedDate || !selectedTime || !clientName.trim()) {
      e.preventDefault();
      return;
    }

    const serviceSummary = cartItems.map((i) => `${i.name} ($${i.price})`).join(', ');
    const dmMessage = [
      `Hi Tina Studio! ✨ I'd love to confirm my booking:`,
      `• Name: ${clientName}`,
      `• Instagram: ${clientIg || 'N/A'}`,
      `• Services: ${serviceSummary}`,
      `• Date & Time: ${selectedDate} at ${selectedTime}`,
      `• Total: $${totalAmount} (50% Non-Refundable Deposit: $${(totalAmount / 2).toFixed(2)})`,
      clientNotes ? `• Notes: ${clientNotes}` : null,
      `I agree to the 50% non-refundable deposit policy.`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(dmMessage);
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 4000);
    } catch {}

    const newBooking = {
      id: Date.now().toString(),
      clientName,
      clientIg,
      services: serviceSummary,
      date: selectedDate,
      time: selectedTime,
      total: totalAmount,
      notes: clientNotes,
    };
    setBookings((prev) => [newBooking, ...prev]);

    if (scriptUrl) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const hour = selectedTime === '9:00 AM' ? 9 : selectedTime === '12:30 PM' ? 12 : 16;
      const min = selectedTime === '12:30 PM' ? 30 : 0;
      const startISO = new Date(y, m - 1, d, hour, min).toISOString();

      fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          contact: clientIg,
          service: serviceSummary,
          total: totalAmount,
          notes: clientNotes,
          startISO,
        }),
      }).catch(() => {});
    }
  };

  // --- FUNCIONES DEL PERFIL PRIVADO ---
  const handlePinDigit = (digit) => {
    if (pinEntry.length >= 4) return;
    const next = pinEntry + digit;
    setPinEntry(next);
    if (next.length === 4) {
      if (next === adminPin) {
        setTimeout(() => {
          setIsAdmin(true);
          setShowPinModal(false);
          setPinEntry('');
        }, 150);
      } else {
        setPinError(true);
        setTimeout(() => {
          setPinError(false);
          setPinEntry('');
        }, 500);
      }
    }
  };

  const handleUpdatePrice = (id, value) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: Number(value) || 0 } : s))
    );
    showSavedFeedback();
  };

  const handleUpdateServicePolicy = (id, field, value) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    showSavedFeedback();
  };

  const handleUploadServicePhoto = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 640;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);

        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, image: compressed } : s))
        );
        showSavedFeedback();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;
    const item = {
      id: `custom-${Date.now()}`,
      category: newServiceCat,
      name: newServiceName.trim(),
      price: Number(newServicePrice),
      duration: '2h 30m',
      descEN: 'Custom beauty treatment by Valentina Arraiz.',
      descES: 'Servicio personalizado por Valentina Arraiz.',
      policyEN: globalPolicy.EN,
      policyES: globalPolicy.ES,
      image: '',
    };
    setServices((prev) => [...prev, item]);
    setNewServiceName('');
    setNewServicePrice('');
    showSavedFeedback();
  };

  const toggleBlockSlot = (dateISO, slot) => {
    const key = `${dateISO}|${slot}`;
    setBlockedSlots((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    showSavedFeedback();
  };

  // =========================================================================
  // VISTA 1: PERFIL PRIVADO DE VALENTINA (PROTEGIDO CON PIN)
  // =========================================================================
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#222120] font-sans pb-20">
        {/* Barra Superior Privada */}
        <header className="sticky top-0 z-30 bg-[#222120] text-white px-4 sm:px-8 py-4 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-[#C5A059]" />
              <div>
                <h1 className="font-serif text-xl sm:text-2xl tracking-wide">{t.adminHeader}</h1>
                <p className="text-[11px] uppercase tracking-widest text-gray-300">
                  TINA STUDIO • Control Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'EN' ? 'ES' : 'EN')}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-widest border border-white/25 hover:border-[#C5A059]"
              >
                {lang === 'EN' ? 'ES' : 'EN'}
              </button>
              <button
                onClick={() => setIsAdmin(false)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-widest bg-[#C5A059] text-[#222120] hover:bg-[#d6b36c]"
              >
                {t.exitAdmin}
              </button>
            </div>
          </div>
        </header>

        {savedBanner && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#222120] text-white border border-[#C5A059] px-5 py-3 shadow-xl text-xs uppercase tracking-widest flex items-center gap-2">
            <Check size={16} className="text-[#C5A059]" />
            {lang === 'EN' ? 'Saved automatically' : 'Guardado automáticamente'}
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
          {/* Navegación interna del Perfil Privado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'catalog', labelEN: 'Prices & Photos', labelES: 'Precios y Fotos' },
              { id: 'policies', labelEN: '50% Conditions', labelES: 'Condiciones 50%' },
              { id: 'agenda', labelEN: 'Agenda & Blocks', labelES: 'Agenda y Bloqueos' },
              { id: 'security', labelEN: 'Google & PIN', labelES: 'Google y PIN' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`py-3 px-3 text-xs uppercase tracking-widest font-semibold border transition-colors ${
                  adminTab === tab.id
                    ? 'bg-[#222120] text-white border-[#222120]'
                    : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-[#C5A059]'
                }`}
              >
                {lang === 'EN' ? tab.labelEN : tab.labelES}
              </button>
            ))}
          </div>

          {/* TAB 1: PRECIOS Y FOTOGRAFÍAS */}
          {adminTab === 'catalog' && (
            <div className="space-y-6">
              {/* Interruptor categoría Uñas */}
              <div className="bg-white border border-[#DDD6CC] p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl">
                    {lang === 'EN' ? 'Nails Category Visibility' : 'Visibilidad de Categoría Uñas'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lang === 'EN'
                      ? 'Keep hidden while practicing; turn ON when ready to accept nail clients.'
                      : 'Mantenlo oculto mientras practicas; actívalo cuando estés lista para recibir clientas.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNailsEnabled(!nailsEnabled);
                    showSavedFeedback();
                  }}
                  className={`px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors ${
                    nailsEnabled
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#EDEAE4] text-[#222120] border border-[#DDD6CC]'
                  }`}
                >
                  {nailsEnabled
                    ? lang === 'EN'
                      ? 'ON (Visible)'
                      : 'ACTIVO (Visible)'
                    : lang === 'EN'
                    ? 'OFF (Hidden)'
                    : 'OCULTO'}
                </button>
              </div>

              {/* Agregar nuevo servicio */}
              <form
                onSubmit={handleAddNewService}
                className="bg-white border border-[#DDD6CC] p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <select
                  value={newServiceCat}
                  onChange={(e) => setNewServiceCat(e.target.value)}
                  className="p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                >
                  <option value="lashes">Lashes</option>
                  <option value="eyebrow">Eyebrow</option>
                  <option value="waxing">Waxing</option>
                  <option value="facial">Facial</option>
                  <option value="nails">Nails</option>
                </select>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder={lang === 'EN' ? 'New service name...' : 'Nombre del servicio...'}
                  className="p-3 border border-[#DDD6CC] text-sm"
                />
                <input
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="Price ($)"
                  className="p-3 border border-[#DDD6CC] text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold py-3 px-4 flex items-center justify-center gap-1.5 hover:bg-black"
                >
                  <Plus size={15} /> {lang === 'EN' ? 'Add Service' : 'Agregar'}
                </button>
              </form>

              {/* Listado completo para editar precios y subir fotos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white border border-[#DDD6CC] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {srv.image ? (
                        <div className="relative w-16 h-16 shrink-0 border border-[#DDD6CC]">
                          <img
                            src={srv.image}
                            alt={srv.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              setServices((prev) =>
                                prev.map((s) => (s.id === srv.id ? { ...s, image: '' } : s))
                              );
                              showSavedFeedback();
                            }}
                            title="Remove photo"
                            className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 shrink-0 bg-[#F7F4EF] border border-[#DDD6CC] flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold block">
                          {srv.category}
                        </span>
                        <p className="font-medium text-sm truncate">{srv.name}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-xs text-gray-500">$</span>
                          <input
                            type="number"
                            value={srv.price}
                            onChange={(e) => handleUpdatePrice(srv.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-[#DDD6CC] bg-[#F7F4EF] text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="cursor-pointer shrink-0 px-3 py-2.5 bg-[#222120] text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 hover:bg-black">
                      <Camera size={14} />
                      <span>{srv.image ? (lang === 'EN' ? 'Change' : 'Cambiar') : lang === 'EN' ? 'Photo' : 'Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadServicePhoto(srv.id, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CONDICIONES Y DEPÓSITO 50% NO REEMBOLSABLE */}
          {adminTab === 'policies' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-2xl">
                  {lang === 'EN'
                    ? 'Global Booking Condition (50% Non-Refundable Deposit)'
                    : 'Condición General de Reserva (Depósito 50% No Reembolsable)'}
                </h2>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                    English Text
                  </label>
                  <textarea
                    rows={2}
                    value={globalPolicy.EN}
                    onChange={(e) => {
                      setGlobalPolicy({ ...globalPolicy, EN: e.target.value });
                      showSavedFeedback();
                    }}
                    className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Texto en Español
                  </label>
                  <textarea
                    rows={2}
                    value={globalPolicy.ES}
                    onChange={(e) => {
                      setGlobalPolicy({ ...globalPolicy, ES: e.target.value });
                      showSavedFeedback();
                    }}
                    className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setServices((prev) =>
                      prev.map((s) => ({
                        ...s,
                        policyEN: globalPolicy.EN,
                        policyES: globalPolicy.ES,
                      }))
                    );
                    showSavedFeedback();
                  }}
                  className="px-5 py-2.5 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold"
                >
                  {lang === 'EN'
                    ? 'Apply Condition to All Services'
                    : 'Aplicar Condición a Todos los Servicios'}
                </button>
              </div>

              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h3 className="font-serif text-xl">
                  {lang === 'EN' ? 'Condition per Individual Service' : 'Condición por Servicio Individual'}
                </h3>
                {services.map((srv) => (
                  <div key={srv.id} className="p-4 bg-[#F7F4EF] border border-[#DDD6CC] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        {srv.name} (${srv.price})
                      </span>
                      <span className="text-[11px] uppercase tracking-widest text-[#C5A059]">
                        {srv.category}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={lang === 'EN' ? srv.policyEN : srv.policyES}
                      onChange={(e) =>
                        handleUpdateServicePolicy(
                          srv.id,
                          lang === 'EN' ? 'policyEN' : 'policyES',
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 bg-white border border-[#DDD6CC] text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AGENDA Y BLOQUEO DE HORARIOS */}
          {adminTab === 'agenda' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-xl">
                  {lang === 'EN' ? 'Upcoming DM Requests' : 'Solicitudes Recientes'}
                </h2>
                {bookings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    {lang === 'EN'
                      ? 'No appointments logged on this device yet.'
                      : 'Aún no hay reservas registradas en este dispositivo.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="p-3.5 bg-[#F7F4EF] border border-[#DDD6CC] text-xs space-y-1">
                        <div className="flex justify-between font-bold text-sm">
                          <span>{b.clientName}</span>
                          <span className="text-[#C5A059]">${b.total}</span>
                        </div>
                        <p>
                          <strong>{b.date}</strong> · {b.time}
                        </p>
                        <p className="text-gray-600">{b.services}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-gray-500">{b.clientIg}</span>
                          <button
                            onClick={() =>
                              setBookings((prev) => prev.filter((item) => item.id !== b.id))
                            }
                            className="text-red-700 flex items-center gap-1 hover:underline"
                          >
                            <Trash2 size={12} /> {lang === 'EN' ? 'Remove' : 'Eliminar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-xl">
                  {lang === 'EN' ? 'Block / Unblock Friday & Saturday Slots' : 'Bloquear / Liberar Horarios'}
                </h2>
                <p className="text-xs text-gray-500">
                  {lang === 'EN'
                    ? 'Tap any upcoming Friday or Saturday time slot to block it manually.'
                    : 'Toca cualquier bloque de viernes o sábado para ocuparlo manualmente.'}
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {calendarDays
                    .filter((d) => d && d.enabled)
                    .map((d) => (
                      <div key={d.iso} className="p-3 bg-[#F7F4EF] border border-[#DDD6CC]">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2">{d.iso}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_SLOTS.map((slot) => {
                            const blocked = blockedSlots.includes(`${d.iso}|${slot}`);
                            return (
                              <button
                                key={slot}
                                onClick={() => toggleBlockSlot(d.iso, slot)}
                                className={`py-2 text-xs font-semibold border ${
                                  blocked
                                    ? 'bg-red-900 text-white border-red-900'
                                    : 'bg-white text-[#222120] border-[#DDD6CC]'
                                }`}
                              >
                                {slot} {blocked ? '✕' : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE CALENDAR SYNC & CAMBIO DE PIN */}
          {adminTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-xl">Google Calendar Sync (Apps Script)</h2>
                <p className="text-xs text-gray-600">
                  {lang === 'EN'
                    ? 'Paste your Google Apps Script Web App URL (/exec) to sync appointments and phone alarms automatically.'
                    : 'Pega aquí la URL /exec de tu Google Apps Script para sincronizar citas y recordatorios en tu teléfono.'}
                </p>
                <input
                  type="text"
                  value={scriptUrl}
                  onChange={(e) => {
                    setScriptUrl(e.target.value);
                    localStorage.setItem('tina_studio_script_v3', e.target.value);
                    showSavedFeedback();
                  }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-xs font-mono"
                />
              </div>

              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-xl">
                  {lang === 'EN' ? 'Change Security PIN' : 'Cambiar PIN de Seguridad'}
                </h2>
                <p className="text-xs text-gray-600">
                  {lang === 'EN'
                    ? 'Current PIN protects your prices, photos, and conditions from public edits.'
                    : 'Tu PIN protege precios, fotos y condiciones contra cambios no autorizados.'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 digits (e.g. 2026)"
                    className="flex-1 p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-center tracking-[0.5em] font-mono"
                  />
                  <button
                    onClick={() => {
                      if (newPinInput.length === 4) {
                        setAdminPin(newPinInput);
                        localStorage.setItem('tina_studio_pin_v3', newPinInput);
                        setNewPinInput('');
                        showSavedFeedback();
                      }
                    }}
                    className="px-5 py-3 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold"
                  >
                    {lang === 'EN' ? 'Save PIN' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: WEB PÚBLICA EDITORIAL DE TINA STUDIO (RESPONSIVE WEB + MÓVIL)
  // =========================================================================
  const monthLabel = viewMonth.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const weekdays =
    lang === 'EN'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#222120] font-sans pb-24 sm:pb-12">
      {/* HEADER EDITORIAL */}
      <header className="sticky top-0 z-30 bg-[#F7F4EF]/95 backdrop-blur-md border-b border-[#DDD6CC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 grid grid-cols-3 items-center">
          {/* Navegación izquierda */}
          <nav className="flex items-center gap-4 sm:gap-6 text-xs uppercase tracking-widest font-semibold">
            <a href="#services" className="hover:text-[#C5A059] transition-colors">
              {t.navServices}
            </a>
            <a href="#booking" className="hidden sm:inline hover:text-[#C5A059] transition-colors">
              {t.navBook}
            </a>
          </nav>

          {/* Logotipo Central Oficial */}
          <a href="#" className="flex justify-center">
            <TinaLogo size="header" />
          </a>

          {/* Instagram & Selector de Idioma EN | ES */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-4">
            <a
              href="https://www.instagram.com/tinastudioo/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 text-[#222120] hover:text-[#C5A059] transition-colors"
            >
              <Instagram size={18} />
            </a>
            <button
              onClick={() => setLang(lang === 'EN' ? 'ES' : 'EN')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DDD6CC] hover:border-[#C5A059] text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <Globe size={13} className="text-[#C5A059]" />
              <span>{lang === 'EN' ? 'EN | ES' : 'ES | EN'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO EDITORIAL */}
      <section className="border-b border-[#DDD6CC] bg-gradient-to-b from-[#EDEAE4] to-[#F7F4EF] px-4 sm:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <span className="inline-block px-4 py-1.5 bg-white border border-[#DDD6CC] text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-semibold">
            {t.heroTag}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-[#222120]">
            {t.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            {t.heroSub}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#services"
              className="px-7 py-3.5 bg-[#222120] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-black transition-colors"
            >
              {t.heroCta}
            </a>
            <a
              href="https://www.instagram.com/tinastudioo/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-white border border-[#DDD6CC] text-[#222120] text-xs uppercase tracking-[0.2em] font-semibold hover:border-[#222120] transition-colors flex items-center gap-2"
            >
              <Instagram size={15} /> @tinastudioo
            </a>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: CATÁLOGO DE SERVICIOS Y GUÍA VISUAL */}
      <section id="services" className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Filtros de Categoría */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {[
            { id: 'all', label: t.catAll },
            { id: 'lashes', label: t.catLashes },
            { id: 'eyebrow', label: t.catEyebrow },
            { id: 'waxing', label: t.catWaxing },
            { id: 'facial', label: t.catFacial },
            ...(nailsEnabled ? [{ id: 'nails', label: t.catNails }] : []),
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 text-xs uppercase tracking-widest font-semibold whitespace-nowrap border transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#222120] text-white border-[#222120]'
                  : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-[#C5A059]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const isSelected = cartIds.includes(service.id);
            return (
              <div
                key={service.id}
                className={`bg-white border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#C5A059] ring-1 ring-[#C5A059] shadow-md'
                    : 'border-[#DDD6CC] hover:border-gray-400'
                }`}
              >
                <div>
                  {/* Visual: Foto subida por Valentina o Ilustración Editorial de Pestañas */}
                  {service.image ? (
                    <div className="relative h-48 w-full overflow-hidden border-b border-[#DDD6CC] bg-[#EDEAE4]">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 text-[10px] uppercase tracking-widest font-semibold">
                        {service.category}
                      </span>
                    </div>
                  ) : service.variant ? (
                    <div className="p-4 bg-[#F7F4EF]/70 border-b border-[#DDD6CC]">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        <span>{service.category}</span>
                        <span>{service.duration}</span>
                      </div>
                      <LashStyleDiagram variant={service.variant} />
                      {service.intensity && (
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#DDD6CC]/60">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500">
                            {t.intensityLabel}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <span
                                key={lvl}
                                className={`w-3 h-1.5 ${
                                  lvl <= service.intensity ? 'bg-[#C5A059]' : 'bg-[#DDD6CC]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-5 pt-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold">
                      <span>{service.category}</span>
                      <span className="text-gray-400">{service.duration}</span>
                    </div>
                  )}

                  {/* Contenido del Servicio */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif text-2xl text-[#222120]">{service.name}</h3>
                      <span className="font-serif italic text-2xl text-[#C5A059]">
                        ${service.price}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {lang === 'EN' ? service.descEN : service.descES}
                    </p>
                  </div>
                </div>

                {/* Acciones de la tarjeta */}
                <div className="px-5 pb-5 pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedServiceModal(service)}
                    className="flex-1 py-2.5 px-3 border border-[#DDD6CC] text-[11px] uppercase tracking-widest font-semibold text-gray-700 hover:border-[#222120] hover:text-[#222120] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={13} /> {t.viewDetails}
                  </button>
                  <button
                    onClick={() => toggleCartItem(service.id)}
                    className={`flex-1 py-2.5 px-3 text-[11px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-[#C5A059] text-[#222120]'
                        : 'bg-[#222120] text-white hover:bg-black'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} /> {t.addedBtn}
                      </>
                    ) : (
                      t.addBtn
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN 2: AGENDA INTERACTIVA (CALENDARIO VIERNES Y SÁBADOS + DM INSTAGRAM) */}
      <section id="booking" className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-12">
        <div className="bg-white border border-[#DDD6CC] p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-semibold">
              TINA STUDIO SCHEDULE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl">{t.bookingTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-500">{t.bookingSubtitle}</p>
          </div>

          {/* Barra de Progreso de 3 Pasos */}
          <div className="grid grid-cols-3 border-b border-[#DDD6CC] pb-4 mb-8 text-center text-[11px] sm:text-xs uppercase tracking-widest font-semibold">
            <button
              onClick={() => setBookingStep(1)}
              className={bookingStep === 1 ? 'text-[#222120] underline underline-offset-8' : 'text-gray-400'}
            >
              {t.step1}
            </button>
            <button
              onClick={() => selectedDate && selectedTime && setBookingStep(2)}
              className={bookingStep === 2 ? 'text-[#222120] underline underline-offset-8' : 'text-gray-400'}
            >
              {t.step2}
            </button>
            <button
              onClick={() => selectedDate && selectedTime && clientName && setBookingStep(3)}
              className={bookingStep === 3 ? 'text-[#222120] underline underline-offset-8' : 'text-gray-400'}
            >
              {t.step3}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: Pasos interactivos */}
            <div className="lg:col-span-7 space-y-6">
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                    {t.selectFridaySat}
                  </p>

                  {/* Calendario Visual Mensual */}
                  <div className="border border-[#DDD6CC] bg-[#F7F4EF] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() =>
                          setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
                        }
                        className="p-2 bg-white border border-[#DDD6CC] hover:border-[#222120]"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-serif text-xl capitalize">{monthLabel}</span>
                      <button
                        onClick={() =>
                          setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
                        }
                        className="p-2 bg-white border border-[#DDD6CC] hover:border-[#222120]"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-gray-500 mb-2">
                      {weekdays.map((w) => (
                        <div key={w}>{w}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarDays.map((cell, i) => {
                        if (!cell) return <div key={`empty-${i}`} />;
                        const active = selectedDate === cell.iso;
                        return (
                          <button
                            key={cell.iso}
                            disabled={!cell.enabled}
                            onClick={() => {
                              setSelectedDate(cell.iso);
                              setSelectedTime('');
                            }}
                            className={`py-2.5 text-xs sm:text-sm font-semibold border transition-all ${
                              active
                                ? 'bg-[#222120] text-white border-[#222120]'
                                : cell.enabled
                                ? 'bg-white text-[#222120] border-[#C5A059] hover:bg-[#C5A059]/15'
                                : 'bg-transparent text-gray-300 border-transparent cursor-not-allowed'
                            }`}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bloques Horarios Estrictos: 9:00 AM, 12:30 PM, 4:00 PM */}
                  {selectedDate && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold">
                        {t.availableSlots} — <span className="text-[#C5A059]">{selectedDate}</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {TIME_SLOTS.map((slot) => {
                          const unavailable = isSlotUnavailable(selectedDate, slot);
                          const chosen = selectedTime === slot;
                          return (
                            <button
                              key={slot}
                              disabled={unavailable}
                              onClick={() => setSelectedTime(slot)}
                              className={`py-3.5 px-3 border text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                unavailable
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                                  : chosen
                                  ? 'bg-[#222120] text-white border-[#222120]'
                                  : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-[#C5A059]'
                              }`}
                            >
                              <Clock size={14} />
                              {unavailable ? `${slot} (${t.bookedLabel})` : slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      disabled={!selectedDate || !selectedTime || cartItems.length === 0}
                      onClick={() => setBookingStep(2)}
                      className="px-7 py-3.5 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold disabled:opacity-40 flex items-center gap-2"
                    >
                      {t.continueBtn} <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-600 mb-1.5">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Camila Rodriguez"
                      className="w-full p-3.5 border border-[#DDD6CC] bg-[#F7F4EF] focus:bg-white outline-none focus:border-[#C5A059] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-600 mb-1.5">
                      {t.igHandle}
                    </label>
                    <input
                      type="text"
                      value={clientIg}
                      onChange={(e) => setClientIg(e.target.value)}
                      placeholder="@camilarodriguez"
                      className="w-full p-3.5 border border-[#DDD6CC] bg-[#F7F4EF] focus:bg-white outline-none focus:border-[#C5A059] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-600 mb-1.5">
                      {t.notesLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder={
                        lang === 'EN'
                          ? 'Preferred length, curl, or sensitivity notes...'
                          : 'Largo preferido, curvatura o alergias...'
                      }
                      className="w-full p-3.5 border border-[#DDD6CC] bg-[#F7F4EF] focus:bg-white outline-none focus:border-[#C5A059] text-sm"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="px-5 py-3 border border-[#DDD6CC] text-xs uppercase tracking-widest font-semibold"
                    >
                      {t.backBtn}
                    </button>
                    <button
                      disabled={!clientName.trim() || !clientIg.trim()}
                      onClick={() => setBookingStep(3)}
                      className="px-7 py-3.5 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold disabled:opacity-40 flex items-center gap-2"
                    >
                      {t.continueBtn} <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="space-y-5">
                  {/* Política del 50% No Reembolsable */}
                  <div className="p-4 bg-[#F3DCE0]/45 border border-[#F3DCE0] space-y-3">
                    <p className="text-xs sm:text-sm font-medium text-[#222120] leading-relaxed">
                      {globalPolicy[lang]}
                    </p>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={policyAccepted}
                        onChange={(e) => setPolicyAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#222120]"
                      />
                      <span className="text-xs font-semibold underline">{t.acceptCheckbox}</span>
                    </label>
                  </div>

                  {copiedAlert && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium text-center">
                      {t.copiedSuccess}
                    </div>
                  )}

                  {/* CTA Principal: Instagram DM (@tinastudioo) */}
                  <div className="space-y-3">
                    <a
                      href="https://www.instagram.com/tinastudioo/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleBookViaInstagram}
                      className={`w-full py-4 px-6 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-all ${
                        policyAccepted
                          ? 'bg-[#222120] text-white hover:bg-black'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <Instagram size={18} /> {t.bookDmBtn}
                    </a>

                    <button
                      type="button"
                      onClick={handleDownloadICS}
                      className="w-full py-3 px-5 bg-white border border-[#222120] text-[#222120] text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#F7F4EF]"
                    >
                      <Download size={15} /> {t.downloadIcsBtn}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center leading-relaxed">{t.dmHelper}</p>

                  <button
                    onClick={() => setBookingStep(2)}
                    className="text-xs uppercase tracking-widest text-gray-500 underline"
                  >
                    ← {t.backBtn}
                  </button>
                </div>
              )}
            </div>

            {/* Columna Derecha: Resumen Persistente */}
            <div className="lg:col-span-5 bg-[#F7F4EF] border border-[#DDD6CC] p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-serif text-2xl border-b border-[#DDD6CC] pb-3">
                  {t.selectedServices}
                </h3>

                {cartItems.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">
                    {lang === 'EN'
                      ? 'Select one or more services from the menu above.'
                      : 'Selecciona uno o más servicios del menú superior.'}
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {cartItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-sm border-b border-[#DDD6CC]/60 pb-2"
                      >
                        <div>
                          <span className="font-medium block">{item.name}</span>
                          <span className="text-[11px] text-gray-500">{item.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif italic text-base">${item.price}</span>
                          <button
                            onClick={() => toggleCartItem(item.id)}
                            className="text-gray-400 hover:text-red-700"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedDate && (
                  <div className="p-3 bg-white border border-[#DDD6CC] text-xs space-y-1">
                    <p className="uppercase tracking-widest text-[#C5A059] font-semibold">
                      {lang === 'EN' ? 'Selected Slot' : 'Horario Elegido'}
                    </p>
                    <p className="font-semibold">
                      {selectedDate} {selectedTime ? `· ${selectedTime}` : ''}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#DDD6CC] pt-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-widest text-gray-600">{t.estTotal}</span>
                  <span className="font-serif text-3xl">${totalAmount}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs font-semibold text-[#C5A059]">
                  <span>{t.depositRequired}</span>
                  <span>${(totalAmount / 2).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CON ACCESO AL PERFIL PRIVADO */}
      <footer className="border-t border-[#DDD6CC] bg-[#EDEAE4] py-10 px-4 text-center space-y-5">
        <TinaLogo size="footer" />
        <div className="flex items-center justify-center gap-6 text-xs uppercase tracking-widest font-semibold">
          <a
            href="https://www.instagram.com/tinastudioo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#C5A059] transition-colors"
          >
            <Instagram size={15} /> @tinastudioo
          </a>
        </div>
        <div>
          <button
            onClick={() => setShowPinModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#DDD6CC] hover:border-[#222120] text-[11px] uppercase tracking-widest font-semibold text-gray-600 hover:text-[#222120] transition-colors"
          >
            <Lock size={12} /> {t.privateProfile}
          </button>
        </div>
      </footer>

      {/* BARRA INFERIOR FIJA EN MÓVIL */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-[#222120] text-white px-4 py-3 flex items-center justify-between border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gray-300 block">
              {cartItems.length} {lang === 'EN' ? 'service(s)' : 'servicio(s)'}
            </span>
            <span className="font-serif text-xl">${totalAmount}</span>
          </div>
          <a
            href="#booking"
            className="px-5 py-2.5 bg-[#C5A059] text-[#222120] text-xs uppercase tracking-widest font-bold"
          >
            {t.navBook} →
          </a>
        </div>
      )}

      {/* MODAL DETALLES DE SERVICIO Y POLÍTICA */}
      {selectedServiceModal && (
        <div
          onClick={() => setSelectedServiceModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#DDD6CC] max-w-md w-full p-6 sm:p-8 space-y-5 relative"
          >
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>

            <span className="text-[10px] uppercase tracking-[0.22em] text-[#C5A059] font-semibold block">
              {selectedServiceModal.category} · {selectedServiceModal.duration}
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="font-serif text-3xl">{selectedServiceModal.name}</h3>
              <span className="font-serif italic text-3xl text-[#C5A059]">
                ${selectedServiceModal.price}
              </span>
            </div>

            {selectedServiceModal.image ? (
              <img
                src={selectedServiceModal.image}
                alt={selectedServiceModal.name}
                className="w-full h-56 object-cover border border-[#DDD6CC]"
              />
            ) : selectedServiceModal.variant ? (
              <div className="p-4 bg-[#F7F4EF] border border-[#DDD6CC]">
                <LashStyleDiagram variant={selectedServiceModal.variant} />
              </div>
            ) : null}

            <p className="text-sm text-gray-700 leading-relaxed">
              {lang === 'EN' ? selectedServiceModal.descEN : selectedServiceModal.descES}
            </p>

            <div className="p-3.5 bg-[#F3DCE0]/45 border border-[#F3DCE0] text-xs text-[#222120]">
              <strong className="uppercase tracking-wider block mb-1">
                {lang === 'EN' ? 'Booking Policy (50% Deposit)' : 'Condición de Reserva (50%)'}
              </strong>
              {lang === 'EN' ? selectedServiceModal.policyEN : selectedServiceModal.policyES}
            </div>

            <button
              onClick={() => {
                if (!cartIds.includes(selectedServiceModal.id)) {
                  toggleCartItem(selectedServiceModal.id);
                }
                setSelectedServiceModal(null);
              }}
              className="w-full py-3.5 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold hover:bg-black"
            >
              {cartIds.includes(selectedServiceModal.id)
                ? lang === 'EN'
                  ? 'Selected in Your Booking'
                  : 'Ya está en tu Reserva'
                : lang === 'EN'
                ? 'Select This Service'
                : 'Seleccionar este Servicio'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE VALIDACIÓN DE PIN PARA PERFIL PRIVADO */}
      {showPinModal && (
        <div
          onClick={() => {
            setShowPinModal(false);
            setPinEntry('');
          }}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white border border-[#DDD6CC] max-w-xs w-full p-7 text-center space-y-5 transition-transform ${
              pinError ? 'translate-x-2' : ''
            }`}
          >
            <div className="w-11 h-11 mx-auto bg-[#F7F4EF] border border-[#DDD6CC] flex items-center justify-center text-[#C5A059]">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-serif text-2xl">{t.enterPinTitle}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.enterPinSub}</p>
            </div>

            {/* Indicador visual de 4 dígitos */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border ${
                    pinEntry.length > idx
                      ? 'bg-[#222120] border-[#222120]'
                      : 'bg-transparent border-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Teclado numérico */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinDigit(digit)}
                  className="py-3.5 bg-[#F7F4EF] hover:bg-[#DDD6CC] font-semibold text-base transition-colors"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setPinEntry('')}
                className="py-3.5 text-xs uppercase tracking-wider font-bold text-red-700"
              >
                Clear
              </button>
              <button
                onClick={() => handlePinDigit('0')}
                className="py-3.5 bg-[#F7F4EF] hover:bg-[#DDD6CC] font-semibold text-base transition-colors"
              >
                0
              </button>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinEntry('');
                }}
                className="py-3.5 text-xs uppercase tracking-wider text-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
