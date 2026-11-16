import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Menu,
  Upload,
  ShieldCheck,
  Copy,
  RefreshCw,
  KeyRound,
  AlertCircle,
  Cloud,
  Globe,
  Link2,
  Delete
} from 'lucide-react';

// ============================================================================
// 1. STORAGE KEYS, CONSTANTS & TIMEZONE-SAFE DATE UTILITIES
// ============================================================================

const STORAGE_KEYS = {
  LANG: 'tina_studio_lang_v3',
  PIN: 'tina_studio_admin_pin_v3',
  SERVICES: 'tina_studio_services_v3',
  BOOKINGS: 'tina_studio_bookings_v3',
  BLOCKED: 'tina_studio_blocked_v3',
  NAILS_ENABLED: 'tina_studio_nails_enabled_v3',
  GAS_WEBHOOK_URL: 'tina_studio_gas_webhook_v3',
};

const STUDIO_INSTAGRAM_URL = 'https://www.instagram.com/tinastudioo/';
const STUDIO_INSTAGRAM_HANDLE = '@tinastudioo';
const DEFAULT_ADMIN_PIN = '2026';

const DEFAULT_POLICY_EN =
  'A 50% non-refundable deposit is required via Instagram DM (@tinastudioo) to confirm and hold your appointment.';
const DEFAULT_POLICY_ES =
  'Se requiere un depósito no reembolsable del 50% por DM de Instagram (@tinastudioo) para confirmar y apartar tu cita.';

// Format a Date object into 'YYYY-MM-DD' using local time (prevents UTC day shifts)
function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse 'YYYY-MM-DD' safely into a local Date object at noon
function parseLocalDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// Format date key for elegant editorial display in EN or ES
function formatEditorialDate(dateKey, lang = 'en', includeYear = true) {
  if (!dateKey) return '';
  const date = parseLocalDateKey(dateKey);
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const formatted = date.toLocaleDateString(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Build ISO timestamp for a given dateKey + studio slot
function buildSlotStartISO(dateKey, timeId) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const slotObj = STUDIO_TIME_SLOTS.find((s) => s.id === timeId) || { hour24: 9, minute: 0 };
  const dt = new Date(y, m - 1, d, slotObj.hour24, slotObj.minute, 0);
  return dt.toISOString();
}

// Find upcoming Fridays (5) and Saturdays (6) from today
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

// Studio's strict 3 daily appointment blocks on Fridays & Saturdays (2.5–3 hrs each)
const STUDIO_TIME_SLOTS = [
  { id: '9:00 AM', label: '9:00 AM', subEn: 'Morning Session', subEs: 'Sesión de la Mañana', hour24: 9, minute: 0 },
  { id: '12:30 PM', label: '12:30 PM', subEn: 'Midday Session', subEs: 'Sesión del Mediodía', hour24: 12, minute: 30 },
  { id: '4:00 PM', label: '4:00 PM', subEn: 'Afternoon Session', subEs: 'Sesión de la Tarde', hour24: 16, minute: 0 },
];

const MONTHS_BY_LANG = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  es: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
};

const WEEKDAYS_BY_LANG = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};

const CATEGORY_LABELS = {
  All: { en: 'All', es: 'Todos' },
  Lashes: { en: 'Lashes', es: 'Pestañas' },
  Eyebrow: { en: 'Eyebrow', es: 'Cejas' },
  Waxing: { en: 'Waxing', es: 'Depilación' },
  Facial: { en: 'Facial', es: 'Faciales' },
  Nails: { en: 'Nails', es: 'Uñas' },
};

// ============================================================================
// 2. BILINGUAL UI DICTIONARY (COMPLETE EN & ES TRANSLATIONS)
// ============================================================================

const UI_TEXT = {
  en: {
    navServices: 'Services & Looks',
    navBook: 'Book Appointment',
    heroBadgeBase: 'Lashes • Brows • Waxing • Facials',
    heroBadgeNails: ' • Nails',
    heroTitle1: 'Bespoke Beauty, Crafted with',
    heroTitle2: 'Editorial Precision',
    heroSubtitle:
      'Explore our lash styles, fullness guide, and studio treatments below. Select your Friday or Saturday session and confirm directly via Instagram DM with a 50% deposit.',
    factDays: 'Open Fridays & Saturdays',
    factHours: '9:00 AM • 12:30 PM • 4:00 PM',
    factDeposit: '50% Deposit via IG DM',
    step1: '1. Select Services',
    step2: '2. Fri / Sat Time',
    step3: '3. Details & Policy',
    newBadge: 'New',
    lashGuideTitle: 'Not sure which Lash Set to choose?',
    lashGuideDesc1: 'Tap',
    lashGuideBtn: '"View Style & Policy"',
    lashGuideDesc2:
      'on any card to compare fullness, spike texture, curl, and booking conditions. Every lash set includes a dedicated 2.5–3 hour studio session.',
    naturalLabel: 'Natural',
    ultraGlamLabel: 'Ultra Glam',
    studioWorkBadge: 'Studio Work',
    studioPreviewBadge: 'Studio Style Preview',
    viewStylePolicy: 'View Style & Policy',
    selectedBtn: 'Selected',
    selectBtn: 'Select',
    chooseTimeTitle: 'Choose Your Friday or Saturday Session',
    chooseTimeSub: 'Appointments are reserved in dedicated 2.5 to 3-hour studio blocks.',
    fridaysSaturdaysOnly: 'Fridays & Saturdays Only',
    friSatOpen: 'Fri / Sat Open',
    selectedLegend: 'Selected',
    closedLegend: 'Sun–Thu Closed',
    fullLabel: 'Full',
    leftLabel: 'left',
    selectedDateLabel: 'Selected Date',
    pickFriSatPrompt: 'Select a Friday or Saturday',
    blockAvailableSub: '2.5 – 3 hr private appointment block',
    blockBookedSub: 'Reserved by another client',
    blockBlockedSub: 'Unavailable / Studio blocked',
    statusUnavailable: 'Unavailable',
    statusSelected: 'Selected',
    statusOpen: 'Open',
    addOnsTitle: 'Complete Your Look (Same Session Add-Ons)',
    backToServices: 'Back to Services',
    continueToDetails: 'Continue to Details',
    detailsPolicyTitle: 'Your Appointment Details & Policy',
    detailsPolicySub:
      'Review your session summary and deposit condition before confirming via Instagram DM.',
    appointmentSummary: 'Appointment Summary',
    estimatedTotal: 'Estimated Total',
    depositDueLabel: '50% Non-Refundable Deposit (IG DM)',
    bookingConditionsTitle: 'Booking Conditions',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'e.g. Isabella Gomez',
    contactLabel: 'Instagram Username or Phone / WhatsApp *',
    contactPlaceholder: 'e.g. @isabellagomez or +1 (305) 555-0123',
    notesLabel: 'Notes, Style Goals, or Allergies (Optional)',
    notesPlaceholder:
      'Tell Valentina if you have sensitive eyes, prefer a cat-eye shape, or need a refill...',
    depositCheckboxLabel:
      'I understand and accept the 50% non-refundable deposit condition',
    backBtn: 'Back',
    reviewSendBtn: 'Review & Send to Instagram DM',
    finalStepLabel: 'Final Step',
    lockInTitle: 'Lock In Your Spot via DM',
    preparedFor: 'Prepared for',
    dateLabel: 'Date',
    sessionBlockLabel: 'Session Block',
    selectedServicesLabel: 'Selected Services',
    depositConditionsTitle: 'Deposit & Studio Conditions',
    bookViaIgBtn: 'Book via Instagram DM',
    clipboardHelpText:
      'Your reservation summary is automatically copied to your clipboard—just paste it in',
    clipboardHelpText2: 'DM to complete your 50% deposit!',
    downloadIcsBtn: 'Download Calendar Reminder (.ics)',
    bookAnotherBtn: 'Book another appointment',
    cartDepositText: '50% deposit',
    cartViaIg: 'via IG DM',
    chooseFriSatCta: 'Choose Fri / Sat Time',
    // Modal
    fullnessDramaLabel: 'Fullness & Drama Level',
    techniqueCurlLabel: 'Technique & Curl',
    sessionBlockModalLabel: 'Session Block',
    idealMatchLabel: 'Ideal Match:',
    modalConditionsTitle: 'Booking Conditions & Deposit Policy',
    closeBtn: 'Close',
    alreadyInSession: 'Already in Your Session',
    addToAppointment: 'Add to Appointment',
    // Footer & Private Profile
    footerHours: 'By Valentina Arraiz • Fridays & Saturdays (9:00 AM, 12:30 PM, 4:00 PM)',
    footerDeposit: '50% non-refundable deposit required via Instagram DM to confirm your session',
    privateProfileBtn: 'Private Profile',
    // PIN Lock Screen
    pinAccessTag: 'TINA STUDIO • Private Owner Access',
    pinTitle: "Valentina's Private Profile",
    pinSubtitle:
      'Enter your 4-digit security PIN to edit prices, upload photos, customize deposit policies, or manage your agenda.',
    pinErrorMsg: 'Incorrect PIN. Please try again.',
    pinClear: 'Clear',
    unlockProfileBtn: 'Unlock Private Profile',
    returnPublicBtn: 'Return to Public Menu',
    // Private Profile Dashboard
    ownerTag: 'Private Profile • TINA STUDIO',
    lockProfileBtn: 'Lock Profile',
    changePinBtn: 'Change PIN',
    newPinPlaceholder: 'New 4-digit PIN',
    savePinBtn: 'Save PIN',
    ownerSubtitle:
      'Update service prices, upload real studio photos from your phone, customize 50% deposit conditions, and sync your Google Calendar.',
    bookingsStat: 'Bookings',
    nailsMenuStat: 'Nails Menu',
    statusVisible: 'Visible',
    statusHidden: 'Hidden',
    tabPricesPhotos: 'Prices & Photos',
    tabConditions: 'Conditions & Policies',
    tabAgendaSync: 'Agenda & Google Sync',
    // Tab 1: Prices & Photos
    nailsControlTag: 'Category Visibility Switch',
    nailsControlTitle: 'Show Nails Category on Public Menu',
    nailsVisibleDesc:
      'Nails (Acrylic Full Set, Gel Manicure, Soft Gel Extensions) is currently VISIBLE to clients.',
    nailsHiddenDesc:
      'Nails is completely HIDDEN from clients right now. Flip this switch whenever you finish practicing and feel ready!',
    saveSyncBtn: 'Save & Sync Changes',
    syncingBtn: 'Syncing...',
    servicePriceLabel: 'Price ($)',
    uploadPhotoBtn: 'Upload Photo',
    replacePhotoBtn: 'Replace Photo',
    optimizingPhoto: 'Optimizing...',
    deletePhotoBtn: 'Remove',
    photoUrlPlaceholder: 'Or paste image URL (https://...)',
    serviceVisibleToggle: 'Active on Menu',
    serviceHiddenToggle: 'Hidden',
    defaultArtLabel: 'Editorial Art',
    // Tab 2: Conditions
    conditionsHeaderTitle: 'Service Deposit & Booking Conditions',
    conditionsHeaderSub:
      'Customize the 50% non-refundable deposit rule or special prep instructions shown on each service card and checkout.',
    applyAllPolicyBtn: 'Apply 50% Non-Refundable Deposit Policy to All Services',
    conditionEnLabel: 'Condition Text (English)',
    conditionEsLabel: 'Texto de Condición (Español)',
    // Tab 3: Agenda & Google Sync
    upcomingApptsTitle: 'Upcoming Client Reservations',
    noBookingsTitle: 'No Upcoming Reservations Yet',
    noBookingsSub:
      'When clients reserve a Friday or Saturday time block, their appointment card will appear here.',
    messageWhatsAppBtn: 'Message on WhatsApp',
    cancelSlotBtn: 'Cancel / Free Slot',
    confirmFreeBtn: 'Confirm Free Slot',
    keepBtn: 'Keep',
    manageHoursTitle: 'Block / Manage Friday & Saturday Hours',
    manageHoursSub:
      'Tap any open block to mark it unavailable (e.g., during your Nails training or personal time).',
    blockNoteLabel: 'Block Note (Optional)',
    blockNotePlaceholder: 'e.g. Nails Course / Personal',
    bookedLabel: 'Booked',
    blockedLabel: 'Blocked',
    openForClients: 'Open for clients',
    unblockBtn: 'Unblock',
    blockSlotBtn: 'Block Slot',
    googleSyncTag: '$0 Serverless Calendar Integration',
    googleSyncTitle: 'Google Calendar & Catalog Sync',
    googleSyncDesc:
      'Paste your Google Apps Script /exec Web App URL so new bookings automatically block 3 hours in your Google Calendar (with 24h & 1h phone reminders) and sync your prices/photos.',
    webhookUrlLabel: 'Google Apps Script Web App URL (/exec)',
    pullGoogleBtn: 'Pull Busy Hours from Google',
    pushGoogleBtn: 'Push Prices, Photos & Blocks to Google',
    scriptBoxTitle: 'Google Apps Script Code (Free Setup)',
    scriptBoxSub:
      'Paste into script.google.com under Valentina’s Google account and deploy as a Web App ("Anyone").',
    copyScriptBtn: 'Copy Script',
    viewCodeBtn: 'View Code',
    hideCodeBtn: 'Hide Code',
  },
  es: {
    navServices: 'Servicios y Estilos',
    navBook: 'Reservar Cita',
    heroBadgeBase: 'Pestañas • Cejas • Depilación • Faciales',
    heroBadgeNails: ' • Uñas',
    heroTitle1: 'Belleza a Medida, Creada con',
    heroTitle2: 'Precisión Editorial',
    heroSubtitle:
      'Explora nuestros estilos de pestañas, guía de volumen y tratamientos. Elige tu sesión de viernes o sábado y confirma por DM de Instagram con un depósito del 50%.',
    factDays: 'Abierto Viernes y Sábados',
    factHours: '9:00 AM • 12:30 PM • 4:00 PM',
    factDeposit: 'Depósito 50% por DM',
    step1: '1. Elegir Servicios',
    step2: '2. Fecha y Hora',
    step3: '3. Datos y Política',
    newBadge: 'Nuevo',
    lashGuideTitle: '¿No sabes qué set de pestañas elegir?',
    lashGuideDesc1: 'Toca',
    lashGuideBtn: '"Ver Estilo y Condiciones"',
    lashGuideDesc2:
      'en cualquier tarjeta para comparar volumen, textura, curvatura y condiciones de reserva. Cada set incluye un bloque privado de 2.5 a 3 horas.',
    naturalLabel: 'Natural',
    ultraGlamLabel: 'Ultra Glam',
    studioWorkBadge: 'Trabajo del Estudio',
    studioPreviewBadge: 'Vista Previa del Estilo',
    viewStylePolicy: 'Ver Estilo y Condiciones',
    selectedBtn: 'Seleccionado',
    selectBtn: 'Elegir',
    chooseTimeTitle: 'Elige tu Sesión de Viernes o Sábado',
    chooseTimeSub: 'Las citas se reservan en bloques exclusivos de 2.5 a 3 horas.',
    fridaysSaturdaysOnly: 'Solo Viernes y Sábados',
    friSatOpen: 'Vie / Sáb Disponible',
    selectedLegend: 'Seleccionado',
    closedLegend: 'Dom–Jue Cerrado',
    fullLabel: 'Lleno',
    leftLabel: 'disp.',
    selectedDateLabel: 'Fecha Seleccionada',
    pickFriSatPrompt: 'Selecciona un Viernes o Sábado',
    blockAvailableSub: 'Bloque privado de 2.5 – 3 hrs',
    blockBookedSub: 'Reservado por otra clienta',
    blockBlockedSub: 'No disponible / Bloqueado',
    statusUnavailable: 'Ocupado',
    statusSelected: 'Elegido',
    statusOpen: 'Disponible',
    addOnsTitle: 'Completa tu Look (Adicionales en la Misma Sesión)',
    backToServices: 'Volver a Servicios',
    continueToDetails: 'Continuar a Datos',
    detailsPolicyTitle: 'Detalles de tu Cita y Condiciones',
    detailsPolicySub:
      'Revisa el resumen de tu sesión y la política de depósito antes de confirmar por DM de Instagram.',
    appointmentSummary: 'Resumen de la Cita',
    estimatedTotal: 'Total Estimado',
    depositDueLabel: 'Depósito No Reembolsable 50% (DM)',
    bookingConditionsTitle: 'Condiciones de Reserva',
    fullNameLabel: 'Nombre Completo *',
    fullNamePlaceholder: 'ej. Isabella Gómez',
    contactLabel: 'Usuario de Instagram o Teléfono / WhatsApp *',
    contactPlaceholder: 'ej. @isabellagomez o +1 (305) 555-0123',
    notesLabel: 'Notas, Estilo Deseado o Alergias (Opcional)',
    notesPlaceholder:
      'Cuéntale a Valentina si tienes ojos sensibles, prefieres efecto cat-eye o vienes a retoque...',
    depositCheckboxLabel:
      'Entiendo y acepto la condición del depósito no reembolsable del 50%',
    backBtn: 'Atrás',
    reviewSendBtn: 'Revisar y Enviar a Instagram DM',
    finalStepLabel: 'Último Paso',
    lockInTitle: 'Aparta tu Cupo por DM',
    preparedFor: 'Preparado para',
    dateLabel: 'Fecha',
    sessionBlockLabel: 'Bloque Horario',
    selectedServicesLabel: 'Servicios Seleccionados',
    depositConditionsTitle: 'Condiciones del Depósito y Estudio',
    bookViaIgBtn: 'Reservar por DM de Instagram',
    clipboardHelpText:
      'El resumen de tu cita se copió automáticamente al portapapeles; solo pégalo en el DM de',
    clipboardHelpText2: 'para completar tu depósito del 50%.',
    downloadIcsBtn: 'Descargar Recordatorio de Calendario (.ics)',
    bookAnotherBtn: 'Reservar otra cita',
    cartDepositText: 'Depósito 50%',
    cartViaIg: 'por DM de IG',
    chooseFriSatCta: 'Elegir Hora (Vie / Sáb)',
    // Modal
    fullnessDramaLabel: 'Nivel de Volumen e Intensidad',
    techniqueCurlLabel: 'Técnica y Curvatura',
    sessionBlockModalLabel: 'Duración del Bloque',
    idealMatchLabel: 'Ideal Para:',
    modalConditionsTitle: 'Condiciones de Reserva y Depósito',
    closeBtn: 'Cerrar',
    alreadyInSession: 'Ya está en tu Sesión',
    addToAppointment: 'Agregar a mi Cita',
    // Footer & Private Profile
    footerHours: 'Por Valentina Arraiz • Viernes y Sábados (9:00 AM, 12:30 PM, 4:00 PM)',
    footerDeposit: 'Se requiere depósito no reembolsable del 50% por DM de Instagram para confirmar',
    privateProfileBtn: 'Perfil Privado',
    // PIN Lock Screen
    pinAccessTag: 'TINA STUDIO • Acceso Privado de Dueña',
    pinTitle: 'Perfil Privado de Valentina',
    pinSubtitle:
      'Ingresa tu PIN de seguridad de 4 dígitos para modificar precios, subir fotos, editar condiciones de depósito o gestionar tu agenda.',
    pinErrorMsg: 'PIN incorrecto. Inténtalo de nuevo.',
    pinClear: 'Borrar',
    unlockProfileBtn: 'Desbloquear Perfil Privado',
    returnPublicBtn: 'Volver al Menú Público',
    // Private Profile Dashboard
    ownerTag: 'Perfil Privado • TINA STUDIO',
    lockProfileBtn: 'Bloquear Perfil',
    changePinBtn: 'Cambiar PIN',
    newPinPlaceholder: 'Nuevo PIN (4 dígitos)',
    savePinBtn: 'Guardar PIN',
    ownerSubtitle:
      'Modifica precios, sube fotografías reales desde tu teléfono, personaliza las condiciones del 50% y sincroniza Google Calendar.',
    bookingsStat: 'Reservas',
    nailsMenuStat: 'Menú Uñas',
    statusVisible: 'Visible',
    statusHidden: 'Oculto',
    tabPricesPhotos: 'Precios y Fotos',
    tabConditions: 'Condiciones',
    tabAgendaSync: 'Agenda y Google Sync',
    // Tab 1: Prices & Photos
    nailsControlTag: 'Control de Visibilidad de Categoría',
    nailsControlTitle: 'Mostrar Categoría de Uñas en el Menú Público',
    nailsVisibleDesc:
      'Uñas (Acrylic Full Set, Gel Manicure, Soft Gel Extensions) está VISIBLE para las clientas.',
    nailsHiddenDesc:
      'Uñas está completamente OCULTO para el público. Activa este interruptor cuando termines tus prácticas y estés lista.',
    saveSyncBtn: 'Guardar y Sincronizar',
    syncingBtn: 'Sincronizando...',
    servicePriceLabel: 'Precio ($)',
    uploadPhotoBtn: 'Subir Foto',
    replacePhotoBtn: 'Cambiar Foto',
    optimizingPhoto: 'Optimizando...',
    deletePhotoBtn: 'Quitar',
    photoUrlPlaceholder: 'O pega URL de imagen (https://...)',
    serviceVisibleToggle: 'Visible en Menú',
    serviceHiddenToggle: 'Oculto',
    defaultArtLabel: 'Arte Editorial',
    // Tab 2: Conditions
    conditionsHeaderTitle: 'Condiciones y Política de Depósito por Servicio',
    conditionsHeaderSub:
      'Personaliza la regla del depósito no reembolsable del 50% o indicaciones especiales que se muestran en cada servicio.',
    applyAllPolicyBtn: 'Aplicar Política de Depósito 50% No Reembolsable a Todos',
    conditionEnLabel: 'Condition Text (English)',
    conditionEsLabel: 'Texto de Condición (Español)',
    // Tab 3: Agenda & Google Sync
    upcomingApptsTitle: 'Próximas Reservas de Clientas',
    noBookingsTitle: 'Aún No Hay Reservas Próximas',
    noBookingsSub:
      'Cuando las clientas reserven un bloque de viernes o sábado, sus datos aparecerán aquí.',
    messageWhatsAppBtn: 'Escribir por WhatsApp',
    cancelSlotBtn: 'Cancelar / Liberar Cupo',
    confirmFreeBtn: 'Confirmar Liberación',
    keepBtn: 'Mantener',
    manageHoursTitle: 'Bloquear / Gestionar Horarios de Viernes y Sábado',
    manageHoursSub:
      'Toca cualquier bloque libre para marcarlo como no disponible (ej. durante tu curso de uñas o tiempo personal).',
    blockNoteLabel: 'Motivo del Bloqueo (Opcional)',
    blockNotePlaceholder: 'ej. Curso de Uñas / Personal',
    bookedLabel: 'Reservado',
    blockedLabel: 'Bloqueado',
    openForClients: 'Disponible para clientas',
    unblockBtn: 'Desbloquear',
    blockSlotBtn: 'Bloquear Hora',
    googleSyncTag: 'Integración Gratuita ($0) con Google Calendar',
    googleSyncTitle: 'Sincronización con Google Calendar y Catálogo',
    googleSyncDesc:
      'Pega tu URL /exec de Google Apps Script para que las nuevas reservas bloqueen 3 horas en tu Google Calendar (con alertas 24h y 1h antes en tu celular) y sincronicen precios y fotos.',
    webhookUrlLabel: 'URL de Aplicación Web Google Apps Script (/exec)',
    pullGoogleBtn: 'Traer Horas Ocupadas de Google',
    pushGoogleBtn: 'Subir Precios, Fotos y Bloqueos a Google',
    scriptBoxTitle: 'Código de Google Apps Script (Instalación Gratis)',
    scriptBoxSub:
      'Pégalo en script.google.com con la cuenta de Google de Valentina e impleméntalo como Aplicación Web ("Cualquier usuario").',
    copyScriptBtn: 'Copiar Código',
    viewCodeBtn: 'Ver Código',
    hideCodeBtn: 'Ocultar Código',
  },
};

