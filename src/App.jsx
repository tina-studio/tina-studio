import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
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
  X,
  Download,
  Plus,
  Trash2,
  Eye,
  CalendarCheck,
  CalendarX,
  Loader2,
  RefreshCw,
  MessageSquare,
  CreditCard,
  Copy,
  Phone,
  Cloud,
} from 'lucide-react';
import tinaLogo from '../tina studio (1).png';

// ============================================================================
// URL DEL PUENTE EN LA NUBE (GOOGLE APPS SCRIPT /exec)
// ============================================================================
const HARDCODED_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwpIM1imVxZZsuI79KMZPOqAocQP0vxP9cAhxNhDX3kDxzzH4h3lpO8zaE7LLkJH9kNpQ/exec';

const ENV_SCRIPT_URL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_GOOGLE_SCRIPT_URL || ''
    : '';

// --- NÚMERO OFICIAL PARA COMPROBANTES POR MENSAJE (SMS) ---
const DEFAULT_STUDIO_PHONE = '+1 (689) 247-2694';

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

// --- CATÁLOGO BASE (APARTADO DE $20 NO REEMBOLSABLE) ---
const INITIAL_SERVICES = [
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
    image: '',
  },
  {
    id: 'brow-lamination',
    category: 'eyebrow',
    name: 'Lamination',
    price: 20,
    duration: '45m',
    descEN: 'Brow restructuring treatment that smooths, lifts, and sets hairs into a fuller, brushed-up shape.',
    descES: 'Tratamiento reestructurante que alisa, peina y fija las cejas logrando un aspecto más poblado.',
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
    image: '',
  },
  {
    id: 'wax-arm',
    category: 'waxing',
    name: 'Arm',
    price: 15,
    duration: '30m',
    descEN: 'Smooth full-arm hair removal using gentle, skin-soothing wax.',
    descES: 'Depilación completa de brazos con cera suave que cuida la piel.',
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
    image: '',
  },
  {
    id: 'facial-extractions',
    category: 'facial',
    name: 'Facial with extractions (40 min)',
    price: 40,
    duration: '40m',
    descEN: 'Deep pore cleansing, gentle steam, manual extractions, and hydrating glow mask.',
    descES: 'Limpieza profunda de poros, vapor suave, extracciones manuales y mascarilla hidratante luminosa.',
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
    image: '',
  },
  {
    id: 'nails-acrylic',
    category: 'nails',
    name: 'Acrylic Full Set',
    price: 45,
    duration: '2h 30m',
    descEN: 'Custom sculpted acrylic extensions with gel polish finish.',
    descES: 'Extensiones esculpidas en acrílico con acabado en esmalte semipermanente.',
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
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
    policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
    policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
    image: '',
  },
];

const BASE_TIME_SLOTS = ['9:00 AM', '12:30 PM', '4:00 PM'];
const DEPOSIT_AMOUNT = 20;

const DEFAULT_GLOBAL_POLICY = {
  EN: 'A $20 non-refundable deposit is required to lock your appointment. Send your payment receipt via Message to confirm.',
  ES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu cita. Envía tu comprobante por Mensaje para confirmar.',
};

const DEFAULT_PAYMENT_METHODS = [
  { id: 'pm-zelle', label: 'Zelle', value: '+1 (689) 247-2694 (Valentina Arraiz)' },
  { id: 'pm-cashapp', label: 'Apple Pay / CashApp', value: '+1 (689) 247-2694' },
];

// --- UTILIDADES ---
function formatDateISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseSlotTo24Hour(slotStr) {
  const match = slotStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 9, minute: 0 };
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

function format24To12Hour(time24) {
  if (!time24 || !time24.includes(':')) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${period}`;
}

function buildSmsLink(phone, bodyText) {
  const targetPhone = (phone && phone.trim() ? phone : DEFAULT_STUDIO_PHONE).replace(/[^\d+]/g, '');
  const encodedBody = encodeURIComponent(bodyText);
  return targetPhone ? `sms:${targetPhone}?body=${encodedBody}` : `sms:?body=${encodedBody}`;
}

function compressImageToBase64(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      const pureBase64 = dataUrl.split(',')[1];
      callback({ dataUrl, pureBase64 });
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

export default function App() {
  const [lang, setLang] = useState('EN');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  // Carrito inicia vacío por defecto
  const [cartIds, setCartIds] = useState([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContactInfo, setClientContactInfo] = useState('');
  const [clientIg, setClientIg] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [bookingFeedback, setBookingFeedback] = useState(false);
  const [calendarSyncStatus, setCalendarSyncStatus] = useState(''); // '' | 'syncing' | 'ok' | 'error'
  const [calendarErrorMsg, setCalendarErrorMsg] = useState('');

  // Estados sincronizados con Google Drive/Sheets + respaldo local
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_services_v11');
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });
  const [nailsEnabled, setNailsEnabled] = useState(() => {
    try {
      return localStorage.getItem('tina_studio_nails_v11') === 'true';
    } catch {
      return false;
    }
  });
  const [globalPolicy, setGlobalPolicy] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_policy_v11');
      return saved ? JSON.parse(saved) : DEFAULT_GLOBAL_POLICY;
    } catch {
      return DEFAULT_GLOBAL_POLICY;
    }
  });
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_payments_v11');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_METHODS;
    } catch {
      return DEFAULT_PAYMENT_METHODS;
    }
  });
  const [studioPhone, setStudioPhone] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_phone_v11');
      return saved && saved.trim() ? saved : DEFAULT_STUDIO_PHONE;
    } catch {
      return DEFAULT_STUDIO_PHONE;
    }
  });
  const [scheduleOverrides, setScheduleOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_schedule_v11');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('tina_studio_bookings_v11');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem('tina_studio_pin_v11') || '2004';
    } catch {
      return '2004';
    }
  });
  const [customScriptUrl, setCustomScriptUrl] = useState(() => {
    try {
      return localStorage.getItem('tina_studio_script_v11') || '';
    } catch {
      return '';
    }
  });

  // Resolución de URL de la nube (Hardcoded oficial > Vercel Env > Custom)
  const activeScriptUrl = useMemo(() => {
    if (HARDCODED_SCRIPT_URL && HARDCODED_SCRIPT_URL.startsWith('https://script.google.com')) {
      return HARDCODED_SCRIPT_URL.trim();
    }
    if (ENV_SCRIPT_URL && ENV_SCRIPT_URL.startsWith('https://script.google.com')) {
      return ENV_SCRIPT_URL.trim();
    }
    if (customScriptUrl && customScriptUrl.startsWith('https://script.google.com')) {
      return customScriptUrl.trim();
    }
    return '';
  }, [customScriptUrl]);

  const [googleBusySlots, setGoogleBusySlots] = useState([]);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const [uploadingPhotoId, setUploadingPhotoId] = useState(null);

  // Estados del Perfil Privado
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminTab, setAdminTab] = useState('catalog');
  const [newPinInput, setNewPinInput] = useState('');
  const [savedBanner, setSavedBanner] = useState('');

  // Nuevo método de pago en Perfil Privado
  const [newPayLabel, setNewPayLabel] = useState('');
  const [newPayValue, setNewPayValue] = useState('');

  // Formulario nuevo servicio
  const [newSrvCat, setNewSrvCat] = useState('lashes');
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDuration, setNewSrvDuration] = useState('2h 30m');
  const [newSrvDescEN, setNewSrvDescEN] = useState('');
  const [newSrvDescES, setNewSrvDescES] = useState('');
  const [newSrvImage, setNewSrvImage] = useState('');
  const [isUploadingNewSrvImg, setIsUploadingNewSrvImg] = useState(false);

  // Calendario admin
  const [adminViewMonth, setAdminViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [adminSelectedDate, setAdminSelectedDate] = useState(() => {
    const now = new Date();
    return formatDateISO(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [customTime24, setCustomTime24] = useState('18:30');

  // Guardar respaldo en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tina_studio_services_v11', JSON.stringify(services));
      localStorage.setItem('tina_studio_nails_v11', String(nailsEnabled));
      localStorage.setItem('tina_studio_policy_v11', JSON.stringify(globalPolicy));
      localStorage.setItem('tina_studio_payments_v11', JSON.stringify(paymentMethods));
      localStorage.setItem('tina_studio_phone_v11', studioPhone);
      localStorage.setItem('tina_studio_schedule_v11', JSON.stringify(scheduleOverrides));
      localStorage.setItem('tina_studio_bookings_v11', JSON.stringify(bookings));
      localStorage.setItem('tina_studio_pin_v11', adminPin);
    } catch {}
  }, [
    services,
    nailsEnabled,
    globalPolicy,
    paymentMethods,
    studioPhone,
    scheduleOverrides,
    bookings,
    adminPin,
  ]);

  // SINCRONIZACIÓN GLOBAL EN TODOS LOS DISPOSITIVOS
  const fetchCloudData = useCallback(() => {
    if (!activeScriptUrl) return;
    setIsSyncingCloud(true);
    const cacheBusterUrl = `${activeScriptUrl}${activeScriptUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;

    fetch(cacheBusterUrl, {
      method: 'GET',
      redirect: 'follow',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          if (Array.isArray(data.busy)) {
            setGoogleBusySlots(data.busy.map((b) => `${b.date}|${b.slot}`));
          }
          if (data.config && typeof data.config === 'object') {
            if (Array.isArray(data.config.services) && data.config.services.length > 0) {
              setServices(data.config.services);
            }
            if (typeof data.config.nailsEnabled === 'boolean') {
              setNailsEnabled(data.config.nailsEnabled);
            }
            if (data.config.globalPolicy) {
              setGlobalPolicy(data.config.globalPolicy);
            }
            if (Array.isArray(data.config.paymentMethods)) {
              setPaymentMethods(data.config.paymentMethods);
            }
            if (typeof data.config.studioPhone === 'string' && data.config.studioPhone.trim()) {
              setStudioPhone(data.config.studioPhone);
            }
            if (data.config.scheduleOverrides && typeof data.config.scheduleOverrides === 'object') {
              setScheduleOverrides(data.config.scheduleOverrides);
            }
            if (data.config.adminPin && String(data.config.adminPin).length === 4) {
              setAdminPin(String(data.config.adminPin));
            }
          }
          setLastSyncedAt(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
        }
      })
      .catch(() => {})
      .finally(() => setIsSyncingCloud(false));
  }, [activeScriptUrl]);

  useEffect(() => {
    fetchCloudData();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCloudData();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchCloudData]);

  const showSavedFeedback = (msg) => {
    setSavedBanner(msg || (lang === 'EN' ? 'Saved & synced' : 'Guardado y sincronizado'));
    setTimeout(() => setSavedBanner(''), 2600);
  };

  // PUBLICAR CONFIGURACIÓN EN GOOGLE DRIVE PARA TODOS LOS TELÉFONOS
  const pushConfigToCloud = (overrides = {}) => {
    const nextConfig = {
      services: overrides.services ?? services,
      nailsEnabled: overrides.nailsEnabled ?? nailsEnabled,
      globalPolicy: overrides.globalPolicy ?? globalPolicy,
      paymentMethods: overrides.paymentMethods ?? paymentMethods,
      studioPhone: overrides.studioPhone ?? studioPhone,
      scheduleOverrides: overrides.scheduleOverrides ?? scheduleOverrides,
      adminPin: overrides.adminPin ?? adminPin,
      updatedAt: new Date().toISOString(),
    };

    if (!activeScriptUrl) {
      showSavedFeedback(
        lang === 'EN'
          ? 'Saved locally (connect Google Script URL to sync all devices)'
          : 'Guardado local (conecta la URL de Google Script para sincronizar todos los equipos)'
      );
      return;
    }

    setIsSyncingCloud(true);
    fetch(activeScriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveConfig',
        config: nextConfig,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          setLastSyncedAt(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
          showSavedFeedback(
            lang === 'EN'
              ? 'Synced across all devices ✓'
              : 'Sincronizado en todos los dispositivos ✓'
          );
        }
      })
      .catch(() => {
        showSavedFeedback(lang === 'EN' ? 'Saved locally' : 'Guardado localmente');
      })
      .finally(() => setIsSyncingCloud(false));
  };

  // SUBIR FOTO A GOOGLE DRIVE CON ENLACE PÚBLICO GLOBAL
  const uploadPhotoToGoogleDrive = (file, onDone, setLoadingState) => {
    if (!file) return;
    setLoadingState(true);
    compressImageToBase64(file, ({ dataUrl, pureBase64 }) => {
      if (!activeScriptUrl) {
        onDone(dataUrl);
        setLoadingState(false);
        return;
      }

      fetch(activeScriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'uploadPhoto',
          base64: pureBase64,
          mimeType: 'image/jpeg',
          fileName: `tina_${Date.now()}.jpg`,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ok && data.imageUrl) {
            onDone(data.imageUrl);
          } else {
            onDone(dataUrl);
          }
        })
        .catch(() => {
          onDone(dataUrl);
        })
        .finally(() => setLoadingState(false));
    });
  };

  // --- DISPONIBILIDAD DE DÍAS Y CUPOS ---
  const isDateAvailableForClients = (dateISO, dayOfWeek) => {
    const override = scheduleOverrides[dateISO];
    if (override?.status === 'closed') return false;
    if (override?.status === 'open') return true;
    return dayOfWeek === 5 || dayOfWeek === 6;
  };

  const getSlotsForDate = (dateISO) => {
    const override = scheduleOverrides[dateISO];
    const extra = override?.extraSlots || [];
    const combined = [...BASE_TIME_SLOTS];
    extra.forEach((slot) => {
      if (!combined.includes(slot)) combined.push(slot);
    });
    return combined;
  };

  const isSlotUnavailable = (dateISO, slot) => {
    const override = scheduleOverrides[dateISO];
    if (override?.blockedSlots?.includes(slot)) return true;
    if (googleBusySlots.includes(`${dateISO}|${slot}`)) return true;
    return bookings.some((b) => b.date === dateISO && b.time === slot);
  };

  const copyTextValue = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch {}
  };

  const copy = {
    EN: {
      navServices: 'Services',
      navBook: 'Book Now',
      heroTag: 'BY VALENTINA ARRAIZ · STUDIO AGENDA',
      heroTitle: 'Refined Lashes, Sculpted Brows & Beauty Rituals.',
      heroSub:
        'Explore our visual style guide, choose your beauty session, pay your $20 deposit, and send your receipt via Message.',
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
      bookingSubtitle: 'Select any highlighted available date on the calendar to view open time slots.',
      step1: '1. Select Date & Time',
      step2: '2. Client Details',
      step3: '3. Deposit & Message',
      selectFridaySat: 'Available dates are highlighted in gold:',
      availableSlots: 'Available Time Slots',
      bookedLabel: 'Booked',
      fullName: 'Full Name *',
      contactInfoLabel: 'Phone Number or Email *',
      igHandle: 'Instagram Username (e.g. @maria) *',
      notesLabel: 'Notes or Lash Preferences (Optional)',
      continueBtn: 'Continue',
      backBtn: 'Back',
      selectedServices: 'Selected Services',
      estTotal: 'Estimated Total',
      depositRequired: 'Non-Refundable Deposit (Due Now)',
      balanceAtStudio: 'Remaining Balance at Studio',
      paymentTitle: 'Deposit Payment Methods ($20)',
      paymentSub:
        'Copy a payment method below to send your $20 non-refundable deposit, then tap the Message button to send your receipt:',
      acceptCheckbox: 'I accept that the $20 booking deposit is non-refundable.',
      sendMessageBtn: 'Send Receipt via Message',
      bookIgSecondaryBtn: 'Also Confirm via Instagram DM',
      downloadIcsBtn: 'Save Calendar Reminder (.ics)',
      msgHelper: `Opens your Messages app directly to ${studioPhone} pre-filled with your appointment details so you can send your $20 payment receipt.`,
      bookedBanner: `Appointment logged! Opening Messages to ${studioPhone}...`,
      privateProfile: 'Private Profile',
      adminHeader: "Valentina's Private Studio",
      exitAdmin: 'Exit Private Profile',
      enterPinTitle: 'Studio Private Access',
      enterPinSub: 'Enter your 4-digit security PIN',
    },
    ES: {
      navServices: 'Servicios',
      navBook: 'Agendar',
      heroTag: 'BY VALENTINA ARRAIZ · AGENDA DEL ESTUDIO',
      heroTitle: 'Pestañas de Autor, Cejas Esculpidas y Rituales de Belleza.',
      heroSub:
        'Explora nuestra guía visual de estilos, elige tus servicios, realiza tu apartado de $20 y envía el comprobante por Mensaje.',
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
      bookingSubtitle: 'Selecciona cualquier fecha resaltada en el calendario para ver los cupos disponibles.',
      step1: '1. Elige Fecha y Hora',
      step2: '2. Tus Datos',
      step3: '3. Pago y Comprobante',
      selectFridaySat: 'Las fechas disponibles están resaltadas en dorado:',
      availableSlots: 'Cupos y Horarios Disponibles',
      bookedLabel: 'Ocupado',
      fullName: 'Nombre Completo *',
      contactInfoLabel: 'Número de Teléfono o Email *',
      igHandle: 'Usuario de Instagram (ej. @maria) *',
      notesLabel: 'Notas o preferencias (Opcional)',
      continueBtn: 'Continuar',
      backBtn: 'Volver',
      selectedServices: 'Servicios Seleccionados',
      estTotal: 'Total Estimado',
      depositRequired: 'Apartado No Reembolsable (Ahora)',
      balanceAtStudio: 'Restante a Pagar en el Estudio',
      paymentTitle: 'Métodos de Pago del Apartado ($20)',
      paymentSub:
        'Copia un método de pago para transferir tus $20 no reembolsables y luego presiona el botón de Mensaje para enviar tu comprobante:',
      acceptCheckbox: 'Acepto que el apartado de $20 para reservar no es reembolsable.',
      sendMessageBtn: 'Enviar Comprobante por Mensaje',
      bookIgSecondaryBtn: 'También Confirmar por Instagram DM',
      downloadIcsBtn: 'Guardar Recordatorio (.ics)',
      msgHelper: `Abre tu app de Mensajes directo hacia el ${studioPhone} con tus datos ya escritos indicando que agendaste y que adjuntarás tu comprobante de $20.`,
      bookedBanner: `¡Cita registrada! Abriendo Mensajes hacia ${studioPhone}...`,
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

  const remainingBalance = useMemo(() => {
    return Math.max(0, totalAmount - DEPOSIT_AMOUNT);
  }, [totalAmount]);

  const toggleCartItem = (id) => {
    setCartIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();
      const isPast = dateObj < today;
      const iso = formatDateISO(year, month, d);
      const open = isDateAvailableForClients(iso, dayOfWeek);
      cells.push({
        day: d,
        iso,
        enabled: open && !isPast,
      });
    }
    return cells;
  }, [viewMonth, scheduleOverrides]);

  const adminCalendarDays = useMemo(() => {
    const year = adminViewMonth.getFullYear();
    const month = adminViewMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();
      const iso = formatDateISO(year, month, d);
      const isOpen = isDateAvailableForClients(iso, dayOfWeek);
      cells.push({
        day: d,
        iso,
        dayOfWeek,
        isOpen,
      });
    }
    return cells;
  }, [adminViewMonth, scheduleOverrides]);

  const handleDownloadICS = () => {
    if (!selectedDate || !selectedTime) return;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const { hour, minute } = parseSlotTo24Hour(selectedTime);
    const start = new Date(y, m - 1, d, hour, minute);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    const toICSDate = (dt) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const serviceNames = cartItems.map((i) => i.name).join(', ');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TINA STUDIO//Booking//EN',
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:TINA STUDIO - ${serviceNames}`,
      `DESCRIPTION:Appointment with Valentina Arraiz (@tinastudioo). Total: $${totalAmount}. $20 Non-Refundable Deposit.`,
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

  const bookingReceiptMessage = useMemo(() => {
    const serviceSummary = cartItems.map((i) => `${i.name} ($${i.price})`).join(', ');
    if (lang === 'ES') {
      return [
        `¡Hola Tina Studio! ✨ Ya agendé mi cita en la web y te envío por aquí mi comprobante de pago del apartado de $20 no reembolsable:`,
        `• Nombre: ${clientName}`,
        `• Teléfono / Email: ${clientContactInfo}`,
        `• Instagram: ${clientIg || 'N/A'}`,
        `• Servicios: ${serviceSummary}`,
        `• Fecha y Hora: ${selectedDate} a las ${selectedTime}`,
        `• Total: $${totalAmount} (Apartado: $20 | Restante en estudio: $${remainingBalance})`,
        clientNotes ? `• Notas: ${clientNotes}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    }
    return [
      `Hi Tina Studio! ✨ I just booked my appointment on the website and I am sending my $20 non-refundable deposit payment receipt right now:`,
      `• Name: ${clientName}`,
      `• Phone / Email: ${clientContactInfo}`,
      `• Instagram: ${clientIg || 'N/A'}`,
      `• Services: ${serviceSummary}`,
      `• Date & Time: ${selectedDate} at ${selectedTime}`,
      `• Total: $${totalAmount} ($20 Deposit | Remaining at studio: $${remainingBalance})`,
      clientNotes ? `• Notes: ${clientNotes}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }, [
    lang,
    cartItems,
    clientName,
    clientContactInfo,
    clientIg,
    selectedDate,
    selectedTime,
    totalAmount,
    remainingBalance,
    clientNotes,
  ]);

  const smsHref = useMemo(() => {
    return buildSmsLink(studioPhone, bookingReceiptMessage);
  }, [studioPhone, bookingReceiptMessage]);

  // REGISTRO BLINDADO EN GOOGLE CALENDAR ANTES DE ABRIR MENSAJES / INSTAGRAM
  const registerBookingRecord = async () => {
    const serviceSummary = cartItems.map((i) => `${i.name} ($${i.price})`).join(', ');
    const combinedContact = `${clientIg} | ${clientContactInfo}`;

    try {
      await navigator.clipboard.writeText(bookingReceiptMessage);
    } catch {}

    setBookingFeedback(true);
    setCalendarErrorMsg('');
    setTimeout(() => setBookingFeedback(false), 7500);

    const alreadyLogged = bookings.some(
      (b) => b.date === selectedDate && b.time === selectedTime && b.clientName === clientName
    );
    if (!alreadyLogged) {
      const newBooking = {
        id: Date.now().toString(),
        clientName,
        clientContactInfo,
        clientIg,
        services: serviceSummary,
        date: selectedDate,
        time: selectedTime,
        total: totalAmount,
        notes: clientNotes,
      };
      setBookings((prev) => [newBooking, ...prev]);
    }

    if (!activeScriptUrl) {
      setCalendarSyncStatus('error');
      setCalendarErrorMsg('Falta la URL /exec de Google Script.');
      return;
    }

    setCalendarSyncStatus('syncing');
    const [y, m, d] = selectedDate.split('-').map(Number);
    const { hour, minute } = parseSlotTo24Hour(selectedTime);
    const startISO = new Date(y, m - 1, d, hour, minute).toISOString();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(activeScriptUrl, {
        method: 'POST',
        redirect: 'follow',
        keepalive: true,
        signal: controller.signal,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'createBooking',
          clientName,
          contact: combinedContact,
          phoneOrEmail: clientContactInfo,
          service: serviceSummary,
          date: selectedDate,
          time: selectedTime,
          total: totalAmount,
          notes: clientNotes,
          startISO,
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (data && data.ok) {
        setCalendarSyncStatus('ok');
        setGoogleBusySlots((prev) => [...prev, `${selectedDate}|${selectedTime}`]);
      } else {
        setCalendarSyncStatus('error');
        setCalendarErrorMsg(data?.error || 'Error en Google Apps Script');
      }
    } catch {
      setCalendarSyncStatus('error');
      setCalendarErrorMsg(
        lang === 'EN'
          ? 'Could not confirm with Google Calendar. Verify permissions or New Version deployment.'
          : 'No se pudo confirmar con Google Calendar. Revisa permisos o Nueva versión en Apps Script.'
      );
    }
  };

  const handleConfirmAction = async (e, targetUrl, openInNewTab = false) => {
    e.preventDefault();
    if (
      !policyAccepted ||
      !selectedDate ||
      !selectedTime ||
      !clientName.trim() ||
      !clientContactInfo.trim()
    ) {
      return;
    }

    await registerBookingRecord();

    if (openInNewTab) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
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
        }, 550);
      }
    }
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    if (!newSrvName.trim() || !newSrvPrice) return;
    const priceNum = Number(newSrvPrice) || 0;

    const created = {
      id: `srv-${Date.now()}`,
      category: newSrvCat,
      name: newSrvName.trim(),
      price: priceNum,
      duration: newSrvDuration.trim() || '2h 30m',
      descEN: newSrvDescEN.trim() || 'Specialized beauty service by Valentina Arraiz.',
      descES: newSrvDescES.trim() || 'Servicio especializado realizado por Valentina Arraiz.',
      policyEN: 'A $20 non-refundable deposit is required to lock your appointment date.',
      policyES: 'Se requiere un apartado de $20 no reembolsable para asegurar tu fecha.',
      image: newSrvImage,
    };

    const nextServices = [created, ...services];
    setServices(nextServices);
    setNewSrvName('');
    setNewSrvPrice('');
    setNewSrvDuration('2h 30m');
    setNewSrvDescEN('');
    setNewSrvDescES('');
    setNewSrvImage('');
    pushConfigToCloud({ services: nextServices });
  };

  const handleDeleteService = (id) => {
    const nextServices = services.filter((s) => s.id !== id);
    setServices(nextServices);
    setCartIds((prev) => prev.filter((cid) => cid !== id));
    pushConfigToCloud({ services: nextServices });
  };

  const handleUpdatePrice = (id, value) => {
    const nextServices = services.map((s) =>
      s.id === id ? { ...s, price: Number(value) || 0 } : s
    );
    setServices(nextServices);
  };

  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    if (!newPayLabel.trim() || !newPayValue.trim()) return;
    const nextPayments = [
      ...paymentMethods,
      { id: `pm-${Date.now()}`, label: newPayLabel.trim(), value: newPayValue.trim() },
    ];
    setPaymentMethods(nextPayments);
    setNewPayLabel('');
    setNewPayValue('');
    pushConfigToCloud({ paymentMethods: nextPayments });
  };

  const handleDeletePaymentMethod = (id) => {
    const nextPayments = paymentMethods.filter((pm) => pm.id !== id);
    setPaymentMethods(nextPayments);
    pushConfigToCloud({ paymentMethods: nextPayments });
  };

  const setDayStatus = (dateISO, status) => {
    const current = scheduleOverrides[dateISO] || { extraSlots: [], blockedSlots: [] };
    const nextOverrides = {
      ...scheduleOverrides,
      [dateISO]: { ...current, status },
    };
    setScheduleOverrides(nextOverrides);
    pushConfigToCloud({ scheduleOverrides: nextOverrides });
  };

  const toggleSlotBlockOnAdminDate = (dateISO, slot) => {
    const current = scheduleOverrides[dateISO] || { extraSlots: [], blockedSlots: [] };
    const blocked = current.blockedSlots || [];
    const nextBlocked = blocked.includes(slot)
      ? blocked.filter((s) => s !== slot)
      : [...blocked, slot];
    const nextOverrides = {
      ...scheduleOverrides,
      [dateISO]: { ...current, blockedSlots: nextBlocked },
    };
    setScheduleOverrides(nextOverrides);
    pushConfigToCloud({ scheduleOverrides: nextOverrides });
  };

  const addCustomSlotToDate = (dateISO, slotLabel) => {
    if (!slotLabel) return;
    const current = scheduleOverrides[dateISO] || { extraSlots: [], blockedSlots: [] };
    const existingExtra = current.extraSlots || [];
    if (BASE_TIME_SLOTS.includes(slotLabel) || existingExtra.includes(slotLabel)) return;

    const [y, m, d] = dateISO.split('-').map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    const nextStatus =
      current.status === 'closed'
        ? 'open'
        : dow !== 5 && dow !== 6
        ? 'open'
        : current.status;

    const nextOverrides = {
      ...scheduleOverrides,
      [dateISO]: {
        ...current,
        status: nextStatus,
        extraSlots: [...existingExtra, slotLabel],
      },
    };
    setScheduleOverrides(nextOverrides);
    pushConfigToCloud({ scheduleOverrides: nextOverrides });
  };

  const removeCustomSlotFromDate = (dateISO, slotLabel) => {
    const current = scheduleOverrides[dateISO] || { extraSlots: [], blockedSlots: [] };
    const nextOverrides = {
      ...scheduleOverrides,
      [dateISO]: {
        ...current,
        extraSlots: (current.extraSlots || []).filter((s) => s !== slotLabel),
        blockedSlots: (current.blockedSlots || []).filter((s) => s !== slotLabel),
      },
    };
    setScheduleOverrides(nextOverrides);
    pushConfigToCloud({ scheduleOverrides: nextOverrides });
  };

  // =========================================================================
  // VISTA 1: PERFIL PRIVADO DE VALENTINA
  // =========================================================================
  if (isAdmin) {
    const [ay, am, ad] = adminSelectedDate.split('-').map(Number);
    const adminDateObj = new Date(ay, am - 1, ad);
    const adminDow = adminDateObj.getDay();
    const adminDateIsOpen = isDateAvailableForClients(adminSelectedDate, adminDow);
    const adminDateSlots = getSlotsForDate(adminSelectedDate);
    const adminDateOverride = scheduleOverrides[adminSelectedDate] || {};
    const adminMonthLabel = adminViewMonth.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#222120] font-sans pb-20">
        <header className="sticky top-0 z-30 bg-[#222120] text-white px-4 sm:px-8 py-4 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-[#C5A059]" />
              <div>
                <h1 className="font-serif text-xl sm:text-2xl tracking-wide">{t.adminHeader}</h1>
                <p className="text-[11px] uppercase tracking-widest text-gray-300 flex items-center gap-1.5">
                  <Cloud
                    size={12}
                    className={activeScriptUrl ? 'text-emerald-400' : 'text-amber-400'}
                  />
                  {activeScriptUrl
                    ? lang === 'EN'
                      ? `Global Sync Active ${lastSyncedAt ? `(${lastSyncedAt})` : ''}`
                      : `Sincronización Global Activa ${lastSyncedAt ? `(${lastSyncedAt})` : ''}`
                    : lang === 'EN'
                    ? 'Local Mode (Add Google Script URL in Tab 4)'
                    : 'Modo Local (Conecta URL Google Script en Pestaña 4)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeScriptUrl && (
                <button
                  onClick={() => pushConfigToCloud()}
                  disabled={isSyncingCloud}
                  className="px-3.5 py-2 text-xs font-semibold uppercase tracking-widest bg-emerald-800 text-white hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  {isSyncingCloud ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  {lang === 'EN' ? 'Sync All Devices' : 'Sincronizar Todo'}
                </button>
              )}
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
            {savedBanner}
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'catalog', labelEN: 'Services & Photos', labelES: 'Servicios y Fotos' },
              { id: 'agenda', labelEN: 'Days & Slots', labelES: 'Días y Cupos' },
              { id: 'policies', labelEN: 'Payments & $20', labelES: 'Pagos y $20' },
              { id: 'security', labelEN: 'Cloud & PIN', labelES: 'Nube y PIN' },
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

          {/* TAB 1: AGREGAR SERVICIOS, EDITAR PRECIOS Y SUBIR FOTOS */}
          {adminTab === 'catalog' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateService}
                className="bg-white border border-[#DDD6CC] p-5 sm:p-6 space-y-4"
              >
                <div className="border-b border-[#DDD6CC] pb-3">
                  <h2 className="font-serif text-2xl">
                    {lang === 'EN' ? 'Add New Service' : 'Agregar Nuevo Servicio'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'EN'
                      ? 'Create a new treatment with price, duration, description, and photo.'
                      : 'Crea un servicio nuevo con precio, duración, descripción y fotografía.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                      {lang === 'EN' ? 'Category' : 'Categoría'}
                    </label>
                    <select
                      value={newSrvCat}
                      onChange={(e) => setNewSrvCat(e.target.value)}
                      className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                    >
                      <option value="lashes">Lashes</option>
                      <option value="eyebrow">Eyebrow</option>
                      <option value="waxing">Waxing</option>
                      <option value="facial">Facial</option>
                      <option value="nails">Nails</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                      {lang === 'EN' ? 'Service Name *' : 'Nombre del Servicio *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newSrvName}
                      onChange={(e) => setNewSrvName(e.target.value)}
                      placeholder="e.g. Fox Eye Set / Soft Gel"
                      className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                        {lang === 'EN' ? 'Price ($) *' : 'Precio ($) *'}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newSrvPrice}
                        onChange={(e) => setNewSrvPrice(e.target.value)}
                        placeholder="75"
                        className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                        {lang === 'EN' ? 'Duration' : 'Duración'}
                      </label>
                      <input
                        type="text"
                        value={newSrvDuration}
                        onChange={(e) => setNewSrvDuration(e.target.value)}
                        placeholder="2h 30m"
                        className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                      {lang === 'EN' ? 'Description (English)' : 'Descripción (Inglés)'}
                    </label>
                    <input
                      type="text"
                      value={newSrvDescEN}
                      onChange={(e) => setNewSrvDescEN(e.target.value)}
                      placeholder="Short description for English clients..."
                      className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                      {lang === 'EN' ? 'Description (Spanish)' : 'Descripción (Español)'}
                    </label>
                    <input
                      type="text"
                      value={newSrvDescES}
                      onChange={(e) => setNewSrvDescES(e.target.value)}
                      placeholder="Descripción corta en español..."
                      className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2.5 bg-[#F7F4EF] border border-[#DDD6CC] hover:border-[#222120] text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
                      {isUploadingNewSrvImg ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Camera size={15} />
                      )}
                      <span>
                        {isUploadingNewSrvImg
                          ? lang === 'EN'
                            ? 'Uploading...'
                            : 'Subiendo...'
                          : newSrvImage
                          ? lang === 'EN'
                            ? 'Photo Ready ✓'
                            : 'Foto Lista ✓'
                          : lang === 'EN'
                          ? 'Attach Photo (Optional)'
                          : 'Adjuntar Foto (Opcional)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          uploadPhotoToGoogleDrive(
                            e.target.files?.[0],
                            (url) => setNewSrvImage(url),
                            setIsUploadingNewSrvImg
                          )
                        }
                      />
                    </label>
                    {newSrvImage && (
                      <img
                        src={newSrvImage}
                        alt="Preview"
                        className="w-11 h-11 object-cover border border-[#DDD6CC]"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingNewSrvImg}
                    className="px-6 py-3 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-black disabled:opacity-50"
                  >
                    <Plus size={15} /> {lang === 'EN' ? 'Publish Service' : 'Publicar Servicio'}
                  </button>
                </div>
              </form>

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
                    const nextVal = !nailsEnabled;
                    setNailsEnabled(nextVal);
                    pushConfigToCloud({ nailsEnabled: nextVal });
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
                              const nextServices = services.map((s) =>
                                s.id === srv.id ? { ...s, image: '' } : s
                              );
                              setServices(nextServices);
                              pushConfigToCloud({ services: nextServices });
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
                          {srv.category} · {srv.duration}
                        </span>
                        <p className="font-medium text-sm truncate">{srv.name}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-xs text-gray-500">$</span>
                          <input
                            type="number"
                            value={srv.price}
                            onChange={(e) => handleUpdatePrice(srv.id, e.target.value)}
                            onBlur={() => pushConfigToCloud()}
                            className="w-20 px-2 py-1 border border-[#DDD6CC] bg-[#F7F4EF] text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="cursor-pointer px-3 py-2.5 bg-[#222120] text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 hover:bg-black">
                        {uploadingPhotoId === srv.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Camera size={14} />
                        )}
                        <span>
                          {uploadingPhotoId === srv.id
                            ? '...'
                            : srv.image
                            ? lang === 'EN'
                              ? 'Change'
                              : 'Cambiar'
                            : lang === 'EN'
                            ? 'Photo'
                            : 'Foto'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            uploadPhotoToGoogleDrive(
                              e.target.files?.[0],
                              (url) => {
                                const nextServices = services.map((s) =>
                                  s.id === srv.id ? { ...s, image: url } : s
                                );
                                setServices(nextServices);
                                pushConfigToCloud({ services: nextServices });
                              },
                              (loading) => setUploadingPhotoId(loading ? srv.id : null)
                            )
                          }
                        />
                      </label>
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        title={lang === 'EN' ? 'Delete service' : 'Eliminar servicio'}
                        className="p-2.5 border border-[#DDD6CC] text-gray-500 hover:text-red-700 hover:border-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ABRIR DÍAS, AGREGAR CUPOS Y MARCAR DÍAS NO DISPONIBLES */}
          {adminTab === 'agenda' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white border border-[#DDD6CC] p-5 space-y-4">
                  <div>
                    <h2 className="font-serif text-2xl">
                      {lang === 'EN' ? 'Manage Days & Availability' : 'Control de Días Disponibles'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {lang === 'EN'
                        ? 'Tap any date to open an extra day, mark a day unavailable, or customize time slots.'
                        : 'Toca cualquier fecha para abrir un día extra, marcarlo como no disponible o agregar cupos.'}
                    </p>
                  </div>

                  <div className="border border-[#DDD6CC] bg-[#F7F4EF] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() =>
                          setAdminViewMonth(
                            new Date(adminViewMonth.getFullYear(), adminViewMonth.getMonth() - 1, 1)
                          )
                        }
                        className="p-2 bg-white border border-[#DDD6CC] hover:border-[#222120]"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-serif text-xl capitalize">{adminMonthLabel}</span>
                      <button
                        onClick={() =>
                          setAdminViewMonth(
                            new Date(adminViewMonth.getFullYear(), adminViewMonth.getMonth() + 1, 1)
                          )
                        }
                        className="p-2 bg-white border border-[#DDD6CC] hover:border-[#222120]"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-gray-500 mb-2">
                      {(lang === 'EN'
                        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
                      ).map((w) => (
                        <div key={w}>{w}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {adminCalendarDays.map((cell, idx) => {
                        if (!cell) return <div key={`adm-empty-${idx}`} />;
                        const selected = adminSelectedDate === cell.iso;
                        return (
                          <button
                            key={cell.iso}
                            onClick={() => setAdminSelectedDate(cell.iso)}
                            className={`py-2.5 text-xs font-semibold border relative transition-all ${
                              selected
                                ? 'bg-[#222120] text-white border-[#222120] ring-2 ring-[#C5A059]'
                                : cell.isOpen
                                ? 'bg-white text-[#222120] border-[#C5A059]'
                                : 'bg-[#EDEAE4]/60 text-gray-400 border-transparent hover:border-gray-400'
                            }`}
                          >
                            {cell.day}
                            {cell.isOpen && !selected && (
                              <span className="block w-1.5 h-1.5 rounded-full bg-[#C5A059] mx-auto mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white border border-[#DDD6CC] p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDD6CC] pb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold block">
                        {lang === 'EN' ? 'Selected Date' : 'Fecha Seleccionada'}
                      </span>
                      <h3 className="font-serif text-2xl">{adminSelectedDate}</h3>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs uppercase tracking-widest font-semibold ${
                        adminDateIsOpen
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-red-50 text-red-900 border border-red-200'
                      }`}
                    >
                      {adminDateIsOpen
                        ? lang === 'EN'
                          ? 'Available'
                          : 'Disponible'
                        : lang === 'EN'
                        ? 'Unavailable'
                        : 'No Disponible'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setDayStatus(adminSelectedDate, 'open')}
                      className={`py-3 px-3 text-xs uppercase tracking-wider font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                        adminDateIsOpen
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-emerald-800'
                      }`}
                    >
                      <CalendarCheck size={15} />
                      {lang === 'EN' ? 'Open This Day' : 'Habilitar Día'}
                    </button>

                    <button
                      onClick={() => setDayStatus(adminSelectedDate, 'closed')}
                      className={`py-3 px-3 text-xs uppercase tracking-wider font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                        !adminDateIsOpen
                          ? 'bg-red-900 text-white border-red-900'
                          : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-red-900'
                      }`}
                    >
                      <CalendarX size={15} />
                      {lang === 'EN' ? 'Mark Unavailable' : 'Marcar No Disponible'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold">
                      {lang === 'EN'
                        ? 'Time Slots for This Date (Tap to Block/Unblock)'
                        : 'Cupos de Esta Fecha (Toca para Ocupar/Liberar)'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {adminDateSlots.map((slot) => {
                        const isBlocked = adminDateOverride.blockedSlots?.includes(slot);
                        const isExtra = adminDateOverride.extraSlots?.includes(slot);
                        return (
                          <div
                            key={slot}
                            className={`flex items-center justify-between border px-3 py-2.5 text-xs font-semibold ${
                              isBlocked
                                ? 'bg-red-900 text-white border-red-900'
                                : 'bg-[#F7F4EF] text-[#222120] border-[#DDD6CC]'
                            }`}
                          >
                            <button
                              onClick={() => toggleSlotBlockOnAdminDate(adminSelectedDate, slot)}
                              className="flex-1 text-left"
                            >
                              {slot} {isBlocked ? '✕' : '✓'}
                            </button>
                            {isExtra && (
                              <button
                                onClick={() => removeCustomSlotFromDate(adminSelectedDate, slot)}
                                title="Remove custom slot"
                                className="ml-1.5 opacity-75 hover:opacity-100"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DDD6CC] space-y-2.5">
                    <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold">
                      {lang === 'EN'
                        ? 'Add Extra Time Slot to This Date'
                        : 'Abrir Cupo / Hora Extra en Esta Fecha'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={customTime24}
                        onChange={(e) => setCustomTime24(e.target.value)}
                        className="flex-1 p-2.5 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const formatted = format24To12Hour(customTime24);
                          if (formatted) addCustomSlotToDate(adminSelectedDate, formatted);
                        }}
                        className="px-4 py-2.5 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 hover:bg-black"
                      >
                        <Plus size={14} /> {lang === 'EN' ? 'Add Slot' : 'Abrir Cupo'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['10:30 AM', '2:00 PM', '6:30 PM', '7:00 PM'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => addCustomSlotToDate(adminSelectedDate, preset)}
                          className="px-2.5 py-1 bg-white border border-[#DDD6CC] hover:border-[#C5A059] text-[11px] font-medium"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Solicitudes registradas en este dispositivo */}
              <div className="bg-white border border-[#DDD6CC] p-5 space-y-3">
                <h3 className="font-serif text-xl">
                  {lang === 'EN'
                    ? 'Logged Booking Requests (This Device)'
                    : 'Reservas Registradas (Este Dispositivo)'}
                </h3>
                {bookings.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">
                    {lang === 'EN'
                      ? 'No local bookings stored on this device.'
                      : 'No hay reservas locales guardadas en este dispositivo.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-[#F7F4EF] border border-[#DDD6CC] text-xs space-y-1"
                      >
                        <div className="flex justify-between font-bold text-sm">
                          <span>{b.clientName}</span>
                          <span className="text-[#C5A059]">${b.total}</span>
                        </div>
                        <p>
                          <strong>{b.date}</strong> · {b.time}
                        </p>
                        <p className="text-gray-600">{b.services}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-gray-500">
                            {b.clientContactInfo || ''} {b.clientIg ? `· ${b.clientIg}` : ''}
                          </span>
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
            </div>
          )}

          {/* TAB 3: MÉTODOS DE PAGO, TELÉFONO DE MENSAJES Y POLÍTICA DE $20 */}
          {adminTab === 'policies' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                  <h2 className="font-serif text-xl flex items-center gap-2">
                    <CreditCard size={18} className="text-[#C5A059]" />
                    {lang === 'EN'
                      ? 'Embedded Payment Methods ($20 Deposit)'
                      : 'Métodos de Pago Incrustados ($20)'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'EN'
                      ? 'Clients will see these payment accounts at checkout to pay the $20 non-refundable deposit.'
                      : 'Las clientas verán estas cuentas al finalizar la reserva para transferir los $20 de apartado.'}
                  </p>

                  <div className="space-y-2.5">
                    {paymentMethods.map((pm) => (
                      <div
                        key={pm.id}
                        className="p-3 bg-[#F7F4EF] border border-[#DDD6CC] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">
                            {pm.label}
                          </span>
                          <span className="text-sm font-medium break-all">{pm.value}</span>
                        </div>
                        <button
                          onClick={() => handleDeletePaymentMethod(pm.id)}
                          className="p-1.5 text-gray-400 hover:text-red-700 shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleAddPaymentMethod}
                    className="space-y-2 pt-2 border-t border-[#DDD6CC]"
                  >
                    <input
                      type="text"
                      value={newPayLabel}
                      onChange={(e) => setNewPayLabel(e.target.value)}
                      placeholder={
                        lang === 'EN'
                          ? 'Method name (e.g. Zelle, CashApp, PayPal)'
                          : 'Nombre (ej. Zelle, CashApp, Pago Móvil)'
                      }
                      className="w-full p-2.5 border border-[#DDD6CC] bg-[#F7F4EF] text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPayValue}
                        onChange={(e) => setNewPayValue(e.target.value)}
                        placeholder={
                          lang === 'EN'
                            ? 'Account / Email / Phone / $Tag'
                            : 'Cuenta / Correo / Teléfono / $Usuario'
                        }
                        className="flex-1 p-2.5 border border-[#DDD6CC] bg-[#F7F4EF] text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold"
                      >
                        {lang === 'EN' ? 'Add' : 'Agregar'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                  <h2 className="font-serif text-xl flex items-center gap-2">
                    <Phone size={18} className="text-[#C5A059]" />
                    {lang === 'EN'
                      ? 'Direct Message (SMS) Phone Number'
                      : 'Teléfono para Recibir Comprobantes (SMS)'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'EN'
                      ? 'All booking receipts sent via Message go directly to this phone number (+1 689 247-2694 by default).'
                      : 'Todos los comprobantes enviados por Mensaje van directo a este número (+1 689 247-2694 por defecto).'}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={studioPhone}
                      onChange={(e) => setStudioPhone(e.target.value)}
                      placeholder="+1 (689) 247-2694"
                      className="flex-1 p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => pushConfigToCloud({ studioPhone })}
                      className="px-5 py-3 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold"
                    >
                      {lang === 'EN' ? 'Save' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-2xl">
                  {lang === 'EN'
                    ? 'Global Booking Condition ($20 Non-Refundable Deposit)'
                    : 'Condición General de Reserva (Apartado $20 No Reembolsable)'}
                </h2>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                    English Text
                  </label>
                  <textarea
                    rows={2}
                    value={globalPolicy.EN}
                    onChange={(e) => setGlobalPolicy({ ...globalPolicy, EN: e.target.value })}
                    onBlur={() => pushConfigToCloud()}
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
                    onChange={(e) => setGlobalPolicy({ ...globalPolicy, ES: e.target.value })}
                    onBlur={() => pushConfigToCloud()}
                    className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    const nextServices = services.map((s) => ({
                      ...s,
                      policyEN: globalPolicy.EN,
                      policyES: globalPolicy.ES,
                    }));
                    setServices(nextServices);
                    pushConfigToCloud({ services: nextServices });
                  }}
                  className="px-5 py-2.5 bg-[#222120] text-white text-xs uppercase tracking-widest font-semibold"
                >
                  {lang === 'EN'
                    ? 'Apply Condition to All Services'
                    : 'Aplicar Condición a Todos los Servicios'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE CLOUD SYNC & CAMBIO DE PIN */}
          {adminTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-xl">Google Cloud Sync (All Devices)</h2>
                <p className="text-xs text-gray-600">
                  {lang === 'EN'
                    ? 'Connected Web App URL (/exec). Changes made here sync automatically to all client devices.'
                    : 'URL /exec conectada. Todos los cambios realizados aquí se sincronizan en todos los teléfonos.'}
                </p>
                <input
                  type="text"
                  value={activeScriptUrl}
                  onChange={(e) => {
                    setCustomScriptUrl(e.target.value);
                    try {
                      localStorage.setItem('tina_studio_script_v11', e.target.value);
                    } catch {}
                  }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-xs font-mono"
                />
                {activeScriptUrl && (
                  <button
                    type="button"
                    onClick={() => pushConfigToCloud()}
                    className="px-4 py-2.5 bg-emerald-800 text-white text-xs uppercase tracking-widest font-semibold"
                  >
                    {lang === 'EN' ? 'Push Current Config to Cloud Now' : 'Subir Configuración Ahora'}
                  </button>
                )}
              </div>

              <div className="bg-white border border-[#DDD6CC] p-6 space-y-4">
                <h2 className="font-serif text-xl">
                  {lang === 'EN' ? 'Change Security PIN' : 'Cambiar PIN de Seguridad'}
                </h2>
                <p className="text-xs text-gray-600">
                  {lang === 'EN'
                    ? 'Current PIN is synced across devices when Cloud Sync is active.'
                    : 'El PIN se sincroniza en todos los dispositivos cuando la nube está activa.'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 digits (e.g. 2004)"
                    className="flex-1 p-3 border border-[#DDD6CC] bg-[#F7F4EF] text-center tracking-[0.5em] font-mono"
                  />
                  <button
                    onClick={() => {
                      if (newPinInput.length === 4) {
                        setAdminPin(newPinInput);
                        pushConfigToCloud({ adminPin: newPinInput });
                        setNewPinInput('');
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
  // VISTA 2: WEB PÚBLICA EDITORIAL DE TINA STUDIO
  // =========================================================================
  const monthLabel = viewMonth.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const weekdays =
    lang === 'EN'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const slotsForSelectedDate = selectedDate ? getSlotsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#222120] font-sans pb-24 sm:pb-12">
      <header className="sticky top-0 z-30 bg-[#F7F4EF]/95 backdrop-blur-sm border-b border-[#DDD6CC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 grid grid-cols-3 items-center">
          <nav className="flex items-center gap-4 sm:gap-6 text-xs uppercase tracking-widest font-semibold">
            <a href="#services" className="hover:text-[#C5A059] transition-colors">
              {t.navServices}
            </a>
            <a href="#booking" className="hidden sm:inline hover:text-[#C5A059] transition-colors">
              {t.navBook}
            </a>
          </nav>

          <a href="#" className="flex justify-center">
            <TinaLogo size="header" />
          </a>

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

      <section id="services" className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
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

      <section id="booking" className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-12">
        <div className="bg-white border border-[#DDD6CC] p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-semibold">
              TINA STUDIO SCHEDULE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl">{t.bookingTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-500">{t.bookingSubtitle}</p>
          </div>

          <div className="grid grid-cols-3 border-b border-[#DDD6CC] pb-4 mb-8 text-center text-[11px] sm:text-xs uppercase tracking-widest font-semibold">
            <button
              onClick={() => setBookingStep(1)}
              className={
                bookingStep === 1 ? 'text-[#222120] underline underline-offset-8' : 'text-gray-400'
              }
            >
              {t.step1}
            </button>
            <button
              onClick={() => selectedDate && selectedTime && setBookingStep(2)}
              className={
                bookingStep === 2 ? 'text-[#222120] underline underline-offset-8' : 'text-gray-400'
              }
            >
              {t.step2}
            </button>
            <button
              onClick={() =>
                selectedDate &&
                selectedTime &&
                clientName.trim() &&
                clientContactInfo.trim() &&
                setBookingStep(3)
              }
              className={
                bookingStep === 3 ? 'text-[#222120] underline underline-offset-8' : 'text-gray-400'
              }
            >
              {t.step3}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                    {t.selectFridaySat}
                  </p>

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

                  {selectedDate && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold">
                        {t.availableSlots} — <span className="text-[#C5A059]">{selectedDate}</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {slotsForSelectedDate.map((slot) => {
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
                      {t.contactInfoLabel}
                    </label>
                    <input
                      type="text"
                      value={clientContactInfo}
                      onChange={(e) => setClientContactInfo(e.target.value)}
                      placeholder="+1 (555) 123-4567 / camila@email.com"
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
                      disabled={
                        !clientName.trim() || !clientContactInfo.trim() || !clientIg.trim()
                      }
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
                  <div className="p-4 sm:p-5 bg-[#F7F4EF] border border-[#C5A059] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl flex items-center gap-2">
                        <CreditCard size={18} className="text-[#C5A059]" />
                        {t.paymentTitle}
                      </h3>
                      <span className="px-2.5 py-1 bg-[#222120] text-[#C5A059] text-xs font-bold">
                        $20 USD
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{t.paymentSub}</p>

                    <div className="space-y-2">
                      {paymentMethods.map((pm) => (
                        <div
                          key={pm.id}
                          className="p-3 bg-white border border-[#DDD6CC] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">
                              {pm.label}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold break-all">
                              {pm.value}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyTextValue(pm.id, pm.value)}
                            className="shrink-0 px-3 py-1.5 bg-[#F7F4EF] border border-[#DDD6CC] hover:border-[#222120] text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1"
                          >
                            {copiedKey === pm.id ? (
                              <>
                                <Check size={12} className="text-emerald-700" />
                                {lang === 'EN' ? 'Copied' : 'Copiado'}
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                {lang === 'EN' ? 'Copy' : 'Copiar'}
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

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

                  {bookingFeedback && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium text-center space-y-1">
                      <p>{t.bookedBanner}</p>
                      {calendarSyncStatus === 'syncing' && (
                        <p className="text-[11px] text-amber-800">
                          {lang === 'EN'
                            ? 'Syncing with Google Calendar...'
                            : 'Sincronizando con Google Calendar...'}
                        </p>
                      )}
                      {calendarSyncStatus === 'ok' && (
                        <p className="text-[11px] font-bold text-emerald-800">
                          {lang === 'EN'
                            ? '✓ Saved to Studio Google Calendar'
                            : '✓ Agendado en Google Calendar'}
                        </p>
                      )}
                      {calendarSyncStatus === 'error' && (
                        <p className="text-[11px] text-red-700 font-semibold">
                          {calendarErrorMsg}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <a
                      href={smsHref}
                      onClick={(e) => handleConfirmAction(e, smsHref, false)}
                      className={`w-full py-4 px-6 text-xs uppercase tracking-[0.16em] font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                        policyAccepted
                          ? 'bg-[#222120] text-white hover:bg-black'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#C5A059]" /> {t.sendMessageBtn}
                      </span>
                      <span className="text-[11px] font-normal tracking-normal opacity-85">
                        ({studioPhone})
                      </span>
                    </a>

                    <a
                      href="https://www.instagram.com/tinastudioo/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) =>
                        handleConfirmAction(e, 'https://www.instagram.com/tinastudioo/', true)
                      }
                      className={`w-full py-3 px-5 bg-white border border-[#DDD6CC] text-[#222120] text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors ${
                        policyAccepted
                          ? 'hover:border-[#222120]'
                          : 'opacity-45 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <Instagram size={15} /> {t.bookIgSecondaryBtn}
                    </a>

                    <button
                      type="button"
                      onClick={handleDownloadICS}
                      className="w-full py-3 px-5 bg-[#F7F4EF] border border-[#DDD6CC] text-[#222120] text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:border-[#222120]"
                    >
                      <Download size={15} /> {t.downloadIcsBtn}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center leading-relaxed">{t.msgHelper}</p>

                  <button
                    onClick={() => setBookingStep(2)}
                    className="text-xs uppercase tracking-widest text-gray-500 underline"
                  >
                    ← {t.backBtn}
                  </button>
                </div>
              )}
            </div>

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
                <div className="flex justify-between items-baseline text-xs font-bold text-[#C5A059]">
                  <span>{t.depositRequired}</span>
                  <span>${DEPOSIT_AMOUNT}.00</span>
                </div>
                {totalAmount > 0 && (
                  <div className="flex justify-between items-baseline text-xs text-gray-600 pt-1 border-t border-[#DDD6CC]/60">
                    <span>{t.balanceAtStudio}</span>
                    <span className="font-semibold">${remainingBalance.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-[#222120] text-white px-4 py-3 flex items-center justify-between border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gray-300 block">
              {cartItems.length} {lang === 'EN' ? 'service(s)' : 'servicio(s)'} · $20{' '}
              {lang === 'EN' ? 'deposit' : 'apartado'}
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

      {selectedServiceModal && (
        <div
          onClick={() => setSelectedServiceModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
                {lang === 'EN' ? 'Booking Policy ($20 Deposit)' : 'Condición de Reserva ($20)'}
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

      {showPinModal && (
        <div
          onClick={() => {
            setShowPinModal(false);
            setPinEntry('');
          }}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
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

            <div className="py-2 border-b-2 border-[#222120] font-mono text-2xl tracking-[0.5em] text-[#222120]">
              {pinEntry.padEnd(4, '•')}
            </div>

            {pinError && (
              <p className="text-xs text-red-700 font-semibold">
                {lang === 'EN' ? 'Incorrect PIN. Try again.' : 'PIN incorrecto. Intenta de nuevo.'}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinDigit(digit)}
                  className="py-3.5 bg-[#F7F4EF] active:bg-[#DDD6CC] font-semibold text-base touch-manipulation select-none"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinEntry('')}
                className="py-3.5 text-xs uppercase tracking-wider font-bold text-red-700 touch-manipulation"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="py-3.5 bg-[#F7F4EF] active:bg-[#DDD6CC] font-semibold text-base touch-manipulation select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPinEntry('');
                }}
                className="py-3.5 text-xs uppercase tracking-wider text-gray-500 touch-manipulation"
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