// ============================================================================
// 3. HTML5 CANVAS IMAGE COMPRESSION & CLIPBOARD HELPERS
// ============================================================================

/**
 * Compresses an uploaded image file from phone or desktop using HTML5 Canvas
 * (maxWidth 600px JPEG) so it stores cleanly in localStorage and syncs fast.
 */
function compressImageFile(file, maxWidth = 600, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#F7F4EF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Could not process the selected image.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

// ============================================================================
// 4. BILINGUAL SERVICE CATALOG (EN & ES) & UPDATED STUDIO PRICING
// ============================================================================

const INITIAL_SERVICES = [
  // --- LASHES / PESTAÑAS (12 SERVICES) ---
  {
    id: 'lash-lifting',
    category: 'Lashes',
    nameEn: 'Lifting',
    nameEs: 'Lifting',
    price: 50,
    enabled: true,
    fullnessLevel: 1,
    fullnessLabelEn: 'Natural Curl',
    fullnessLabelEs: 'Rizo Natural',
    curlStyleEn: 'Keratin Lift & Deep Tint',
    curlStyleEs: 'Lifting de Keratina y Tinte Profundo',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Natural lash curl & tint enhancement using your own lashes.',
    shortDescEs: 'Rizado y tinte natural utilizando tus propias pestañas.',
    fullDescEn:
      'A gentle keratin-infused lift that curls your natural lashes upward from the root, paired with a rich black tint for an effortless mascara-free wake-up look lasting 6–8 weeks.',
    fullDescEs:
      'Un levantamiento suave con keratina que riza tus pestañas naturales desde la raíz, acompañado de tinte negro intenso para un efecto rímel sin esfuerzo durante 6 a 8 semanas.',
    idealForEn: 'Clients with healthy natural lashes who want zero-maintenance curl without extensions.',
    idealForEs: 'Clientas con pestañas naturales sanas que buscan curvatura sin extensiones.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-lifting',
    photoUrl: '',
  },
  {
    id: 'lash-classic',
    category: 'Lashes',
    nameEn: 'Classic',
    nameEs: 'Clásico',
    price: 60,
    enabled: true,
    fullnessLevel: 2,
    fullnessLabelEn: 'Natural Mascara',
    fullnessLabelEs: 'Efecto Rímel Natural',
    curlStyleEn: '1:1 Single Extension • C / CC Curl',
    curlStyleEs: 'Extensión 1:1 • Curva C / CC',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: '1:1 natural mascara look, one extension per natural lash.',
    shortDescEs: 'Efecto rímel natural 1:1, una extensión por cada pestaña natural.',
    fullDescEn:
      'One ultra-lightweight silk/mink extension is bonded to each individual natural lash. Adds clean length, curl, and subtle definition—like wearing your favorite lengthening mascara.',
    fullDescEs:
      'Se adhiere una extensión ultraligera a cada pestaña natural individual. Aporta largo limpio, curvatura y definición sutil, como tu rímel alargador favorito.',
    idealForEn: 'First-time lash clients or anyone desiring timeless, understated everyday elegance.',
    idealForEs: 'Clientas primerizas o quienes buscan elegancia natural y discreta para el día a día.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-classic',
    photoUrl: '',
  },
  {
    id: 'lash-hybrid',
    category: 'Lashes',
    nameEn: 'Hybrid',
    nameEs: 'Híbrido',
    price: 65,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Soft Textured',
    fullnessLabelEs: 'Textura Suave',
    curlStyleEn: '50% Classic + 50% Volume Fans',
    curlStyleEs: '50% Clásico + 50% Abanicos Volumen',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: '50/50 blend of Classic and Volume fans for textured fullness.',
    shortDescEs: 'Mezcla 50/50 de técnica clásica y abanicos para densidad con textura.',
    fullDescEn:
      'The perfect middle ground between Classic and Volume. Alternating single lashes and handmade multi-lash fans create soft density, gentle fluff, and natural dimension.',
    fullDescEs:
      'El equilibrio perfecto entre Clásico y Volumen. Alterna fibras individuales y abanicos hechos a mano para lograr densidad suave y dimensión natural.',
    idealForEn: 'Clients who want more fullness than Classic without going full glam.',
    idealForEs: 'Clientas que desean más densidad que el set Clásico sin llegar a un look muy cargado.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-hybrid',
    photoUrl: '',
  },
  {
    id: 'lash-wispy',
    category: 'Lashes',
    nameEn: 'Wispy',
    nameEs: 'Wispy',
    price: 65,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Feathery Spikes',
    fullnessLabelEs: 'Picos Plumosos',
    curlStyleEn: 'Staggered Peaks • Kim-K Inspired',
    curlStyleEs: 'Picos Escalonados • Estilo Kim-K',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Staggered spike lengths for a feathery, Kim-K inspired look.',
    shortDescEs: 'Largos escalonados con picos ligeros estilo Kim-K.',
    fullDescEn:
      'Crafted with alternating closed peaks (spikes) and soft airy fans to achieve that coveted fluttery, textured strip-lash silhouette with noticeable high points.',
    fullDescEs:
      'Diseñado alternando picos cerrados (spikes) y abanicos ligeros para lograr una silueta texturizada tipo pestaña de tira con puntos altos definidos.',
    idealForEn: 'Clients who love an airy, fluttery, editorial "strip lash" look with soft peaks.',
    idealForEs: 'Clientas que aman un acabado ligero, con movimiento y picos editoriales definidos.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-wispy',
    photoUrl: '',
  },
  {
    id: 'lash-wet',
    category: 'Lashes',
    nameEn: 'Wet Set',
    nameEs: 'Wet Set',
    price: 65,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Sleek Glossy',
    fullnessLabelEs: 'Efecto Húmedo Pulido',
    curlStyleEn: 'Closed Narrow Fans • Glossy Finish',
    curlStyleEs: 'Abanicos Cerrados • Acabado Glossy',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: "Closed volume fans creating a sleek, glossy 'fresh out of water' look.",
    shortDescEs: 'Abanicos cerrados que crean un acabado brillante tipo recién salida del agua.',
    fullDescEn:
      'Uses narrow, closed volume fans instead of wide fluffy fans, creating sleek, dark, glossy spikes that mimic lashes right after stepping out of water or applying fresh serum.',
    fullDescEs:
      'Utiliza abanicos estrechos y cerrados en lugar de abanicos abiertos, logrando picos oscuros y pulidos que imitan las pestañas húmedas.',
    idealForEn: 'Clients who want darker definition than Classic with a modern, chic, spiky texture.',
    idealForEs: 'Clientas que buscan mayor definición oscura que el Clásico con un toque moderno.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-wet',
    photoUrl: '',
  },
  {
    id: 'lash-hawaiian',
    category: 'Lashes',
    nameEn: 'Hawaiian',
    nameEs: 'Hawaiano',
    price: 70,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Airy Tropical',
    fullnessLabelEs: 'Wispy Tropical Ligero',
    curlStyleEn: 'Light Wispy Texture • Soft Flutter',
    curlStyleEs: 'Textura Wispy Ligera • Movimiento Suave',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Soft, airy, tropical wispy texture with light volume.',
    shortDescEs: 'Textura wispy suave y aireada con volumen ligero.',
    fullDescEn:
      'A breezy, romantic custom mapping featuring delicate wispy tips and light, breathable fans that frame the eyes softly without feeling heavy.',
    fullDescEs:
      'Un diseño romántico y fresco con puntas wispy delicadas y abanicos ligeros que enmarcan la mirada sin sentirse pesados.',
    idealForEn: 'Vacation-ready beauty lovers who want a light, dreamy, sun-kissed flutter.',
    idealForEs: 'Amantes de un look fresco, soñador y ligero ideal para vacaciones.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-hawaiian',
    photoUrl: '',
  },
  {
    id: 'lash-egypt',
    category: 'Lashes',
    nameEn: 'Egypt Set',
    nameEs: 'Egipcio',
    price: 70,
    enabled: true,
    fullnessLevel: 4,
    fullnessLabelEn: 'Foxy Cat-Eye',
    fullnessLabelEs: 'Efecto Foxy / Cat-Eye',
    curlStyleEn: 'Elongated Outer Wing • L / M / CC Curl',
    curlStyleEs: 'Comisura Alargada • Curva L / M / CC',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Bold, defined, elongated cat-eye / foxy wispy styling.',
    shortDescEs: 'Diseño alargado tipo cat-eye / foxy definido y estilizado.',
    fullDescEn:
      'Signature elongated outer-corner mapping with sharp wispy peaks that visually lift and lengthen the eye shape for an exotic, sculpted foxy-eye eyeliner effect.',
    fullDescEs:
      'Diseño alargado hacia la esquina exterior con picos definidos que elevan y alargan visualmente la mirada con un efecto delineado foxy-eye.',
    idealForEn: 'Clients who love winged eyeliner and want a lifted, sultry almond-eye silhouette.',
    idealForEs: 'Clientas que aman el efecto delineado y buscan una mirada almendrada y elevada.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-egypt',
    photoUrl: '',
  },
  {
    id: 'lash-volume',
    category: 'Lashes',
    nameEn: 'Volume',
    nameEs: 'Volume',
    price: 80,
    enabled: true,
    fullnessLevel: 4,
    fullnessLabelEn: 'Fluffy Glam',
    fullnessLabelEs: 'Glamour Esponjoso',
    curlStyleEn: '3D–6D Handmade Fluffy Fans',
    curlStyleEs: 'Abanicos Artesanales 3D–6D',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Handmade fluffy fans (3D–6D) for a full, glamorous lash line.',
    shortDescEs: 'Abanicos esponjosos hechos a mano (3D–6D) para una línea tupida y glam.',
    fullDescEn:
      'Every fan is hand-crafted during your appointment using 3 to 6 ultra-fine fibers wrapped around a single natural lash—delivering a plush, velvety, uniform dark lash line.',
    fullDescEs:
      'Cada abanico se arma artesanalmente durante tu cita con 3 a 6 fibras ultrafinas por pestaña natural, logrando una línea oscura, aterciopelada y uniforme.',
    idealForEn: 'Clients who love full, fluffy, red-carpet glamour and a dark lash-line effect.',
    idealForEs: 'Clientas que aman el volumen tupido, esponjoso y un efecto delineado intenso.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-volume',
    photoUrl: '',
  },
  {
    id: 'lash-mega-volume',
    category: 'Lashes',
    nameEn: 'Mega Volume',
    nameEs: 'Mega Volume',
    price: 90,
    enabled: true,
    fullnessLevel: 5,
    fullnessLabelEn: 'Ultra Dramatic',
    fullnessLabelEs: 'Ultra Dramático',
    curlStyleEn: '8D–14D Featherlight Dense Fans',
    curlStyleEs: 'Abanicos Densos Ultraligeros 8D–14D',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Ultra-dense, dramatic dark lash line with lightweight fans.',
    shortDescEs: 'Máxima densidad y oscuridad dramática con abanicos ultraligeros.',
    fullDescEn:
      'Our boldest, darkest, most luxurious set. Crafted with microscopic 0.03mm fibers so even ultra-dense fans remain weightless and safe for your natural lashes.',
    fullDescEs:
      'Nuestro set más intenso, oscuro y lujoso. Elaborado con fibras microscópicas de 0.03mm para que incluso los abanicos más densos sean seguros y ligeros.',
    idealForEn: 'Clients seeking maximum drama, pitch-black density, and show-stopping fullness.',
    idealForEs: 'Clientas que buscan máximo impacto, densidad negro intenso y volumen total.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-mega',
    photoUrl: '',
  },
  {
    id: 'lash-wispy-volume',
    category: 'Lashes',
    nameEn: 'Wispy Volume',
    nameEs: 'Wispy Volume',
    price: 85,
    enabled: true,
    fullnessLevel: 5,
    fullnessLabelEn: 'Glam + Spikes',
    fullnessLabelEs: 'Volumen + Picos',
    curlStyleEn: 'Fluffy Volume Base + Tall Peaks',
    curlStyleEs: 'Base de Volumen + Picos Altos',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Full fluffy volume base combined with prominent textured spikes.',
    shortDescEs: 'Base completa de volumen esponjoso combinada con picos texturizados.',
    fullDescEn:
      'Combines the plush, dark fullness of a Volume base with dramatic, high-contrast wispy spikes for bold texture and unmistakable dimension.',
    fullDescEs:
      'Combina la densidad oscura de una base de Volumen con picos wispy de alto contraste para lograr textura audaz y dimensión inconfundible.',
    idealForEn: 'Clients who want both dense volume fullness AND dramatic, spiky wispy peaks.',
    idealForEs: 'Clientas que desean densidad completa de volumen Y picos marcados.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-wispy-volume',
    photoUrl: '',
  },
  {
    id: 'lash-refill',
    category: 'Lashes',
    nameEn: 'Refill',
    nameEs: 'Retoque',
    price: 60,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Maintenance Fill',
    fullnessLabelEs: 'Mantenimiento',
    curlStyleEn: '2–3 Week Maintenance (40%+ Remaining)',
    curlStyleEs: 'Mantenimiento 2–3 Semanas (40%+ Restante)',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Maintenance fill (must have at least 40% extensions remaining).',
    shortDescEs: 'Relleno de mantenimiento (debes conservar al menos el 40% de extensiones).',
    fullDescEn:
      'Outgrown extensions are gently removed and new extensions are applied to fresh natural lash growth. Note: At least 40% of extensions must remain; otherwise a Full Set is required.',
    fullDescEs:
      'Se retiran cuidadosamente las extensiones crecidas y se colocan nuevas en las pestañas en crecimiento. Nota: Debes conservar al menos 40% de extensiones; de lo contrario se cobra set nuevo.',
    idealForEn: 'Returning clients within 2 to 3 weeks of their previous lash appointment.',
    idealForEs: 'Clientas recurrentes dentro de las 2 a 3 semanas posteriores a su cita anterior.',
    conditionsEn:
      'Must have at least 40% of extensions remaining. A 50% non-refundable deposit is required via Instagram DM (@tinastudioo) to confirm your appointment.',
    conditionsEs:
      'Debes conservar al menos el 40% de tus extensiones. Se requiere un depósito no reembolsable del 50% por DM de Instagram (@tinastudioo) para confirmar tu cita.',
    illustrationType: 'lash-refill',
    photoUrl: '',
  },
  {
    id: 'lash-remove',
    category: 'Lashes',
    nameEn: 'Remove',
    nameEs: 'Remover',
    price: 40,
    enabled: true,
    fullnessLevel: 1,
    fullnessLabelEn: 'Gentle Removal',
    fullnessLabelEs: 'Retiro Suave',
    curlStyleEn: 'Soothing Cream Dissolver + Lash Bath',
    curlStyleEs: 'Removedor en Crema + Lash Bath',
    durationTextEn: '45 min – 1 hr',
    durationTextEs: '45 min – 1 hr',
    shortDescEn: 'Gentle, damage-free cream removal & nourishing lash bath.',
    shortDescEs: 'Retiro profesional en crema sin maltrato y limpieza profunda.',
    fullDescEn:
      'Professional cream bond dissolver safely slides off existing extensions without tugging or damaging your natural lashes, finished with a soothing foaming lash cleanse.',
    fullDescEs:
      'Removedor profesional en crema que desliza las extensiones sin tirar ni dañar tus pestañas naturales, finalizado con espuma limpiadora hidratante.',
    idealForEn: 'Clients ready for a fresh bare-lash break or transitioning from another studio.',
    idealForEs: 'Clientas que desean descansar sus pestañas naturales o retirar un set previo.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'lash-remove',
    photoUrl: '',
  },

  // --- EYEBROW / CEJAS (2 SERVICES — NO HENNA) ---
  {
    id: 'brow-lamination',
    category: 'Eyebrow',
    nameEn: 'Lamination',
    nameEs: 'Laminación',
    price: 20,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Fluffy & Lifted',
    fullnessLabelEs: 'Peinado y Elevado',
    curlStyleEn: 'Keratin Brow Restructure (6–8 Weeks)',
    curlStyleEs: 'Reestructuración con Keratina (6–8 Semanas)',
    durationTextEn: '40 min (Great Add-On)',
    durationTextEs: '40 min (Ideal como Adicional)',
    shortDescEn: 'Sleek, brushed-up fuller brow shape lasting 6–8 weeks.',
    shortDescEs: 'Cejas peinadas hacia arriba con mayor volumen durante 6 a 8 semanas.',
    fullDescEn:
      'Realigns unruly or downward-growing brow hairs into a lifted, feathery, symmetrical arch that stays brushed-up and full with minimal daily styling.',
    fullDescEs:
      'Realinea el vello rebelde o caído hacia un arco simétrico, peinado y abundante que se mantiene impecable con mínimo esfuerzo diario.',
    idealForEn: 'Anyone wanting fuller-looking, symmetrical, editorial brushed-up brows.',
    idealForEs: 'Ideal para lograr cejas más pobladas, simétricas y con acabado editorial.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'brow-lamination',
    photoUrl: '',
  },
  {
    id: 'brow-wax-mapping',
    category: 'Eyebrow',
    nameEn: 'Wax + Mapping',
    nameEs: 'Depilación + Diseño',
    price: 35,
    enabled: true,
    fullnessLevel: 2,
    fullnessLabelEn: 'Sculpted Arch',
    fullnessLabelEs: 'Arco Esculpido',
    curlStyleEn: 'Golden-Ratio Facial Mapping + Gentle Wax',
    curlStyleEs: 'Visagismo Facial + Depilación Suave',
    durationTextEn: '35 min (Great Add-On)',
    durationTextEs: '35 min (Ideal como Adicional)',
    shortDescEn: 'Precision facial symmetry mapping and clean brow shaping.',
    shortDescEs: 'Diseño de simetría facial y perfilado limpio con cera suave.',
    fullDescEn:
      'Custom architectural brow mapping tailored to your bone structure, followed by gentle precision waxing and trimming for crisp, balanced arches.',
    fullDescEs:
      'Diseño arquitectónico personalizado según tu estructura ósea, seguido de depilación de precisión y recorte para arcos definidos y equilibrados.',
    idealForEn: 'Clients seeking clean, symmetrical brow architecture tailored to their face.',
    idealForEs: 'Clientas que buscan cejas limpias, simétricas y diseñadas a la medida de su rostro.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'brow-mapping',
    photoUrl: '',
  },

  // --- WAXING / DEPILACIÓN (7 SERVICES) ---
  {
    id: 'wax-arm',
    category: 'Waxing',
    nameEn: 'Arm',
    nameEs: 'Brazos',
    price: 15,
    enabled: true,
    fullnessLevel: 1,
    fullnessLabelEn: 'Silky Smooth',
    fullnessLabelEs: 'Piel Suave',
    curlStyleEn: 'Gentle Low-Temp Creamy Wax',
    curlStyleEs: 'Cera Cremosa de Baja Temperatura',
    durationTextEn: '20 min (Great Add-On)',
    durationTextEs: '20 min (Adicional)',
    shortDescEn: 'Smooth, gentle arm hair removal with soothing post-care.',
    shortDescEs: 'Depilación suave de brazos con cuidado calmante posterior.',
    fullDescEn:
      'Delicate waxing formula removes hair cleanly from the root for weeks of smooth, soft skin without razor irritation.',
    fullDescEs:
      'Fórmula delicada que retira el vello de raíz para semanas de piel suave sin irritación por rastrillo.',
    idealForEn: 'Effortlessly smooth arms with finer regrowth over time.',
    idealForEs: 'Brazos suaves con crecimiento cada vez más fino.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'waxing',
    photoUrl: '',
  },
  {
    id: 'wax-underarm',
    category: 'Waxing',
    nameEn: 'Underarm',
    nameEs: 'Axilas',
    price: 15,
    enabled: true,
    fullnessLevel: 1,
    fullnessLabelEn: 'Clean & Smooth',
    fullnessLabelEs: 'Limpio y Suave',
    curlStyleEn: 'Sensitive-Skin Hard Wax',
    curlStyleEs: 'Cera Elástica para Piel Sensible',
    durationTextEn: '15 min (Great Add-On)',
    durationTextEs: '15 min (Adicional)',
    shortDescEn: 'Quick, clean underarm waxing for silky smooth skin.',
    shortDescEs: 'Depilación rápida y limpia de axilas para una piel suave.',
    fullDescEn:
      'Fast, gentle sensitive-area waxing that reduces dark shadow and ingrown hairs while keeping underarms smooth for weeks.',
    fullDescEs:
      'Depilación rápida para zonas sensibles que ayuda a reducir sombras oscuras y vellos encarnados.',
    idealForEn: 'Quick add-on to any lash or brow appointment.',
    idealForEs: 'Complemento rápido durante tu cita de pestañas o cejas.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'waxing',
    photoUrl: '',
  },
  {
    id: 'wax-lips',
    category: 'Waxing',
    nameEn: 'Lips',
    nameEs: 'Labios',
    price: 5,
    enabled: true,
    fullnessLevel: 1,
    fullnessLabelEn: 'Precision Touch',
    fullnessLabelEs: 'Toque de Precisión',
    curlStyleEn: 'Ultra-Gentle Facial Hard Wax',
    curlStyleEs: 'Cera Facial Ultrasuave',
    durationTextEn: '10 min (Quick Add-On)',
    durationTextEs: '10 min (Adicional Rápido)',
    shortDescEn: 'Gentle upper lip precision waxing with calming aloe finish.',
    shortDescEs: 'Depilación facial suave de labio superior con acabado calmante.',
    fullDescEn:
      'Quick, gentle upper lip hair removal designed specifically for delicate facial skin, leaving makeup application flawless.',
    fullDescEs:
      'Retiro rápido y delicado del vello del labio superior diseñado para piel facial sensible.',
    idealForEn: 'An easy $5 add-on during your lash or brow visit.',
    idealForEs: 'Un complemento ideal de $5 durante tu visita de pestañas o cejas.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'waxing',
    photoUrl: '',
  },
  {
    id: 'wax-bikini-trad',
    category: 'Waxing',
    nameEn: 'Traditional Bikini',
    nameEs: 'Bikini tradicional',
    price: 20,
    enabled: true,
    fullnessLevel: 2,
    fullnessLabelEn: 'Classic Clean',
    fullnessLabelEs: 'Línea Clásica',
    curlStyleEn: 'Gentle Low-Heat Hard Wax',
    curlStyleEs: 'Cera Elástica de Baja Temperatura',
    durationTextEn: '20 min (Great Add-On)',
    durationTextEs: '20 min (Adicional)',
    shortDescEn: 'Clean, natural bikini-line grooming outside swimwear edges.',
    shortDescEs: 'Perfilado limpio y natural de la línea del bikini.',
    fullDescEn:
      'Removes hair cleanly along the classic panty/swimwear line using gentle, skin-hugging hard wax for minimal discomfort.',
    fullDescEs:
      'Retira el vello a lo largo de la línea clásica del traje de baño con cera suave de mínimo malestar.',
    idealForEn: 'Clean, natural swimwear-ready upkeep.',
    idealForEs: 'Mantenimiento limpio y natural listo para traje de baño.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'waxing',
    photoUrl: '',
  },
  {
    id: 'wax-bikini-ext',
    category: 'Waxing',
    nameEn: 'Extended Bikini',
    nameEs: 'Bikini completo',
    price: 30,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Deep Sculpt',
    fullnessLabelEs: 'Depilación Completa',
    curlStyleEn: 'Precision Comfort Hard Wax',
    curlStyleEs: 'Cera de Alta Precisión y Confort',
    durationTextEn: '30 min',
    durationTextEs: '30 min',
    shortDescEn: 'Deeper bikini-line shaping tailored to your comfort.',
    shortDescEs: 'Depilación profunda de zona bikini adaptada a tu comodidad.',
    fullDescEn:
      'Takes more in from the sides and top than a traditional bikini wax for a sleeker, longer-lasting finish.',
    fullDescEs:
      'Abarca más área que el bikini tradicional para un acabado más pulido y duradero.',
    idealForEn: 'Clients wanting extra smoothness beyond a standard bikini line.',
    idealForEs: 'Clientas que desean mayor suavidad que una línea de bikini estándar.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'waxing',
    photoUrl: '',
  },
  {
    id: 'wax-half-leg',
    category: 'Waxing',
    nameEn: 'Half Leg',
    nameEs: 'Mitad de pierna',
    price: 25,
    enabled: true,
    fullnessLevel: 2,
    fullnessLabelEn: 'Knee to Ankle',
    fullnessLabelEs: 'Rodilla a Tobillo',
    curlStyleEn: 'Creamy Soft Wax + Hydrating Oil',
    curlStyleEs: 'Cera Suave + Aceite Hidratante',
    durationTextEn: '25 min',
    durationTextEs: '25 min',
    shortDescEn: 'Smooth waxing from knee to ankle with calming botanical oil.',
    shortDescEs: 'Depilación suave de rodilla a tobillo con aceite botánico.',
    fullDescEn:
      'Removes hair cleanly from knees down to ankles/toes, leaving skin radiant, exfoliated, and touchably soft.',
    fullDescEs:
      'Retira el vello desde las rodillas hasta los tobillos dejando la piel luminosa y suave.',
    idealForEn: 'Quick lower-leg smoothness between full treatments.',
    idealForEs: 'Suavidad rápida de media pierna entre sesiones completas.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'waxing',
    photoUrl: '',
  },
  {
    id: 'wax-full-leg',
    category: 'Waxing',
    nameEn: 'Full Leg',
    nameEs: 'Pierna completa',
    price: 35,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Hip to Ankle',
    fullnessLabelEs: 'Cadera a Tobillo',
    curlStyleEn: 'Full-Length Silky Wax Treatment',
    curlStyleEs: 'Depilación Integral de Piernas',
    durationTextEn: '45 min',
    durationTextEs: '45 min',
    shortDescEn: 'Complete silky smooth waxing from hip to ankle.',
    shortDescEs: 'Depilación completa de pierna desde la cadera hasta el tobillo.',
    fullDescEn:
      'Comprehensive full-leg hair removal leaving skin luminous and smooth for 3–4 weeks without daily shaving.',
    fullDescEs:
      'Depilación integral que deja las piernas suaves y luminosas durante 3 a 4 semanas.',
    idealForEn: 'Complete head-to-toe smoothness for vacations or special occasions.',
    idealForEs: 'Suavidad completa ideal para vacaciones u ocasiones especiales.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'waxing',
    photoUrl: '',
  },

  // --- FACIAL / FACIALES (1 SERVICE) ---
  {
    id: 'facial-extractions',
    category: 'Facial',
    nameEn: 'Facial with Extractions (40 min)',
    nameEs: 'Facial con extracción (40 min)',
    price: 40,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: '40 Min Deep Glow',
    fullnessLabelEs: 'Limpieza Profunda 40 Min',
    curlStyleEn: 'Steam • Pore Extractions • Calming Mask',
    curlStyleEs: 'Vapor • Extracción de Poros • Mascarilla',
    durationTextEn: '40 min',
    durationTextEs: '40 min',
    shortDescEn: '40 min deep pore cleansing, steam, and gentle extractions.',
    shortDescEs: '40 min de limpieza profunda de poros, vapor y extracciones suaves.',
    fullDescEn:
      'A revitalizing 40-minute clinical-meets-spa facial featuring double enzymatic cleansing, warm steam, meticulous gentle pore extractions, high-frequency purification, and a cooling hydrating mask.',
    fullDescEs:
      'Facial revitalizante de 40 minutos con doble limpieza enzimática, vapor tibio, extracción cuidadosa de impurezas, purificación y mascarilla hidratante calmante.',
    idealForEn: 'Congested pores, dullness, or anyone craving a clear, glass-skin glow.',
    idealForEs: 'Poros congestionados, piel opaca o quienes desean un brillo limpio y saludable.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'facial',
    photoUrl: '',
  },

  // --- NAILS / UÑAS (HIDDEN BY DEFAULT; ACTIVATED IN VALENTINA'S PRIVATE PROFILE) ---
  {
    id: 'nails-acrylic',
    category: 'Nails',
    nameEn: 'Acrylic Full Set',
    nameEs: 'Set Completo Acrílico',
    price: 55,
    enabled: true,
    fullnessLevel: 4,
    fullnessLabelEn: 'Sculpted Length',
    fullnessLabelEs: 'Largo Esculpido',
    curlStyleEn: 'Custom Shape & Gloss Gel Topcoat',
    curlStyleEs: 'Forma Personalizada y Brillo Gel',
    durationTextEn: '2.5 – 3 hrs session block',
    durationTextEs: 'Bloque de 2.5 – 3 hrs',
    shortDescEn: 'Sculpted custom-length acrylic extensions with glossy gel finish.',
    shortDescEs: 'Extensiones acrílicas esculpidas a medida con acabado gel brillante.',
    fullDescEn:
      'Durable, precision-sculpted acrylic nail extensions customized to your desired shape (almond, coffin, square) and finished with high-shine gel polish.',
    fullDescEs:
      'Extensiones acrílicas duraderas esculpidas con precisión en la forma que prefieras (almendra, coffin, cuadrada) con brillo gel.',
    idealForEn: 'Clients wanting strong, structured length and flawless cuticle work.',
    idealForEs: 'Clientas que buscan largo estructurado y trabajo impecable de cutícula.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'nails',
    photoUrl: '',
  },
  {
    id: 'nails-gel-mani',
    category: 'Nails',
    nameEn: 'Gel Manicure',
    nameEs: 'Manicura en Gel',
    price: 40,
    enabled: true,
    fullnessLevel: 2,
    fullnessLabelEn: 'Natural Gloss',
    fullnessLabelEs: 'Brillo Natural',
    curlStyleEn: 'Cuticle Care + Long-Wear Gel Polish',
    curlStyleEs: 'Limpieza de Cutícula + Esmaltado Gel',
    durationTextEn: '1 hr (Great Add-On)',
    durationTextEs: '1 hr (Adicional)',
    shortDescEn: 'Detailed cuticle care, shaping, and chip-free glossy gel polish.',
    shortDescEs: 'Cuidado detallado de cutícula, limado y esmaltado gel duradero.',
    fullDescEn:
      'Meticulous natural nail shaping, gentle cuticle detailing, and curing high-gloss gel color that stays chip-free for up to 3 weeks.',
    fullDescEs:
      'Limado meticuloso de uña natural, limpieza de cutícula y esmaltado gel de alto brillo hasta por 3 semanas.',
    idealForEn: 'Natural nail lovers wanting clean, glossy, long-lasting polish.',
    idealForEs: 'Amantes de las uñas naturales con acabado limpio y brillante.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'nails',
    photoUrl: '',
  },
  {
    id: 'nails-soft-gel',
    category: 'Nails',
    nameEn: 'Soft Gel Extensions',
    nameEs: 'Extensiones Soft Gel',
    price: 50,
    enabled: true,
    fullnessLevel: 3,
    fullnessLabelEn: 'Lightweight Chic',
    fullnessLabelEs: 'Ligero y Chic',
    curlStyleEn: 'Full-Cover Soak-Off Soft Gel Tips',
    curlStyleEs: 'Tips Soft Gel de Cobertura Completa',
    durationTextEn: '2 – 2.5 hrs',
    durationTextEs: '2 – 2.5 hrs',
    shortDescEn: 'Lightweight, natural-feeling full-cover soft gel extensions.',
    shortDescEs: 'Extensiones soft gel ligeras de aspecto natural.',
    fullDescEn:
      'Flexible, odor-free soft gel tips bonded seamlessly over your natural nail for instant salon-perfect shape and lightweight comfort.',
    fullDescEs:
      'Tips flexibles de soft gel adheridos suavemente sobre tu uña natural para un largo perfecto y ligero.',
    idealForEn: 'Clients wanting natural-feeling extensions without heavy acrylic.',
    idealForEs: 'Clientas que desean extensiones ligeras sin acrílico pesado.',
    conditionsEn: DEFAULT_POLICY_EN,
    conditionsEs: DEFAULT_POLICY_ES,
    illustrationType: 'nails',
    photoUrl: '',
  },
];

// Helper to get localized field from a service object
function getLocalizedService(srv, lang = 'en') {
  const isEs = lang === 'es';
  return {
    ...srv,
    name: isEs ? srv.nameEs || srv.nameEn : srv.nameEn,
    shortDesc: isEs ? srv.shortDescEs || srv.shortDescEn : srv.shortDescEn,
    fullDesc: isEs ? srv.fullDescEs || srv.fullDescEn : srv.fullDescEn,
    idealFor: isEs ? srv.idealForEs || srv.idealForEn : srv.idealForEn,
    fullnessLabel: isEs ? srv.fullnessLabelEs || srv.fullnessLabelEn : srv.fullnessLabelEn,
    curlStyle: isEs ? srv.curlStyleEs || srv.curlStyleEn : srv.curlStyleEn,
    durationText: isEs ? srv.durationTextEs || srv.durationTextEn : srv.durationTextEn,
    conditions: isEs
      ? srv.conditionsEs || DEFAULT_POLICY_ES
      : srv.conditionsEn || DEFAULT_POLICY_EN,
  };
}

// ============================================================================
// 5. BESPOKE SVG ILLUSTRATIONS (TINA STUDIO LOGO & LASH/BEAUTY LOOK ART)
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

function ServiceLookIllustration({ type, customPhotoUrl, name, lang = 'en' }) {
  const [imgError, setImgError] = useState(false);
  const t = UI_TEXT[lang];

  useEffect(() => {
    setImgError(false);
  }, [customPhotoUrl]);

  if (customPhotoUrl && !imgError) {
    return (
      <div className="relative w-full h-44 overflow-hidden bg-[#F7F4EF] border-b border-[#DDD6CC]/70">
        <img
          src={customPhotoUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#222120]/25 via-transparent to-transparent" />
        <span className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-full bg-white/90 text-[10px] uppercase tracking-[0.16em] text-[#222120] font-medium">
          {t.studioWorkBadge}
        </span>
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
              const step = i / 14;
              const x = 52 + step * 136;
              const baseY = 76 - Math.sin(step * Math.PI) * 11;
              const len = 24 + Math.sin(step * Math.PI) * 14;
              return (
                <path
                  key={i}
                  d={`M${x} ${baseY} Q${x + (step - 0.5) * 10} ${baseY - len * 0.6} ${x + (step - 0.5) * 18} ${baseY - len}`}
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
              const step = i / 12;
              const x = 54 + step * 132;
              const baseY = 76 - Math.sin(step * Math.PI) * 11;
              const len = 26 + Math.sin(step * Math.PI) * 15;
              const isFan = i % 2 === 1;
              return isFan ? (
                <g key={i} stroke="#222120" strokeWidth="1.2" opacity="0.85">
                  <line x1={x} y1={baseY} x2={x - 5} y2={baseY - len} />
                  <line x1={x} y1={baseY} x2={x} y2={baseY - len - 2} />
                  <line x1={x} y1={baseY} x2={x + 5} y2={baseY - len} />
                </g>
              ) : (
                <line key={i} x1={x} y1={baseY} x2={x + (step - 0.5) * 10} y2={baseY - len - 3} stroke="#222120" strokeWidth="1.8" strokeLinecap="round" />
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
              const step = i / 17;
              const x = 50 + step * 140;
              const baseY = 77 - Math.sin(step * Math.PI) * 12;
              const len = 18 + Math.sin(step * Math.PI) * 10;
              return (
                <line key={`b-${i}`} x1={x} y1={baseY} x2={x + (step - 0.5) * 12} y2={baseY - len} stroke="#222120" strokeWidth="1" opacity="0.55" />
              );
            })}
            {[0.18, 0.34, 0.5, 0.66, 0.82].map((step, idx) => {
              const x = 50 + step * 140;
              const baseY = 77 - Math.sin(step * Math.PI) * 12;
              const spikeLen = 34 + Math.sin(step * Math.PI) * 14;
              return (
                <g key={`s-${idx}`}>
                  <line x1={x - 1} y1={baseY} x2={x + (step - 0.5) * 14} y2={baseY - spikeLen} stroke="#222120" strokeWidth="2.1" strokeLinecap="round" />
                  <line x1={x + 1} y1={baseY} x2={x + (step - 0.5) * 14} y2={baseY - spikeLen} stroke="#C5A059" strokeWidth="0.9" strokeLinecap="round" />
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
              const step = i / 11;
              const x = 54 + step * 132;
              const baseY = 76 - Math.sin(step * Math.PI) * 11;
              const len = 28 + Math.sin(step * Math.PI) * 14;
              return (
                <polygon
                  key={i}
                  points={`${x - 1.5},${baseY} ${x + 1.5},${baseY} ${x + (step - 0.5) * 12},${baseY - len}`}
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
              const step = i / 15;
              const x = 48 + step * 150;
              const baseY = 79 - step * 9;
              const len = 16 + Math.pow(step, 1.35) * 34;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={baseY}
                  x2={x + 8 + step * 16}
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
              const step = i / 21;
              const x = 46 + step * 148;
              const baseY = 78 - Math.sin(step * Math.PI) * 13;
              const isExtraSpike = type === 'lash-wispy-volume' && i % 4 === 2;
              const len = (type === 'lash-mega' ? 34 : 29) + Math.sin(step * Math.PI) * 14 + (isExtraSpike ? 9 : 0);
              return (
                <g key={i} stroke="#222120" strokeWidth={type === 'lash-mega' ? '1.6' : '1.3'} opacity="0.88">
                  <line x1={x} y1={baseY} x2={x - 4 + (step - 0.5) * 10} y2={baseY - len} />
                  <line x1={x} y1={baseY} x2={x + (step - 0.5) * 12} y2={baseY - len - 1} />
                  <line x1={x} y1={baseY} x2={x + 4 + (step - 0.5) * 14} y2={baseY - len} />
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
        return (
          <svg viewBox="0 0 240 120" className="w-full h-full">
            <path
              d="M46 72 Q115 36 194 64 Q145 55 112 58 Q74 63 46 72 Z"
              fill="#222120"
              fillOpacity="0.14"
              stroke="#222120"
              strokeWidth="1.4"
            />
            {Array.from({ length: 16 }).map((_, i) => {
              const step = i / 15;
              const x = 52 + step * 134;
              const y = 68 - Math.sin(step * Math.PI) * 16;
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
    <div className="relative w-full h-44 bg-gradient-to-br from-[#F7F4EF] via-[#EDEAE4] to-[#F3DCE0]/45 flex flex-col items-center justify-center overflow-hidden border-b border-[#DDD6CC]/70">
      <div className="w-full h-28 px-4 transition-transform duration-500 group-hover:scale-105">
        {renderArt()}
      </div>
      <span className="text-[10px] uppercase tracking-[0.22em] text-[#7D766D] font-medium pb-2">
        {t.studioPreviewBadge}
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
// 6. ICS CALENDAR FILE DOWNLOAD GENERATOR (APPLE / GOOGLE / OUTLOOK)
// ============================================================================

function downloadBookingICS(booking, lang = 'en') {
  const [year, month, day] = booking.date.split('-').map(Number);
  const slotObj = STUDIO_TIME_SLOTS.find((s) => s.id === booking.time) || { hour24: 9, minute: 0 };

  const start = new Date(year, month - 1, day, slotObj.hour24, slotObj.minute, 0);
  const end = new Date(start.getTime() + 150 * 60 * 1000);

  const pad = (n) => String(n).padStart(2, '0');
  const formatICSDate = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const serviceNames = booking.services
    .map((s) => `${lang === 'es' ? s.nameEs || s.nameEn : s.nameEn} ($${s.price})`)
    .join(', ');

  const description =
    lang === 'es'
      ? [
          `Cita en TINA STUDIO by Valentina Arraiz`,
          `Referencia: ${booking.refCode}`,
          `Servicios: ${serviceNames}`,
          `Total Estimado: $${booking.total}`,
          `Política: Se requiere depósito no reembolsable del 50% por DM de Instagram (@tinastudioo) para apartar tu cupo.`,
          `Recordatorio: Asiste con pestañas y área de ojos completamente limpias y sin maquillaje.`,
        ].join('\\n')
      : [
          `Appointment at TINA STUDIO by Valentina Arraiz`,
          `Reference: ${booking.refCode}`,
          `Services: ${serviceNames}`,
          `Estimated Total: $${booking.total}`,
          `Deposit Policy: 50% non-refundable deposit required via Instagram DM (@tinastudioo) to hold your spot.`,
          `Prep Reminder: Please arrive with clean, makeup-free lashes & eye area.`,
        ].join('\\n');

  const firstServiceLabel =
    lang === 'es'
      ? booking.services[0]?.nameEs || booking.services[0]?.nameEn || 'Cita de Belleza'
      : booking.services[0]?.nameEn || 'Beauty Appointment';

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
    `SUMMARY:TINA STUDIO — ${firstServiceLabel}`,
    `DESCRIPTION:${description}`,
    'LOCATION:TINA STUDIO by Valentina Arraiz (@tinastudioo)',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `TINA-STUDIO-${booking.date}-${booking.refCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// 7. GOOGLE APPS SCRIPT TEMPLATE ($0 SERVERLESS CALENDAR & CATALOG SYNC)
// ============================================================================

const GOOGLE_APPS_SCRIPT_TEMPLATE = `// TINA STUDIO — Free Google Calendar & Catalog Sync (Google Apps Script)
// 1. Open script.google.com -> New Project -> Paste this code
// 2. Deploy -> New deployment -> Web app -> Execute as: Me -> Access: Anyone
// 3. Copy the /exec URL and paste it in Valentina's Private Profile -> Agenda & Google Sync

const TIMEZONE = Session.getScriptTimeZone();
const PROPS = PropertiesService.getScriptProperties();

function doGet() {
  const cal = CalendarApp.getDefaultCalendar();
  const now = new Date();
  const endRange = new Date();
  endRange.setDate(now.getDate() + 90);

  const events = cal.getEvents(now, endRange);
  const busySlots = events.map(event => {
    const start = event.getStartTime();
    const dateStr = Utilities.formatDate(start, TIMEZONE, "yyyy-MM-dd");
    const hour = Number(Utilities.formatDate(start, TIMEZONE, "H"));
    const minute = Number(Utilities.formatDate(start, TIMEZONE, "m"));

    let slot = null;
    if (hour === 9 && minute === 0) slot = "9:00 AM";
    else if (hour === 12 && minute === 30) slot = "12:30 PM";
    else if (hour === 16 && minute === 0) slot = "4:00 PM";

    return { date: dateStr, slot: slot, startISO: start.toISOString() };
  });

  const savedCatalog = PROPS.getProperty("STUDIO_CATALOG_JSON");
  const catalogData = savedCatalog ? JSON.parse(savedCatalog) : null;

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, busy: busySlots, catalog: catalogData }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === "syncCatalog") {
      PROPS.setProperty("STUDIO_CATALOG_JSON", JSON.stringify({
        services: payload.services,
        nailsEnabled: payload.nailsEnabled,
        blockedSlots: payload.blockedSlots
      }));
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, synced: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const cal = CalendarApp.getDefaultCalendar();
    const start = new Date(payload.startISO);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3-hour block

    const conflicts = cal.getEvents(start, end);
    if (conflicts.length > 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "SLOT_TAKEN" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const title = "[Pending 50% DM] " + payload.service + " — " + payload.clientName;
    const description = [
      "Client: " + payload.clientName,
      "Services: " + payload.service,
      "Estimated Total: $" + (payload.total || 0),
      "Contact / IG: " + (payload.contact || "Not provided"),
      "Notes: " + (payload.notes || "None"),
      "Policy Accepted: 50% non-refundable deposit via Instagram DM (@tinastudioo)"
    ].join("\\n");

    const event = cal.createEvent(title, start, end, { description: description });
    event.removeAllReminders();
    event.addPopupReminder(1440); // 24 hours before
    event.addPopupReminder(60);   // 1 hour before

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, eventId: event.getId() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

// ============================================================================
// 8. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Load Google Fonts dynamically for luxury serif + clean sans UI
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

  // --- Bilingual Language State (Default: 'en') ---
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      return saved === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const t = UI_TEXT[lang];

  // --- Custom Owner PIN State (Default: '2026') ---
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_ADMIN_PIN;
    } catch {
      return DEFAULT_ADMIN_PIN;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PIN, adminPin);
    } catch {
      // ignore
    }
  }, [adminPin]);

  // --- Persistent Services, Nails Toggle, Bookings & Blocked Slots ---
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
      return saved !== null ? JSON.parse(saved) : false;
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
    const upcomingDates = getUpcomingOpenDates(4);
    return [
      {
        id: 'seed-1',
        refCode: 'TINA-1042',
        date: upcomingDates[0],
        time: '12:30 PM',
        clientName: 'Sophia Martinez',
        contact: '@sophiamtz / +1 (305) 555-0194',
        notes: 'Loves soft feathery Kim-K spikes, first time trying brow lamination.',
        services: [
          { id: 'lash-wispy', nameEn: 'Wispy', nameEs: 'Wispy', price: 65, category: 'Lashes' },
          { id: 'brow-lamination', nameEn: 'Lamination', nameEs: 'Laminación', price: 20, category: 'Eyebrow' },
        ],
        total: 85,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-2',
        refCode: 'TINA-1089',
        date: upcomingDates[1],
        time: '9:00 AM',
        clientName: 'Camila Restrepo',
        contact: '@camilarestrepo_ / +1 (786) 555-0148',
        notes: 'Elongated foxy outer corner please!',
        services: [
          { id: 'lash-egypt', nameEn: 'Egypt Set', nameEs: 'Egipcio', price: 70, category: 'Lashes' },
        ],
        total: 70,
        createdAt: new Date().toISOString(),
      },
    ];
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

  const [gasWebhookUrl, setGasWebhookUrl] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.GAS_WEBHOOK_URL) || '';
    } catch {
      return '';
    }
  });

  const [googleBusySlots, setGoogleBusySlots] = useState([]);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error('Storage quota warning:', e);
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAS_WEBHOOK_URL, gasWebhookUrl);
    } catch (e) {
      console.error(e);
    }
  }, [gasWebhookUrl]);

  // --- Fetch Busy Slots & Synced Catalog from Google Apps Script (GET) ---
  const fetchFromGoogleAppsScript = async (silent = true) => {
    if (!gasWebhookUrl || !gasWebhookUrl.startsWith('http')) return;
    setIsSyncingGoogle(true);
    try {
      const res = await fetch(gasWebhookUrl);
      const data = await res.json();
      if (data && data.ok) {
        if (Array.isArray(data.busy)) {
          setGoogleBusySlots(data.busy);
        }
        if (data.catalog) {
          if (Array.isArray(data.catalog.services) && data.catalog.services.length > 0) {
            setServices(data.catalog.services);
          }
          if (typeof data.catalog.nailsEnabled === 'boolean') {
            setNailsEnabled(data.catalog.nailsEnabled);
          }
          if (Array.isArray(data.catalog.blockedSlots)) {
            setBlockedSlots(data.catalog.blockedSlots);
          }
        }
        if (!silent) {
          showToast(
            lang === 'es'
              ? '¡Sincronizado con Google Calendar y Catálogo!'
              : 'Synced with Google Calendar & Studio Catalog!'
          );
        }
      }
    } catch (err) {
      console.error('Google sync GET failed:', err);
      if (!silent) {
        showToast(
          lang === 'es'
            ? 'No se pudo conectar con Google Apps Script.'
            : 'Could not reach Google Apps Script URL. Check permissions.'
        );
      }
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  useEffect(() => {
    if (gasWebhookUrl) {
      fetchFromGoogleAppsScript(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushCatalogToGoogle = async () => {
    if (!gasWebhookUrl || !gasWebhookUrl.startsWith('http')) {
      showToast(
        lang === 'es'
          ? '¡Guardado! Agrega tu URL de Google Apps Script para sincronizar en la nube.'
          : 'Saved locally! Add your Google Apps Script URL to sync across devices.'
      );
      return;
    }
    setIsSyncingGoogle(true);
    try {
      await fetch(gasWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncCatalog',
          services,
          nailsEnabled,
          blockedSlots,
        }),
      });
      showToast(
        lang === 'es'
          ? '¡Catálogo, fotos y horarios sincronizados con Google!'
          : 'Catalog, photos & schedule synced to Google!'
      );
    } catch (err) {
      console.error('Google catalog POST failed:', err);
      showToast(
        lang === 'es'
          ? 'Guardado localmente, pero hubo un error de red al sincronizar.'
          : 'Saved locally, but Google sync encountered a network error.'
      );
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  // --- Navigation & Toast States ---
  const [mode, setMode] = useState('client'); // 'client' | 'admin'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? '' : prev));
    }, 3800);
  };

  // --- PIN Lock & Shake State for Private Profile ---
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinShake, setPinShake] = useState(false);
  const [showChangePinBox, setShowChangePinBox] = useState(false);
  const [newPinDraft, setNewPinDraft] = useState('');

  const triggerWrongPin = () => {
    setPinError(true);
    setPinShake(true);
    setPinInput('');
    setTimeout(() => setPinShake(false), 500);
  };

  const verifyPinAttempt = (candidate) => {
    if (candidate === adminPin) {
      setIsAdminUnlocked(true);
      setPinError(false);
      setPinInput('');
      showToast(
        lang === 'es'
          ? '¡Bienvenida, Valentina! Perfil Privado desbloqueado.'
          : 'Welcome back, Valentina! Private Profile unlocked.'
      );
    } else {
      triggerWrongPin();
    }
  };

  const handleKeypadPress = (digit) => {
    if (pinInput.length >= 4) return;
    const next = pinInput + digit;
    setPinInput(next);
    if (pinError) setPinError(false);
    if (next.length === 4) {
      setTimeout(() => verifyPinAttempt(next), 120);
    }
  };

  const handlePinFormSubmit = (e) => {
    e.preventDefault();
    verifyPinAttempt(pinInput.trim());
  };

  const handleSaveNewPin = (e) => {
    e.preventDefault();
    const cleaned = newPinDraft.replace(/\D/g, '');
    if (cleaned.length !== 4) {
      showToast(
        lang === 'es'
          ? 'El PIN debe tener exactamente 4 dígitos.'
          : 'PIN must be exactly 4 digits.'
      );
      return;
    }
    setAdminPin(cleaned);
    setNewPinDraft('');
    setShowChangePinBox(false);
    showToast(
      lang === 'es'
        ? `¡PIN actualizado a ${cleaned}!`
        : `Security PIN updated to ${cleaned}!`
    );
  };

  // --- Client Booking Flow State ---
  const [bookingStep, setBookingStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['lash-wispy']);
  const [inspectServiceId, setInspectServiceId] = useState(null);

  // Calendar State
  const initialUpcomingKey = useMemo(() => getUpcomingOpenDates(1)[0], []);
  const [calendarMonth, setCalendarMonth] = useState(() => parseLocalDateKey(initialUpcomingKey));
  const [selectedDateKey, setSelectedDateKey] = useState(initialUpcomingKey);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Client Details Form + Mandatory 50% Non-Refundable Deposit Checkbox
  const [clientForm, setClientForm] = useState({
    clientName: '',
    contact: '',
    notes: '',
  });
  const [acceptedDepositPolicy, setAcceptedDepositPolicy] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // --- Private Profile Admin Tabs ---
  const [adminTab, setAdminTab] = useState('prices'); // 'prices' | 'conditions' | 'agenda'
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('All');
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [uploadingServiceId, setUploadingServiceId] = useState(null);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const fileInputRefs = useRef({});

  // Localized & publicly visible services (Nails excluded when nailsEnabled is false, and disabled services excluded)
  const publicServices = useMemo(() => {
    return services
      .filter((s) => (s.category === 'Nails' ? nailsEnabled : true))
      .filter((s) => s.enabled !== false)
      .map((s) => getLocalizedService(s, lang));
  }, [services, nailsEnabled, lang]);

  // Inspected service in modal (dynamically localized)
  const inspectService = useMemo(() => {
    if (!inspectServiceId) return null;
    const found = services.find((s) => s.id === inspectServiceId);
    return found ? getLocalizedService(found, lang) : null;
  }, [inspectServiceId, services, lang]);

  // Clean up selected IDs if Nails or a service gets hidden
  useEffect(() => {
    const validIds = new Set(publicServices.map((s) => s.id));
    setSelectedServiceIds((prev) => prev.filter((id) => validIds.has(id)));
    if (!nailsEnabled && activeCategory === 'Nails') {
      setActiveCategory('All');
    }
  }, [publicServices, nailsEnabled, activeCategory]);

  const selectedServices = useMemo(
    () => publicServices.filter((s) => selectedServiceIds.includes(s.id)),
    [publicServices, selectedServiceIds]
  );

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [selectedServices]
  );

  const depositAmount = useMemo(() => Math.round(totalPrice * 0.5 * 100) / 100, [totalPrice]);

  const estimatedDurationLabel = useMemo(() => {
    if (selectedServices.length === 0) return '2.5 – 3 hrs';
    const hasFullSession = selectedServices.some(
      (s) =>
        (s.category === 'Lashes' && s.id !== 'lash-remove') ||
        s.id === 'nails-acrylic' ||
        s.id === 'nails-soft-gel'
    );
    if (hasFullSession) {
      if (lang === 'es') {
        return selectedServices.length > 1 ? '2.5 – 3 hrs (Sesión Combinada)' : '2.5 – 3 hrs';
      }
      return selectedServices.length > 1 ? '2.5 – 3 hrs (Combined Session)' : '2.5 – 3 hrs';
    }
    return selectedServices.length > 1
      ? lang === 'es'
        ? '1 – 1.5 hrs (Combinado)'
        : '1 – 1.5 hrs (Combined)'
      : selectedServices[0].durationText;
  }, [selectedServices, lang]);

  const activeBookingConditions = useMemo(() => {
    const unique = new Set();
    selectedServices.forEach((s) => {
      unique.add(s.conditions.trim());
    });
    return Array.from(unique);
  }, [selectedServices]);

  const toggleServiceSelection = (service) => {
    setSelectedServiceIds((prev) =>
      prev.includes(service.id)
        ? prev.filter((id) => id !== service.id)
        : [...prev, service.id]
    );
  };

  // Slot status lookup (Local Bookings + Google Calendar Busy + Owner Blocked)
  const getSlotStatus = (dateKey, timeId) => {
    const existingBooking = bookings.find((b) => b.date === dateKey && b.time === timeId);
    if (existingBooking) {
      return { status: 'booked', booking: existingBooking };
    }
    const existingGoogleBusy = googleBusySlots.find(
      (g) => g.date === dateKey && g.slot === timeId
    );
    if (existingGoogleBusy) {
      return { status: 'booked', booking: { clientName: 'Google Calendar Event' } };
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

  // Format clean bilingual reservation summary text for Instagram DM clipboard
  const formatReservationForInstagramDM = (booking, currentLang = lang) => {
    const serviceLines = booking.services
      .map(
        (s) =>
          `• ${currentLang === 'es' ? s.nameEs || s.nameEn : s.nameEn} ($${s.price})`
      )
      .join('\n');
    const depositDue = Math.round(booking.total * 0.5 * 100) / 100;

    if (currentLang === 'es') {
      return [
        `¡Hola Valentina! ✨ Me gustaría confirmar mi cita en TINA STUDIO:`,
        ``,
        `Ref: ${booking.refCode}`,
        `Fecha: ${formatEditorialDate(booking.date, 'es')}`,
        `Hora: ${booking.time} (sesión de 2.5–3 hrs)`,
        `Servicios:`,
        serviceLines,
        `Total Estimado: $${booking.total}`,
        `Depósito No Reembolsable (50%): $${depositDue}`,
        ``,
        `Nombre: ${booking.clientName}`,
        `Contacto / IG: ${booking.contact}`,
        booking.notes ? `Notas: ${booking.notes}` : null,
        ``,
        `✅ Entiendo y acepto la condición del depósito no reembolsable del 50%. Por favor envíame los datos para realizar el depósito y apartar mi cupo.`,
      ]
        .filter(Boolean)
        .join('\n');
    }

    return [
      `Hi Valentina! ✨ I'd like to confirm my appointment at TINA STUDIO:`,
      ``,
      `Ref: ${booking.refCode}`,
      `Date: ${formatEditorialDate(booking.date, 'en')}`,
      `Time: ${booking.time} (2.5–3 hr session)`,
      `Services:`,
      serviceLines,
      `Estimated Total: $${booking.total}`,
      `50% Non-Refundable Deposit: $${depositDue}`,
      ``,
      `Name: ${booking.clientName}`,
      `Instagram / Phone: ${booking.contact}`,
      booking.notes ? `Notes: ${booking.notes}` : null,
      ``,
      `✅ I understand and accept the 50% non-refundable deposit condition. Please send me your deposit details so I can lock in my spot!`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  // Step 3 -> Step 4 submission
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedDateKey || !selectedTimeSlot || selectedServices.length === 0) return;
    if (!clientForm.clientName.trim() || !clientForm.contact.trim()) return;
    if (!acceptedDepositPolicy) {
      showToast(
        lang === 'es'
          ? 'Por favor acepta la condición del depósito del 50%.'
          : 'Please accept the 50% non-refundable deposit condition first.'
      );
      return;
    }

    if (getSlotStatus(selectedDateKey, selectedTimeSlot).status !== 'available') {
      showToast(
        lang === 'es'
          ? 'Lo sentimos, ese horario acaba de ocuparse. Elige otro bloque.'
          : 'Sorry, that slot was just taken. Please pick another time.'
      );
      setBookingStep(2);
      return;
    }

    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: `bk-${Date.now()}`,
      refCode: `TINA-${refNumber}`,
      date: selectedDateKey,
      time: selectedTimeSlot,
      clientName: clientForm.clientName.trim(),
      contact: clientForm.contact.trim(),
      notes: clientForm.notes.trim(),
      services: selectedServices.map(({ id, nameEn, nameEs, price, category, conditionsEn, conditionsEs }) => ({
        id,
        nameEn,
        nameEs,
        price,
        category,
        conditionsEn: conditionsEn || DEFAULT_POLICY_EN,
        conditionsEs: conditionsEs || DEFAULT_POLICY_ES,
      })),
      total: totalPrice,
      depositAmount,
      acceptedPolicy: true,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [...prev, newBooking]);
    setConfirmedBooking(newBooking);
    setBookingStep(4);

    const dmText = formatReservationForInstagramDM(newBooking, lang);
    await copyTextToClipboard(dmText);
    showToast(
      lang === 'es'
        ? '¡Resumen copiado! Toca "Reservar por DM de Instagram" para enviarlo.'
        : 'Reservation copied! Tap "Book via Instagram DM" to send.'
    );

    if (gasWebhookUrl && gasWebhookUrl.startsWith('http')) {
      try {
        await fetch(gasWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'createBooking',
            startISO: buildSlotStartISO(newBooking.date, newBooking.time),
            service: newBooking.services.map((s) => s.nameEn).join(' + '),
            clientName: newBooking.clientName,
            contact: newBooking.contact,
            total: newBooking.total,
            notes: newBooking.notes,
          }),
        });
      } catch (err) {
        console.error('Google Calendar booking sync error:', err);
      }
    }
  };

  // Primary CTA on Step 4 -> Copy details & open Instagram DM (@tinastudioo)
  const handleBookViaInstagramDM = async () => {
    if (!confirmedBooking) return;
    if (!acceptedDepositPolicy) {
      showToast(
        lang === 'es'
          ? 'Marca la casilla del depósito no reembolsable del 50%.'
          : 'Please check the 50% non-refundable deposit agreement box.'
      );
      return;
    }
    const dmText = formatReservationForInstagramDM(confirmedBooking, lang);
    const copied = await copyTextToClipboard(dmText);
    if (copied) {
      showToast(
        lang === 'es'
          ? '¡Copiado al portapapeles! Pégalo en el DM de @tinastudioo.'
          : 'Details copied! Paste in @tinastudioo DM.'
      );
    }
    window.open(STUDIO_INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  const resetClientFlow = () => {
    setBookingStep(1);
    setSelectedTimeSlot('');
    setClientForm({ clientName: '', contact: '', notes: '' });
    setAcceptedDepositPolicy(false);
    setConfirmedBooking(null);
  };

  const buildAdminToClientWhatsAppUrl = (booking) => {
    const cleanDigits = (booking.contact || '').replace(/\D/g, '');
    const serviceNames = booking.services
      .map((s) => (lang === 'es' ? s.nameEs || s.nameEn : s.nameEn))
      .join(' + ');
    const message =
      lang === 'es'
        ? `¡Hola ${booking.clientName}! ✨ Recordatorio de *TINA STUDIO by Valentina Arraiz* para tu cita de *${serviceNames}* el *${formatEditorialDate(booking.date, 'es')} a las ${booking.time}*. Por favor asiste con pestañas limpias y sin maquillaje. ¡Nos vemos pronto! 🤍`
        : `Hi ${booking.clientName}! ✨ Reminder from *TINA STUDIO by Valentina Arraiz* for your *${serviceNames}* appointment on *${formatEditorialDate(booking.date, 'en')} at ${booking.time}*. Please come with clean, makeup-free lashes! See you soon 🤍`;
    return cleanDigits.length >= 7
      ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  // Direct file upload handler with HTML5 Canvas compression (max 600px JPEG)
  const handleServiceImageUpload = async (serviceId, file) => {
    if (!file) return;
    setUploadingServiceId(serviceId);
    try {
      const compressedBase64 = await compressImageFile(file, 600, 0.78);
      setServices((prev) =>
        prev.map((item) =>
          item.id === serviceId ? { ...item, photoUrl: compressedBase64 } : item
        )
      );
      showToast(
        lang === 'es'
          ? '¡Fotografía subida y optimizada!'
          : 'Photo uploaded & optimized!'
      );
    } catch (err) {
      showToast(err.message || 'Could not upload image.');
    } finally {
      setUploadingServiceId(null);
    }
  };

  // ============================================================================
  // 9. CALENDAR PICKER RENDERER (STRICT FRIDAYS & SATURDAYS ONLY)
  // ============================================================================

  const renderStudioCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      const dateKey = toLocalDateKey(cellDate);
      const openSlots = isStudioDay && !isPast ? getAvailableSlotCount(dateKey) : 0;
      const isDisabled = !isStudioDay || isPast;
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
              {openSlots === 0 ? t.fullLabel : `${openSlots} ${t.leftLabel}`}
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
              {MONTHS_BY_LANG[lang][month]} {year}
            </h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6E685F]">
              {t.fridaysSaturdaysOnly}
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
            {WEEKDAYS_BY_LANG[lang].map((wd, idx) => (
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
                {t.friSatOpen}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#222120]" />
                {t.selectedLegend}
              </span>
            </div>
            <span className="text-[11px] italic">{t.closedLegend}</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 10. DERIVED LISTS
  // ============================================================================

  const publicCategories = useMemo(() => {
    const base = ['All', 'Lashes', 'Eyebrow', 'Waxing', 'Facial'];
    return nailsEnabled ? [...base, 'Nails'] : base;
  }, [nailsEnabled]);

  const adminCategories = ['All', 'Lashes', 'Eyebrow', 'Waxing', 'Facial', 'Nails'];

  const filteredPublicServices = useMemo(() => {
    if (activeCategory === 'All') return publicServices;
    return publicServices.filter((s) => s.category === activeCategory);
  }, [publicServices, activeCategory]);

  const quickAddOns = useMemo(
    () =>
      publicServices.filter(
        (s) =>
          ['brow-lamination', 'brow-wax-mapping', 'wax-lips', 'wax-underarm'].includes(s.id) &&
          !selectedServiceIds.includes(s.id)
      ),
    [publicServices, selectedServiceIds]
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
  // 11. MAIN RENDER
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
        @keyframes pinShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-pin-shake {
          animation: pinShake 0.42s ease-in-out;
        }
      `}</style>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#222120] text-[#F7F4EF] px-5 py-3 rounded-full shadow-xl border border-[#C5A059]/40 flex items-center gap-2.5 text-sm">
          <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TOP EDITORIAL HEADER WITH BILINGUAL EN | ES SWITCHER                  */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-[#F7F4EF]/95 backdrop-blur-md border-b border-[#DDD6CC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Mark */}
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <a
                href={STUDIO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#5C564E] hover:text-[#222120] transition-colors flex items-center justify-center rounded-full hover:bg-[#EDEAE4]"
                title="Follow @tinastudioo on Instagram"
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
                {t.navServices}
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
                {t.navBook}
              </button>

              <div className="h-5 w-px bg-[#DDD6CC] mx-1.5" />

              {/* Prominent Editorial EN | ES Language Switcher Pill */}
              <div
                className="inline-flex items-center p-1 rounded-full bg-white border border-[#DDD6CC] shadow-2xs"
                role="group"
                aria-label="Language Switcher"
              >
                <Globe className="w-3.5 h-3.5 text-[#C5A059] ml-2 mr-1" />
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all ${
                    lang === 'en'
                      ? 'bg-[#222120] text-[#F7F4EF]'
                      : 'text-[#6E685F] hover:text-[#222120]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all ${
                    lang === 'es'
                      ? 'bg-[#222120] text-[#F7F4EF]'
                      : 'text-[#6E685F] hover:text-[#222120]'
                  }`}
                >
                  ES
                </button>
              </div>
            </nav>

            {/* Mobile Controls: Language Pill + IG + Hamburger */}
            <div className="flex items-center gap-1.5 md:hidden">
              <div className="inline-flex items-center p-0.5 rounded-full bg-white border border-[#DDD6CC]">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                    lang === 'en' ? 'bg-[#222120] text-[#F7F4EF]' : 'text-[#6E685F]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                    lang === 'es' ? 'bg-[#222120] text-[#F7F4EF]' : 'text-[#6E685F]'
                  }`}
                >
                  ES
                </button>
              </div>

              <a
                href={STUDIO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#5C564E] hover:text-[#222120] rounded-full hover:bg-[#EDEAE4]"
                title="Instagram @tinastudioo"
              >
                <Instagram className="w-4 h-4" />
              </a>

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

        {/* Mobile Navigation Drawer */}
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
              {t.navServices}
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
              {t.navBook}
            </button>
          </div>
        )}
      </header>

      {/* ===================================================================== */}
      {/* PUBLIC CLIENT EXPERIENCE                                              */}
      {/* ===================================================================== */}
      {mode === 'client' ? (
        <main className="pb-28">
          {/* Hero Section (Step 1) */}
          {bookingStep === 1 && (
            <section className="bg-[#F7F4EF] border-b border-[#DDD6CC]">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3DCE0]/60 border border-[#D49BA7]/40 text-xs uppercase tracking-[0.2em] text-[#222120] font-medium mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>
                    {t.heroBadgeBase}
                    {nailsEnabled ? t.heroBadgeNails : ''}
                  </span>
                </div>

                <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#222120] leading-[1.1]">
                  {t.heroTitle1}
                  <span className="italic font-normal text-[#6E685F]"> {t.heroTitle2}</span>
                </h1>

                <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-[#5C564E] leading-relaxed">
                  {t.heroSubtitle}
                </p>

                {/* Studio Quick Facts Bar */}
                <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 py-3 rounded-2xl bg-white border border-[#DDD6CC] text-xs text-[#5C564E] shadow-2xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#222120]">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                    {t.factDays}
                  </span>
                  <span className="hidden sm:inline text-[#DDD6CC]">|</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                    {t.factHours}
                  </span>
                  <span className="hidden sm:inline text-[#DDD6CC]">|</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                    {t.factDeposit}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* 3-Step Booking Progress Stepper */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
              {[
                { step: 1, label: t.step1 },
                { step: 2, label: t.step2 },
                { step: 3, label: t.step3 },
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

          {/* ================================================================= */}
          {/* STEP 1: BILINGUAL SERVICES & VISUAL LOOKS                         */}
          {/* ================================================================= */}
          {bookingStep === 1 && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Filter Pills (Nails omitted unless nailsEnabled is true) */}
              <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-6">
                {publicCategories.map((catKey) => {
                  const isActive = activeCategory === catKey;
                  const catDisplay = CATEGORY_LABELS[catKey]?.[lang] || catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setActiveCategory(catKey)}
                      className={`px-5 py-2.5 rounded-full text-xs sm:text-sm uppercase tracking-[0.14em] font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                        isActive
                          ? 'bg-[#222120] text-[#F7F4EF] border-[#222120] shadow-sm'
                          : 'bg-white text-[#222120] border-[#DDD6CC] hover:border-[#222120]'
                      }`}
                    >
                      <span>{catDisplay}</span>
                      {catKey === 'Nails' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059] text-white tracking-normal capitalize">
                          {t.newBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Educational Lash Style Quick-Comparison Bar */}
              {(activeCategory === 'All' || activeCategory === 'Lashes') && (
                <div className="mb-8 bg-white rounded-2xl border border-[#DDD6CC] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#222120]">
                        {t.lashGuideTitle}
                      </h4>
                      <p className="text-xs text-[#5C564E] mt-0.5">
                        {t.lashGuideDesc1}{' '}
                        <span className="font-medium text-[#222120]">{t.lashGuideBtn}</span>{' '}
                        {t.lashGuideDesc2}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6E685F] shrink-0">
                    <span>{t.naturalLabel}</span>
                    <FullnessMeter level={3} />
                    <span>{t.ultraGlamLabel}</span>
                  </div>
                </div>
              )}

              {/* Service Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublicServices.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);
                  const categoryBadge = CATEGORY_LABELS[service.category]?.[lang] || service.category;

                  return (
                    <div
                      key={service.id}
                      className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                        isSelected
                          ? 'border-[#222120] ring-2 ring-[#C5A059]/60 shadow-md'
                          : 'border-[#DDD6CC] hover:border-[#B8AEA0] shadow-2xs'
                      }`}
                    >
                      <div
                        onClick={() => setInspectServiceId(service.id)}
                        className="cursor-pointer relative"
                      >
                        <ServiceLookIllustration
                          type={service.illustrationType}
                          customPhotoUrl={service.photoUrl}
                          name={service.name}
                          lang={lang}
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#DDD6CC] text-[10px] uppercase tracking-[0.16em] font-medium text-[#222120]">
                          {categoryBadge}
                        </span>
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
                            onClick={() => setInspectServiceId(service.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C564E] hover:text-[#222120] py-2 px-2.5 rounded-lg hover:bg-[#F7F4EF] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>{t.viewStylePolicy}</span>
                          </button>

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
                                <span>{t.selectedBtn}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t.selectBtn}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: CHOOSE FRIDAY OR SATURDAY DATE & TIME SLOT                */}
          {/* ================================================================= */}
          {bookingStep === 2 && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#222120]">
                  {t.chooseTimeTitle}
                </h2>
                <p className="text-sm text-[#5C564E] mt-1">{t.chooseTimeSub}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6">{renderStudioCalendar()}</div>

                <div className="lg:col-span-6 space-y-6">
                  <div className="bg-white rounded-2xl border border-[#DDD6CC] p-5 sm:p-6 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#EDEAE4] pb-4 mb-5">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
                          {t.selectedDateLabel}
                        </span>
                        <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                          {selectedDateKey
                            ? formatEditorialDate(selectedDateKey, lang)
                            : t.pickFriSatPrompt}
                        </h3>
                      </div>
                      <Clock className="w-5 h-5 text-[#6E685F]" />
                    </div>

                    {selectedDateKey ? (
                      <div className="space-y-3">
                        {STUDIO_TIME_SLOTS.map((slot) => {
                          const slotInfo = getSlotStatus(selectedDateKey, slot.id);
                          const isAvailable = slotInfo.status === 'available';
                          const isChosen = selectedTimeSlot === slot.id;
                          const slotSub = lang === 'es' ? slot.subEs : slot.subEn;

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
                                    • {slotSub}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs mt-0.5 ${
                                    isChosen ? 'text-[#DDD6CC]' : 'text-[#6E685F]'
                                  }`}
                                >
                                  {isAvailable
                                    ? t.blockAvailableSub
                                    : slotInfo.status === 'booked'
                                    ? t.blockBookedSub
                                    : t.blockBlockedSub}
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
                                {!isAvailable
                                  ? t.statusUnavailable
                                  : isChosen
                                  ? t.statusSelected
                                  : t.statusOpen}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6E685F] py-6 text-center">
                        {t.pickFriSatPrompt}
                      </p>
                    )}
                  </div>

                  {quickAddOns.length > 0 && (
                    <div className="bg-[#F7F4EF] rounded-2xl border border-[#DDD6CC] p-5">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#6E685F] font-semibold">
                        {t.addOnsTitle}
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
                              <p className="text-[11px] text-[#6E685F]">
                                {CATEGORY_LABELS[addon.category]?.[lang] || addon.category}
                              </p>
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
                      <span>{t.backToServices}</span>
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
                      <span>{t.continueToDetails}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: CLIENT DETAILS & 50% DEPOSIT CONDITION AGREEMENT          */}
          {/* ================================================================= */}
          {bookingStep === 3 && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#222120]">
                  {t.detailsPolicyTitle}
                </h2>
                <p className="text-sm text-[#5C564E] mt-1">{t.detailsPolicySub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Summary & Service Conditions */}
                <div className="md:col-span-5 bg-[#F7F4EF] rounded-2xl border border-[#DDD6CC] p-5 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
                      {t.appointmentSummary}
                    </span>
                    <h3 className="font-serif-editorial text-xl font-semibold text-[#222120] mt-1">
                      {formatEditorialDate(selectedDateKey, lang)}
                    </h3>
                    <p className="text-sm font-medium text-[#5C564E] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-4 h-4 text-[#C5A059]" />
                      <span>{selectedTimeSlot} (2.5–3 hrs)</span>
                    </p>
                  </div>

                  <div className="border-t border-[#DDD6CC] pt-3 space-y-2">
                    {selectedServices.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-[#222120]">
                          {s.name}{' '}
                          <span className="text-xs text-[#6E685F]">
                            ({CATEGORY_LABELS[s.category]?.[lang] || s.category})
                          </span>
                        </span>
                        <span className="font-medium">${s.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#DDD6CC] pt-3 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs uppercase tracking-wider text-[#6E685F]">
                        {t.estimatedTotal}
                      </span>
                      <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                        ${totalPrice}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-[#9E5B69] font-semibold">
                      <span>{t.depositDueLabel}</span>
                      <span>${depositAmount}</span>
                    </div>
                  </div>

                  {/* Service Booking Conditions Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#D49BA7]/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#222120]">
                      <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                      <span>{t.bookingConditionsTitle}</span>
                    </div>
                    {activeBookingConditions.map((cond, i) => (
                      <p key={i} className="text-xs text-[#4A453F] leading-relaxed">
                        {cond}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Right: Form */}
                <form
                  onSubmit={handleConfirmBooking}
                  className="md:col-span-7 bg-white rounded-2xl border border-[#DDD6CC] p-6 space-y-4 shadow-2xs"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[#222120] mb-1.5">
                      {t.fullNameLabel}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8F887F] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={clientForm.clientName}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, clientName: e.target.value })
                        }
                        placeholder={t.fullNamePlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm focus:outline-none focus:border-[#222120]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[#222120] mb-1.5">
                      {t.contactLabel}
                    </label>
                    <div className="relative">
                      <Instagram className="w-4 h-4 text-[#8F887F] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={clientForm.contact}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, contact: e.target.value })
                        }
                        placeholder={t.contactPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm focus:outline-none focus:border-[#222120]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-[#222120] mb-1.5">
                      {t.notesLabel}
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-[#8F887F] absolute left-3.5 top-3.5" />
                      <textarea
                        rows={2}
                        value={clientForm.notes}
                        onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                        placeholder={t.notesPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm focus:outline-none focus:border-[#222120]"
                      />
                    </div>
                  </div>

                  {/* Mandatory 50% Non-Refundable Deposit Policy Checkbox */}
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F3DCE0]/45 border border-[#D49BA7]/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedDepositPolicy}
                      onChange={(e) => setAcceptedDepositPolicy(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#222120] accent-[#222120] shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-[#222120] font-medium leading-relaxed">
                      {t.depositCheckboxLabel}
                    </span>
                  </label>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="px-4 py-3 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-sm font-medium text-[#222120] hover:bg-[#EDEAE4]"
                    >
                      {t.backBtn}
                    </button>

                    <button
                      type="submit"
                      disabled={!acceptedDepositPolicy}
                      className={`flex-1 py-3.5 px-6 rounded-full text-sm font-medium shadow-md transition-all flex items-center justify-center gap-2 ${
                        acceptedDepositPolicy
                          ? 'bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] cursor-pointer'
                          : 'bg-[#CFC8BE] text-white cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                      <span>{t.reviewSendBtn}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: BOOKING SUMMARY & INSTAGRAM DM CTA                        */}
          {/* ================================================================= */}
          {bookingStep === 4 && confirmedBooking && (
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl border border-[#DDD6CC] shadow-lg overflow-hidden">
                <div className="bg-[#222120] text-[#F7F4EF] px-6 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center mx-auto mb-3">
                    <Instagram className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A059]">
                    {t.finalStepLabel} • {confirmedBooking.refCode}
                  </span>
                  <h2 className="font-serif-editorial text-3xl sm:text-4xl font-normal mt-1">
                    {t.lockInTitle}
                  </h2>
                  <p className="text-xs text-[#DDD6CC] mt-1">
                    {t.preparedFor} {confirmedBooking.clientName}
                  </p>
                </div>

                <div className="p-6 sm:p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F4EF] border border-[#DDD6CC]">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E685F]">
                        {t.dateLabel}
                      </span>
                      <p className="font-serif-editorial text-lg font-semibold text-[#222120]">
                        {formatEditorialDate(confirmedBooking.date, lang)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E685F]">
                        {t.sessionBlockLabel}
                      </span>
                      <p className="font-serif-editorial text-lg font-semibold text-[#222120]">
                        {confirmedBooking.time}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E685F]">
                      {t.selectedServicesLabel}
                    </span>
                    <div className="mt-2 divide-y divide-[#EDEAE4] border-y border-[#EDEAE4]">
                      {confirmedBooking.services.map((srv) => (
                        <div
                          key={srv.id}
                          className="py-2.5 flex items-center justify-between text-sm"
                        >
                          <span className="font-medium text-[#222120]">
                            {lang === 'es' ? srv.nameEs || srv.nameEn : srv.nameEn}
                          </span>
                          <span className="text-[#5C564E]">${srv.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-[#6E685F]">
                        {t.estimatedTotal}
                      </span>
                      <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                        ${confirmedBooking.total}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs font-semibold text-[#9E5B69]">
                      <span>{t.depositDueLabel}</span>
                      <span>${Math.round(confirmedBooking.total * 0.5 * 100) / 100}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F3DCE0]/45 border border-[#D49BA7]/60 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-semibold text-[#222120]">
                      <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                      <span>{t.depositConditionsTitle}</span>
                    </div>
                    <p className="text-xs text-[#4A453F] leading-relaxed">
                      {lang === 'es'
                        ? confirmedBooking.services[0]?.conditionsEs || DEFAULT_POLICY_ES
                        : confirmedBooking.services[0]?.conditionsEn || DEFAULT_POLICY_EN}
                    </p>
                    <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptedDepositPolicy}
                        onChange={(e) => setAcceptedDepositPolicy(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-[#222120] accent-[#222120] shrink-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-[#222120]">
                        {t.depositCheckboxLabel}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-3 pt-1">
                    <button
                      type="button"
                      disabled={!acceptedDepositPolicy}
                      onClick={handleBookViaInstagramDM}
                      className={`w-full py-3.5 px-5 rounded-full text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-all ${
                        acceptedDepositPolicy
                          ? 'bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] cursor-pointer'
                          : 'bg-[#CFC8BE] text-white cursor-not-allowed'
                      }`}
                    >
                      <Instagram className="w-4 h-4 text-[#C5A059]" />
                      <span>{t.bookViaIgBtn}</span>
                    </button>

                    <p className="text-[11px] text-center text-[#6E685F] leading-relaxed px-3">
                      {t.clipboardHelpText}{' '}
                      <strong className="text-[#222120]">{STUDIO_INSTAGRAM_HANDLE}</strong>{' '}
                      {t.clipboardHelpText2}
                    </p>

                    <button
                      type="button"
                      onClick={() => downloadBookingICS(confirmedBooking, lang)}
                      className="w-full py-3.5 px-5 rounded-full bg-[#F7F4EF] text-[#222120] border border-[#222120] hover:bg-[#EDEAE4] text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.downloadIcsBtn}</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={resetClientFlow}
                      className="text-xs text-[#6E685F] hover:text-[#222120] underline"
                    >
                      {t.bookAnotherBtn}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STICKY MULTI-SERVICE CART BAR (STEP 1)                            */}
          {/* ================================================================= */}
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
                      {estimatedDurationLabel} • {t.cartDepositText} (${depositAmount}) {t.cartViaIg}
                    </p>
                  </div>

                  <div className="sm:hidden font-serif-editorial text-2xl font-semibold text-[#222120]">
                    ${totalPrice}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#6E685F] block">
                      {t.estimatedTotal}
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
                    <span>{t.chooseFriSatCta}</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : !isAdminUnlocked ? (
        /* =================================================================== */
        /* PIN-PROTECTED PRIVATE PROFILE LOCK SCREEN (KEYPAD + SHAKE)          */
        /* =================================================================== */
        <main className="max-w-md mx-auto px-4 py-12 sm:py-20">
          <div
            className={`bg-white rounded-3xl border border-[#DDD6CC] p-7 sm:p-8 shadow-md text-center space-y-6 ${
              pinShake ? 'animate-pin-shake border-[#B84A58]' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-[#F7F4EF] border border-[#C5A059] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6 text-[#C5A059]" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-semibold">
                {t.pinAccessTag}
              </span>
              <h1 className="font-serif-editorial text-3xl font-semibold text-[#222120] mt-1">
                {t.pinTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#5C564E] mt-1.5">{t.pinSubtitle}</p>
            </div>

            {/* 4-Digit Masked PIN Indicator Dots */}
            <form onSubmit={handlePinFormSubmit} className="space-y-5">
              <div className="flex items-center justify-center gap-3.5 py-2">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = idx < pinInput.length;
                  return (
                    <span
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all ${
                        pinError
                          ? 'bg-[#B84A58]'
                          : filled
                          ? 'bg-[#222120] scale-110 ring-2 ring-[#C5A059]/60'
                          : 'bg-[#EDEAE4] border border-[#CFC8BE]'
                      }`}
                    />
                  );
                })}
              </div>

              {pinError && (
                <p className="text-xs text-[#B84A58] font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t.pinErrorMsg}</span>
                </p>
              )}

              {/* Touch-Friendly 4-Digit Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-12 rounded-2xl bg-[#F7F4EF] hover:bg-[#EDEAE4] active:scale-95 border border-[#DDD6CC] font-serif-editorial text-2xl font-semibold text-[#222120] transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="h-12 rounded-2xl bg-white hover:bg-[#F7F4EF] border border-[#DDD6CC] text-xs uppercase tracking-wider font-medium text-[#6E685F]"
                >
                  {t.pinClear}
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-2xl bg-[#F7F4EF] hover:bg-[#EDEAE4] active:scale-95 border border-[#DDD6CC] font-serif-editorial text-2xl font-semibold text-[#222120] transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                  className="h-12 rounded-2xl bg-white hover:bg-[#F7F4EF] border border-[#DDD6CC] flex items-center justify-center text-[#6E685F]"
                  aria-label="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={pinInput.length < 4}
                className={`w-full py-3.5 px-6 rounded-full text-sm font-medium shadow-sm transition-all ${
                  pinInput.length === 4
                    ? 'bg-[#222120] text-[#F7F4EF] hover:bg-[#383634]'
                    : 'bg-[#CFC8BE] text-white cursor-not-allowed'
                }`}
              >
                {t.unlockProfileBtn}
              </button>
            </form>

            <div className="pt-2 border-t border-[#EDEAE4] flex items-center justify-between text-xs text-[#6E685F]">
              <span>
                PIN: <strong>{adminPin === DEFAULT_ADMIN_PIN ? '2026' : '••••'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setMode('client')}
                className="underline hover:text-[#222120]"
              >
                {t.returnPublicBtn}
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* =================================================================== */
        /* UNLOCKED VALENTINA'S PRIVATE PROFILE DASHBOARD                      */
        /* =================================================================== */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Private Profile Header Card */}
          <div className="bg-white rounded-3xl border border-[#DDD6CC] p-6 sm:p-8 mb-8 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-semibold">
                    {t.ownerTag}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminUnlocked(false);
                      setMode('client');
                      showToast(lang === 'es' ? 'Perfil bloqueado.' : 'Private Profile locked.');
                    }}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] inline-flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3 text-[#C5A059]" />
                    <span>{t.lockProfileBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePinBox(!showChangePinBox)}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-[#222120] hover:border-[#222120] inline-flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3 text-[#C5A059]" />
                    <span>{t.changePinBtn}</span>
                  </button>
                </div>

                <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#222120] mt-1">
                  {t.pinTitle}
                </h1>
                <p className="text-sm text-[#5C564E] mt-1">{t.ownerSubtitle}</p>
              </div>

              <div className="flex items-center gap-3 bg-[#F7F4EF] px-4 py-3 rounded-2xl border border-[#DDD6CC] shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#6E685F] block">
                    {t.bookingsStat}
                  </span>
                  <span className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                    {sortedBookings.length}
                  </span>
                </div>
                <div className="h-8 w-px bg-[#DDD6CC]" />
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#6E685F] block">
                    {t.nailsMenuStat}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      nailsEnabled ? 'text-[#222120]' : 'text-[#9E5B69]'
                    }`}
                  >
                    {nailsEnabled ? t.statusVisible : t.statusHidden}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Custom 4-Digit PIN Editor */}
            {showChangePinBox && (
              <form
                onSubmit={handleSaveNewPin}
                className="pt-4 border-t border-[#EDEAE4] flex flex-wrap items-center gap-2.5"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPinDraft}
                  onChange={(e) => setNewPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder={t.newPinPlaceholder}
                  className="px-4 py-2 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-xs font-semibold tracking-widest w-44 focus:outline-none focus:border-[#222120]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#222120] text-[#F7F4EF] text-xs font-medium"
                >
                  {t.savePinBtn}
                </button>
              </form>
            )}
          </div>

          {/* Private Profile 3 Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'prices', label: t.tabPricesPhotos, icon: Sliders },
              { id: 'conditions', label: t.tabConditions, icon: ShieldCheck },
              { id: 'agenda', label: t.tabAgendaSync, icon: CalendarIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-4 sm:px-5 py-3 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 transition-all border ${
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

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: PRICES & PHOTOS (DIRECT PHONE UPLOAD + URL + NAILS SWITCH) */}
          {/* ----------------------------------------------------------------- */}
          {adminTab === 'prices' && (
            <div className="space-y-6">
              {/* Nails Master Visibility Toggle */}
              <div className="bg-gradient-to-r from-white via-[#F3DCE0]/35 to-white rounded-2xl border border-[#D49BA7]/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#9E5B69] font-semibold">
                    {t.nailsControlTag}
                  </span>
                  <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120] mt-0.5">
                    {t.nailsControlTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C564E] mt-1">
                    {nailsEnabled ? t.nailsVisibleDesc : t.nailsHiddenDesc}
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
                        ? lang === 'es'
                          ? '¡Categoría de Uñas activada en el menú público!'
                          : 'Nails category is now LIVE on your public menu!'
                        : lang === 'es'
                        ? 'Categoría de Uñas oculta.'
                        : 'Nails category hidden from public menu.'
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

              {/* Category Filter & Save/Sync Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {adminCategories.map((catKey) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setAdminCategoryFilter(catKey)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${
                        adminCategoryFilter === catKey
                          ? 'bg-[#222120] text-white border-[#222120]'
                          : 'bg-white text-[#222120] border-[#DDD6CC]'
                      }`}
                    >
                      {CATEGORY_LABELS[catKey]?.[lang] || catKey}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={pushCatalogToGoogle}
                  disabled={isSyncingGoogle}
                  className="px-5 py-2.5 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-xs font-medium inline-flex items-center justify-center gap-2 shadow-2xs shrink-0"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#C5A059] ${isSyncingGoogle ? 'animate-spin' : ''}`}
                  />
                  <span>{isSyncingGoogle ? t.syncingBtn : t.saveSyncBtn}</span>
                </button>
              </div>

              {/* Service Price, Photo Upload & URL Editor Cards */}
              <div className="space-y-4">
                {services
                  .filter(
                    (s) => adminCategoryFilter === 'All' || s.category === adminCategoryFilter
                  )
                  .map((srv) => {
                    const displayName = lang === 'es' ? srv.nameEs || srv.nameEn : srv.nameEn;
                    const isServiceActive = srv.enabled !== false;

                    return (
                      <div
                        key={srv.id}
                        className="bg-white rounded-2xl border border-[#DDD6CC] p-5 space-y-4 shadow-2xs"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Photo Thumbnail + Direct Upload / URL */}
                          <div className="flex items-start sm:items-center gap-4 flex-1">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#DDD6CC] bg-[#F7F4EF] shrink-0 relative">
                              {srv.photoUrl ? (
                                <img
                                  src={srv.photoUrl}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[#8F887F] p-1 text-center">
                                  <ImageIcon className="w-5 h-5 mb-0.5" />
                                  <span className="text-[9px] uppercase tracking-wider">
                                    {t.defaultArtLabel}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-semibold">
                                  {CATEGORY_LABELS[srv.category]?.[lang] || srv.category}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setServices((prev) =>
                                      prev.map((item) =>
                                        item.id === srv.id
                                          ? { ...item, enabled: !isServiceActive }
                                          : item
                                      )
                                    );
                                  }}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    isServiceActive
                                      ? 'bg-[#F7F4EF] text-[#222120] border-[#DDD6CC]'
                                      : 'bg-[#F3DCE0] text-[#9E5B69] border-[#D49BA7]'
                                  }`}
                                >
                                  {isServiceActive ? t.serviceVisibleToggle : t.serviceHiddenToggle}
                                </button>
                              </div>

                              <h4 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                                {displayName}
                              </h4>

                              {/* Upload Button + Remove Photo */}
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  ref={(el) => (fileInputRefs.current[srv.id] = el)}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleServiceImageUpload(srv.id, file);
                                    e.target.value = '';
                                  }}
                                />
                                <button
                                  type="button"
                                  disabled={uploadingServiceId === srv.id}
                                  onClick={() => fileInputRefs.current[srv.id]?.click()}
                                  className="px-3.5 py-1.5 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                                  <span>
                                    {uploadingServiceId === srv.id
                                      ? t.optimizingPhoto
                                      : srv.photoUrl
                                      ? t.replacePhotoBtn
                                      : t.uploadPhotoBtn}
                                  </span>
                                </button>

                                {srv.photoUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setServices((prev) =>
                                        prev.map((item) =>
                                          item.id === srv.id ? { ...item, photoUrl: '' } : item
                                        )
                                      );
                                      showToast(
                                        lang === 'es' ? 'Foto eliminada.' : 'Photo removed.'
                                      );
                                    }}
                                    className="px-3 py-1.5 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-[#B84A58] hover:bg-[#F3DCE0]/40 text-xs font-medium inline-flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>{t.deletePhotoBtn}</span>
                                  </button>
                                )}
                              </div>

                              {/* Optional Direct Image URL Input */}
                              <div className="relative max-w-md pt-0.5">
                                <Link2 className="w-3.5 h-3.5 text-[#8F887F] absolute left-3 top-2.5" />
                                <input
                                  type="url"
                                  value={srv.photoUrl.startsWith('data:') ? '' : srv.photoUrl}
                                  onChange={(e) => {
                                    const urlVal = e.target.value;
                                    setServices((prev) =>
                                      prev.map((item) =>
                                        item.id === srv.id ? { ...item, photoUrl: urlVal } : item
                                      )
                                    );
                                  }}
                                  placeholder={t.photoUrlPlaceholder}
                                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs text-[#222120] focus:outline-none focus:border-[#222120]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Inline Price Editor ($) */}
                          <div className="w-full md:w-32 shrink-0">
                            <label className="block text-[10px] uppercase tracking-wider text-[#6E685F] font-semibold mb-1">
                              {t.servicePriceLabel}
                            </label>
                            <div className="relative">
                              <DollarSign className="w-4 h-4 text-[#6E685F] absolute left-3 top-2.5" />
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
                                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-sm font-semibold text-[#222120] focus:outline-none focus:border-[#222120]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: CONDITIONS & 50% NON-REFUNDABLE DEPOSIT POLICIES           */}
          {/* ----------------------------------------------------------------- */}
          {adminTab === 'conditions' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#DDD6CC] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                    {t.conditionsHeaderTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C564E] mt-1">
                    {t.conditionsHeaderSub}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setServices((prev) =>
                      prev.map((item) => ({
                        ...item,
                        conditionsEn: DEFAULT_POLICY_EN,
                        conditionsEs: DEFAULT_POLICY_ES,
                      }))
                    );
                    showToast(
                      lang === 'es'
                        ? '¡Política del 50% no reembolsable aplicada a todos los servicios!'
                        : '50% non-refundable deposit policy applied to all services!'
                    );
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-xs font-medium inline-flex items-center gap-2 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <span>{t.applyAllPolicyBtn}</span>
                </button>
              </div>

              <div className="space-y-4">
                {services.map((srv) => {
                  const displayName = lang === 'es' ? srv.nameEs || srv.nameEn : srv.nameEn;
                  return (
                    <div
                      key={srv.id}
                      className="bg-white rounded-2xl border border-[#DDD6CC] p-5 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-semibold">
                            {CATEGORY_LABELS[srv.category]?.[lang] || srv.category}
                          </span>
                          <h4 className="font-serif-editorial text-xl font-semibold text-[#222120]">
                            {displayName} (${srv.price})
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#6E685F] font-semibold mb-1">
                            {t.conditionEnLabel}
                          </label>
                          <textarea
                            rows={2}
                            value={srv.conditionsEn ?? DEFAULT_POLICY_EN}
                            onChange={(e) => {
                              const val = e.target.value;
                              setServices((prev) =>
                                prev.map((item) =>
                                  item.id === srv.id ? { ...item, conditionsEn: val } : item
                                )
                              );
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs text-[#222120] focus:outline-none focus:border-[#222120]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#6E685F] font-semibold mb-1">
                            {t.conditionEsLabel}
                          </label>
                          <textarea
                            rows={2}
                            value={srv.conditionsEs ?? DEFAULT_POLICY_ES}
                            onChange={(e) => {
                              const val = e.target.value;
                              setServices((prev) =>
                                prev.map((item) =>
                                  item.id === srv.id ? { ...item, conditionsEs: val } : item
                                )
                              );
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs text-[#222120] focus:outline-none focus:border-[#222120]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: AGENDA, BLOCK HOURS & GOOGLE CALENDAR SYNC                 */}
          {/* ----------------------------------------------------------------- */}
          {adminTab === 'agenda' && (
            <div className="space-y-8">
              {/* Section A: Upcoming Client Reservations */}
              <div className="space-y-4">
                <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                  {t.upcomingApptsTitle}
                </h3>

                {sortedBookings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#DDD6CC] p-10 text-center">
                    <CalendarIcon className="w-10 h-10 text-[#B5AEA4] mx-auto mb-3" />
                    <h4 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                      {t.noBookingsTitle}
                    </h4>
                    <p className="text-sm text-[#6E685F] mt-1">{t.noBookingsSub}</p>
                  </div>
                ) : (
                  sortedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl border border-[#DDD6CC] p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#222120] text-[#F7F4EF] text-xs font-medium">
                            {formatEditorialDate(booking.date, lang)}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#F3DCE0] text-[#222120] text-xs font-semibold">
                            {booking.time}
                          </span>
                          <span className="text-xs text-[#6E685F] font-mono">
                            #{booking.refCode}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                            {booking.clientName}
                          </h4>
                          <p className="text-xs text-[#5C564E] mt-0.5 flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5 text-[#D49BA7]" />
                            <span>{booking.contact}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {booking.services.map((srv, idx) => (
                            <span
                              key={`${booking.id}-${idx}`}
                              className="px-3 py-1 rounded-lg bg-[#F7F4EF] border border-[#DDD6CC] text-xs font-medium text-[#222120]"
                            >
                              {lang === 'es' ? srv.nameEs || srv.nameEn : srv.nameEn} (${srv.price})
                            </span>
                          ))}
                          <span className="text-sm font-semibold text-[#222120] ml-1">
                            Total: ${booking.total} • 50%: ${Math.round(booking.total * 0.5)}
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
                          <span>{t.messageWhatsAppBtn}</span>
                        </a>

                        {confirmCancelId === booking.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setBookings((prev) => prev.filter((b) => b.id !== booking.id));
                                setConfirmCancelId(null);
                                showToast(
                                  lang === 'es'
                                    ? 'Cita cancelada y horario liberado.'
                                    : 'Appointment cancelled & slot reopened.'
                                );
                              }}
                              className="flex-1 px-3 py-2 rounded-full bg-[#B84A58] text-white text-xs font-medium"
                            >
                              {t.confirmFreeBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(null)}
                              className="px-3 py-2 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-xs"
                            >
                              {t.keepBtn}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(booking.id)}
                            className="px-4 py-2.5 rounded-full bg-[#F7F4EF] text-[#6E685F] hover:text-[#B84A58] hover:border-[#B84A58]/40 border border-[#DDD6CC] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.cancelSlotBtn}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Section B: Manual Friday & Saturday Slot Blocker */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#DDD6CC] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif-editorial text-2xl font-semibold text-[#222120]">
                      {t.manageHoursTitle}
                    </h3>
                    <p className="text-xs text-[#5C564E] mt-0.5">{t.manageHoursSub}</p>
                  </div>
                  <div className="w-full sm:w-64">
                    <label className="block text-[10px] uppercase tracking-wider text-[#6E685F] mb-1">
                      {t.blockNoteLabel}
                    </label>
                    <input
                      type="text"
                      value={blockReasonInput}
                      onChange={(e) => setBlockReasonInput(e.target.value)}
                      placeholder={t.blockNotePlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {upcomingStudioDates.map((dateKey) => (
                    <div
                      key={dateKey}
                      className="bg-white rounded-2xl border border-[#DDD6CC] p-5 shadow-2xs"
                    >
                      <h4 className="font-serif-editorial text-xl font-semibold text-[#222120] pb-3 mb-3 border-b border-[#EDEAE4]">
                        {formatEditorialDate(dateKey, lang)}
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
                                    ? `${t.bookedLabel}: ${info.booking.clientName}`
                                    : info.status === 'blocked'
                                    ? `${t.blockedLabel} (${info.block.reason || t.statusUnavailable})`
                                    : t.openForClients}
                                </p>
                              </div>

                              {info.status === 'booked' ? (
                                <span className="px-3 py-1 rounded-full bg-[#F3DCE0] text-[#222120] text-xs font-medium">
                                  {t.bookedLabel}
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
                                    showToast(`${t.unblockBtn}: ${slot.label}`);
                                  }}
                                  className="px-3.5 py-1.5 rounded-full bg-[#222120] text-white text-xs font-medium inline-flex items-center gap-1.5"
                                >
                                  <Unlock className="w-3 h-3 text-[#C5A059]" />
                                  <span>{t.unblockBtn}</span>
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
                                        reason: blockReasonInput || t.statusUnavailable,
                                      },
                                    ]);
                                    showToast(`${t.blockedLabel}: ${slot.label}`);
                                  }}
                                  className="px-3.5 py-1.5 rounded-full bg-white border border-[#DDD6CC] hover:border-[#222120] text-xs font-medium inline-flex items-center gap-1.5"
                                >
                                  <Lock className="w-3 h-3 text-[#6E685F]" />
                                  <span>{t.blockSlotBtn}</span>
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

              {/* Section C: Google Calendar & Catalog Webhook Sync */}
              <div className="bg-white rounded-2xl border border-[#DDD6CC] p-6 space-y-5 shadow-2xs">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
                    {t.googleSyncTag}
                  </span>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[#222120] mt-0.5">
                    {t.googleSyncTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C564E] mt-1 leading-relaxed">
                    {t.googleSyncDesc}
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#222120] mb-1.5">
                    {t.webhookUrlLabel}
                  </label>
                  <input
                    type="url"
                    value={gasWebhookUrl}
                    onChange={(e) => setGasWebhookUrl(e.target.value.trim())}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs sm:text-sm focus:outline-none focus:border-[#222120]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={!gasWebhookUrl || isSyncingGoogle}
                    onClick={() => fetchFromGoogleAppsScript(false)}
                    className={`px-5 py-2.5 rounded-full text-xs font-medium inline-flex items-center gap-2 border ${
                      gasWebhookUrl
                        ? 'bg-[#F7F4EF] text-[#222120] border-[#222120] hover:bg-[#EDEAE4]'
                        : 'bg-[#F7F4EF] text-[#9E978E] border-[#DDD6CC] cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGoogle ? 'animate-spin' : ''}`} />
                    <span>{t.pullGoogleBtn}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!gasWebhookUrl || isSyncingGoogle}
                    onClick={pushCatalogToGoogle}
                    className={`px-5 py-2.5 rounded-full text-xs font-medium inline-flex items-center gap-2 ${
                      gasWebhookUrl
                        ? 'bg-[#222120] text-[#F7F4EF] hover:bg-[#383634]'
                        : 'bg-[#CFC8BE] text-white cursor-not-allowed'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{t.pushGoogleBtn}</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-[#EDEAE4] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-serif-editorial text-lg font-semibold text-[#222120]">
                        {t.scriptBoxTitle}
                      </h4>
                      <p className="text-xs text-[#6E685F]">{t.scriptBoxSub}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await copyTextToClipboard(GOOGLE_APPS_SCRIPT_TEMPLATE);
                          showToast(
                            lang === 'es'
                              ? '¡Código de Google Apps Script copiado!'
                              : 'Google Apps Script code copied!'
                          );
                        }}
                        className="px-4 py-2 rounded-full bg-[#222120] text-[#F7F4EF] text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{t.copyScriptBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowScriptCode(!showScriptCode)}
                        className="px-4 py-2 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-xs font-medium text-[#222120]"
                      >
                        {showScriptCode ? t.hideCodeBtn : t.viewCodeBtn}
                      </button>
                    </div>
                  </div>

                  {showScriptCode && (
                    <pre className="p-4 rounded-xl bg-[#222120] text-[#F7F4EF] text-[11px] overflow-x-auto leading-relaxed">
                      {GOOGLE_APPS_SCRIPT_TEMPLATE}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ===================================================================== */}
      {/* SERVICE VISUAL LOOK, DETAILS & DEPOSIT POLICY MODAL                   */}
      {/* ===================================================================== */}
      {inspectService && (
        <div
          className="fixed inset-0 z-50 bg-[#222120]/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectServiceId(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#DDD6CC] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <ServiceLookIllustration
                type={inspectService.illustrationType}
                customPhotoUrl={inspectService.photoUrl}
                name={inspectService.name}
                lang={lang}
              />
              <button
                type="button"
                onClick={() => setInspectServiceId(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-[#DDD6CC] flex items-center justify-center text-[#222120] hover:bg-[#222120] hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
                    {CATEGORY_LABELS[inspectService.category]?.[lang] || inspectService.category}
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
                    {t.fullnessDramaLabel}
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
                    {t.techniqueCurlLabel}
                  </span>
                  <span className="font-medium text-[#222120]">{inspectService.curlStyle}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#EDEAE4]">
                  <span className="uppercase tracking-wider text-[#6E685F] block mb-0.5">
                    {t.sessionBlockModalLabel}
                  </span>
                  <span className="font-medium text-[#222120]">{inspectService.durationText}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#DDD6CC] text-xs text-[#222120]">
                <strong>{t.idealMatchLabel}</strong> {inspectService.idealFor}
              </div>

              {/* Service Booking Conditions (50% Non-Refundable Deposit) */}
              <div className="p-4 rounded-xl bg-[#F3DCE0]/45 border border-[#D49BA7]/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-[#222120]">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <span>{t.modalConditionsTitle}</span>
                </div>
                <p className="text-xs text-[#222120] leading-relaxed">
                  {inspectService.conditions}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInspectServiceId(null)}
                  className="px-5 py-3 rounded-full bg-[#F7F4EF] border border-[#DDD6CC] text-xs font-medium text-[#222120]"
                >
                  {t.closeBtn}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedServiceIds.includes(inspectService.id)) {
                      toggleServiceSelection(inspectService);
                    }
                    setInspectServiceId(null);
                  }}
                  className="flex-1 py-3 px-6 rounded-full bg-[#222120] text-[#F7F4EF] hover:bg-[#383634] text-xs uppercase tracking-[0.14em] font-medium transition-colors"
                >
                  {selectedServiceIds.includes(inspectService.id)
                    ? t.alreadyInSession
                    : `${t.addToAppointment} • $${inspectService.price}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EDITORIAL FOOTER WITH DISCREET PRIVATE PROFILE LOCK BUTTON            */}
      {/* ===================================================================== */}
      <footer className="bg-[#F7F4EF] border-t border-[#DDD6CC] py-10 px-4 text-center">
        <TinaStudioWordmark compact />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a
            href={STUDIO_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DDD6CC] text-[#222120] hover:border-[#222120] transition-all text-xs font-medium shadow-2xs"
          >
            <Instagram className="w-4 h-4 text-[#C5A059]" />
            <span>{STUDIO_INSTAGRAM_HANDLE}</span>
          </a>

          {/* Discreet Lock Button for Valentina's Private Profile */}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'admin' ? 'client' : 'admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent border border-[#DDD6CC]/80 text-[#7D766D] hover:text-[#222120] hover:border-[#222120] transition-all text-[11px] font-medium"
          >
            <Lock className="w-3 h-3 text-[#C5A059]" />
            <span>{mode === 'admin' ? t.returnPublicBtn : t.privateProfileBtn}</span>
          </button>
        </div>

        <p className="text-xs text-[#6E685F] mt-4">{t.footerHours}</p>
        <p className="text-[11px] text-[#8F887F] mt-1">{t.footerDeposit}</p>
      </footer>
    </div>
  );
}
