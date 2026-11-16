import React, { useState, useEffect } from 'react';
import {
  Clock, Instagram, Lock, Globe, ChevronRight,
  Camera, Check, Image as ImageIcon, ShieldCheck, Calendar, Info
} from 'lucide-react';

const DEFAULT_SERVICES = {
  lashes: [
    { id: 'l1', name: 'Lifting', price: 50, image: '' },
    { id: 'l2', name: 'Classic', price: 60, image: '' },
    { id: 'l3', name: 'Hybrid', price: 65, image: '' },
    { id: 'l4', name: 'Wispy', price: 65, image: '' },
    { id: 'l5', name: 'Wet Set', price: 65, image: '' },
    { id: 'l6', name: 'Hawaiian', price: 70, image: '' },
    { id: 'l7', name: 'Egypt set', price: 70, image: '' },
    { id: 'l8', name: 'Volume', price: 80, image: '' },
    { id: 'l9', name: 'Mega Volume', price: 90, image: '' },
    { id: 'l10', name: 'Wispy Volume', price: 85, image: '' },
    { id: 'l11', name: 'Refill', price: 60, image: '' },
    { id: 'l12', name: 'Remove', price: 40, image: '' },
  ],
  eyebrow: [
    { id: 'e1', name: 'Lamination', price: 20, image: '' },
    { id: 'e2', name: 'Wax + mapping', price: 35, image: '' },
  ],
  waxing: [
    { id: 'w1', name: 'Arm', price: 15, image: '' },
    { id: 'w2', name: 'Underarm', price: 15, image: '' },
    { id: 'w3', name: 'Lips', price: 5, image: '' },
    { id: 'w4', name: 'Traditional bikini', price: 20, image: '' },
    { id: 'w5', name: 'Extended bikini', price: 30, image: '' },
    { id: 'w6', name: 'Half leg', price: 25, image: '' },
    { id: 'w7', name: 'Full leg', price: 35, image: '' },
  ],
  facial: [
    { id: 'f1', name: 'Facial with extractions (40 min)', price: 40, image: '' },
  ],
  nails: [
    { id: 'n1', name: 'Acrylic Full Set', price: 45, image: '' },
    { id: 'n2', name: 'Soft Gel Extensions', price: 40, image: '' },
  ],
};

const DEFAULT_POLICY = {
  EN: 'A 50% non-refundable deposit is required via Instagram DM to secure your appointment.',
  ES: 'Se requiere un depósito del 50% no reembolsable vía Instagram DM para asegurar tu cita.',
};

const TinaLogo = () => (
  <img 
    src="/tina studio (1).png" 
    alt="TINA STUDIO by Valentina Arraiz" 
    className="w-full max-w-[210px] md:max-w-[260px] h-auto object-contain mx-auto my-1 transition-all"
  />
);

export default function App() {
  const [lang, setLang] = useState('EN');
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientData, setClientData] = useState({ name: '', contact: '', notes: '' });
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Estados guardados en la memoria del dispositivo (localStorage)
  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('tina_catalog_v2');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });
  const [nailsEnabled, setNailsEnabled] = useState(() => {
    return localStorage.getItem('tina_nails_enabled') === 'true';
  });
  const [policyText, setPolicyText] = useState(() => {
    const saved = localStorage.getItem('tina_policy_v2');
    return saved ? JSON.parse(saved) : DEFAULT_POLICY;
  });
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('tina_admin_pin') || '2026';
  });
  const [scriptUrl, setScriptUrl] = useState(() => {
    return localStorage.getItem('tina_script_url') || '';
  });

  // Estados del Panel Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [adminTab, setAdminTab] = useState('catalog');
  const [saveBanner, setSaveBanner] = useState(false);

  // Auto-guardado
  useEffect(() => localStorage.setItem('tina_catalog_v2', JSON.stringify(catalog)), [catalog]);
  useEffect(() => localStorage.setItem('tina_nails_enabled', String(nailsEnabled)), [nailsEnabled]);
  useEffect(() => localStorage.setItem('tina_policy_v2', JSON.stringify(policyText)), [policyText]);

  const triggerSavedBanner = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const t = {
    EN: {
      services: 'Select Services',
      datetime: 'Date & Time',
      summary: 'Summary',
      next: 'Next Step',
      back: 'Back',
      total: 'Estimated Total',
      depositDue: '50% Non-Refundable Deposit',
      acceptPolicy: 'I accept the 50% non-refundable deposit policy',
      bookViaDM: 'Book via Instagram DM',
      dmNote: 'Your booking details will be copied automatically. Paste them in @tinastudioo DM to confirm.',
      copied: 'Details copied! Opening Instagram...',
      privateProfile: 'Private Profile',
      adminPanel: "Valentina's Agenda",
      enterPin: 'Enter Security PIN',
      logout: 'Exit Private Profile',
      tabCatalog: 'Prices & Photos',
      tabSettings: 'Policies, PIN & Sync',
      nailsToggle: 'Enable Nails Category',
      uploadPhoto: 'Upload Photo',
      changePhoto: 'Change Photo',
      savedMsg: 'Changes saved successfully',
      changePinTitle: 'Security PIN (4 digits)',
      updatePinBtn: 'Update PIN',
    },
    ES: {
      services: 'Seleccionar Servicios',
      datetime: 'Fecha y Hora',
      summary: 'Resumen',
      next: 'Siguiente',
      back: 'Volver',
      total: 'Total Estimado',
      depositDue: 'Depósito 50% No Reembolsable',
      acceptPolicy: 'Acepto la política de depósito del 50% no reembolsable',
      bookViaDM: 'Reservar por Instagram DM',
      dmNote: 'Los datos se copiarán automáticamente. Pégalos en el DM de @tinastudioo para confirmar.',
      copied: '¡Datos copiados! Abriendo Instagram...',
      privateProfile: 'Perfil Privado',
      adminPanel: 'Agenda de Valentina',
      enterPin: 'Ingresa el PIN de Seguridad',
      logout: 'Salir del Perfil Privado',
      tabCatalog: 'Precios y Fotos',
      tabSettings: 'Condiciones, PIN y Sync',
      nailsToggle: 'Activar categoría de Uñas',
      uploadPhoto: 'Subir Foto',
      changePhoto: 'Cambiar Foto',
      savedMsg: 'Cambios guardados exitosamente',
      changePinTitle: 'PIN de Seguridad (4 dígitos)',
      updatePinBtn: 'Actualizar PIN',
    },
  };

  const handleServiceToggle = (service) => {
    setCart((prev) =>
      prev.find((item) => item.id === service.id)
        ? prev.filter((item) => item.id !== service.id)
        : [...prev, service]
    );
  };

  const totalCart = cart.reduce((acc, curr) => acc + Number(curr.price || 0), 0);

  const handleBookViaInstagram = async (e) => {
    if (!policyAccepted) {
      e.preventDefault();
      return;
    }
    const servicesList = cart.map((s) => `${s.name} ($${s.price})`).join(', ');
    const message = [
      `Hi Tina Studio! I'd like to book an appointment:`,
      `• Name: ${clientData.name}`,
      `• Instagram: ${clientData.contact}`,
      `• Services: ${servicesList}`,
      `• Date & Time: ${date} at ${time}`,
      `• Total: $${totalCart} (50% Deposit: $${(totalCart / 2).toFixed(2)})`,
      clientData.notes ? `• Notes: ${clientData.notes}` : null,
      `I accept the 50% non-refundable deposit policy.`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(message);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    } catch (_) { }

    if (scriptUrl) {
      const [year, month, day] = date.split('-').map(Number);
      const hour = time === '9:00 AM' ? 9 : time === '12:30 PM' ? 12 : 16;
      const minute = time === '12:30 PM' ? 30 : 0;
      const startISO = new Date(year, month - 1, day, hour, minute).toISOString();

      fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientData.name,
          contact: clientData.contact,
          service: servicesList,
          total: totalCart,
          notes: clientData.notes,
          startISO,
        }),
      }).catch(() => {});
    }
  };

  const handlePriceChange = (category, id, newPrice) => {
    setCatalog((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, price: Number(newPrice) || 0 } : item
      ),
    }));
    triggerSavedBanner();
  };

  const handlePhotoUpload = (category, id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 500;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        setCatalog((prev) => ({
          ...prev,
          [category]: prev[category].map((item) =>
            item.id === id ? { ...item, image: compressedBase64 } : item
          ),
        }));
        triggerSavedBanner();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAdminLogin = () => {
    if (pinInput === adminPin) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 450);
      setPinInput('');
    }
  };

  // --- VISTA PÚBLICA DE CLIENTAS (MOBILE & WEB) ---
  const renderClientView = () => (
    <div className="flex flex-col min-h-screen bg-[#F7F4EF] text-[#222120] font-sans pb-24 md:pb-8">
      
      {/* Header Responsivo */}
      <header className="sticky top-0 z-10 bg-[#F7F4EF]/90 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#DDD6CC] shadow-sm">
        <div className="w-12" />
        <TinaLogo />
        <button
          onClick={() => setLang(lang === 'EN' ? 'ES' : 'EN')}
          className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest uppercase border border-[#DDD6CC] bg-white w-12 h-10 hover:border-[#C5A059] transition-all rounded-sm shadow-sm"
        >
          <Globe size={14} /> {lang}
        </button>
      </header>

      {/* Contenedor Principal Adaptable */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8">
        
        {/* Indicador de Pasos */}
        <div className="flex items-center justify-between mb-8 md:mb-10 px-2 text-xs md:text-sm font-semibold tracking-widest uppercase text-gray-400">
          <span className={step >= 1 ? 'text-[#C5A059]' : ''}>1. {t[lang].services}</span>
          <span className={step >= 2 ? 'text-[#C5A059]' : ''}>2. {t[lang].datetime}</span>
          <span className={step >= 3 ? 'text-[#C5A059]' : ''}>3. {t[lang].summary}</span>
        </div>

        {/* Paso 1: Servicios */}
        {step === 1 && (
          <div className="space-y-10">
            {Object.entries(catalog).map(([category, items]) => {
              if (category === 'nails' && !nailsEnabled) return null;
              return (
                <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl md:text-2xl font-serif mb-4 md:mb-6 uppercase tracking-widest text-[#C5A059] border-b border-[#DDD6CC] pb-2 flex items-center justify-between">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {items.map((item) => {
                      const selected = Boolean(cart.find((c) => c.id === item.id));
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleServiceToggle(item)}
                          className={`flex justify-between items-center p-3 md:p-4 border text-left transition-all rounded-sm shadow-sm hover:shadow-md ${
                            selected
                              ? 'border-[#C5A059] bg-[#C5A059]/10'
                              : 'border-[#DDD6CC] bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 md:w-16 md:h-16 object-cover border border-[#DDD6CC] shrink-0 rounded-sm"
                              />
                            )}
                            <span className="font-medium text-sm md:text-base leading-tight">{item.name}</span>
                          </div>
                          <span className="font-serif italic text-lg md:text-xl text-[#C5A059]">${item.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paso 2: Fecha, Hora y Datos */}
        {step === 2 && (
          <div className="space-y-6 bg-white p-5 md:p-8 border border-[#DDD6CC] shadow-sm rounded-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-serif uppercase tracking-widest">{t[lang].datetime}</h2>
              <div className="inline-flex items-center gap-2 mt-2 bg-[#F7F4EF] px-3 py-1 text-xs md:text-sm text-[#C5A059] font-medium border border-[#DDD6CC] rounded-full">
                <Info size={14} /> {lang === 'EN' ? 'Strictly Friday & Saturday' : 'Estrictamente Viernes y Sábados'}
              </div>
            </div>

            <input
              type="date"
              value={date}
              className="w-full p-4 border border-[#DDD6CC] bg-[#F7F4EF] outline-none focus:border-[#C5A059] text-base md:text-lg transition-colors cursor-pointer rounded-sm"
              onChange={(e) => {
                const d = new Date(e.target.value);
                const day = d.getUTCDay();
                if (day !== 5 && day !== 6) {
                  alert(lang === 'EN' ? 'Please select a Friday or Saturday.' : 'Por favor selecciona viernes o sábado.');
                  setDate('');
                } else {
                  setDate(e.target.value);
                }
              }}
            />

            {date && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 pt-2">
                {['9:00 AM', '12:30 PM', '4:00 PM'].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`p-4 border transition-all text-base md:text-lg font-medium rounded-sm shadow-sm ${
                      time === slot
                        ? 'bg-[#222120] text-white border-[#222120] scale-[1.02]'
                        : 'border-[#DDD6CC] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Clock size={18} className="inline mr-2 mb-0.5" /> {slot}
                  </button>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-[#DDD6CC] space-y-4">
              <input
                type="text"
                value={clientData.name}
                placeholder={lang === 'EN' ? 'Full Name' : 'Nombre Completo'}
                className="w-full p-4 border border-[#DDD6CC] text-base outline-none focus:border-[#C5A059] rounded-sm"
                onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
              />
              <input
                type="text"
                value={clientData.contact}
                placeholder="Instagram User (e.g. @maria)"
                className="w-full p-4 border border-[#DDD6CC] text-base outline-none focus:border-[#C5A059] rounded-sm"
                onChange={(e) => setClientData({ ...clientData, contact: e.target.value })}
              />
              <textarea
                value={clientData.notes}
                placeholder={lang === 'EN' ? 'Notes (Optional)' : 'Notas (Opcional)'}
                className="w-full p-4 border border-[#DDD6CC] text-base outline-none focus:border-[#C5A059] rounded-sm resize-none"
                rows="3"
                onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Paso 3: Resumen y Política */}
        {step === 3 && (
          <div className="bg-white p-5 md:p-8 border border-[#DDD6CC] space-y-6 shadow-sm rounded-sm animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl md:text-3xl font-serif text-center mb-6">{t[lang].summary}</h2>
            
            <div className="bg-[#F7F4EF] p-4 md:p-6 border border-[#DDD6CC] rounded-sm space-y-3 text-sm md:text-base">
              <p><strong>{lang === 'EN' ? 'Client:' : 'Clienta:'}</strong> {clientData.name}</p>
              <p><strong>Instagram:</strong> {clientData.contact || '—'}</p>
              <p><strong>{lang === 'EN' ? 'Date & Time:' : 'Fecha y Hora:'}</strong> {date} — {time}</p>
              <div className="pt-2 border-t border-[#DDD6CC] mt-2">
                <strong>{lang === 'EN' ? 'Services:' : 'Servicios:'}</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {cart.map((c) => (
                    <li key={c.id}>{c.name} — ${c.price}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2 px-2">
              <div className="flex justify-between text-xl md:text-2xl font-serif border-b border-gray-100 pb-2">
                <span>{t[lang].total}:</span>
                <span>${totalCart}</span>
              </div>
              <div className="flex justify-between text-base md:text-lg text-[#C5A059] font-bold">
                <span>{t[lang].depositDue}:</span>
                <span>${(totalCart / 2).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-[#F3DCE0]/30 p-4 border border-[#F3DCE0] flex items-start gap-3 rounded-sm cursor-pointer" onClick={() => setPolicyAccepted(!policyAccepted)}>
              <input
                type="checkbox"
                className="mt-1 w-6 h-6 accent-[#222120] shrink-0"
                checked={policyAccepted}
                onChange={() => {}}
              />
              <div className="select-none">
                <span className="font-semibold text-[#222120] block mb-1 text-sm md:text-base">
                  {policyText[lang]}
                </span>
                <span className="underline text-xs md:text-sm text-gray-600">{t[lang].acceptPolicy}</span>
              </div>
            </div>

            {copiedToast && (
              <div className="p-3 md:p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm md:text-base text-center font-medium rounded-sm animate-in fade-in slide-in-from-top-2">
                <Check size={18} className="inline mr-1 mb-0.5" /> {t[lang].copied}
              </div>
            )}

            <a
              href="https://www.instagram.com/tinastudioo/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleBookViaInstagram}
              className={`w-full flex items-center justify-center p-4 md:p-5 text-white uppercase tracking-widest font-bold text-sm md:text-base transition-all rounded-sm shadow-md ${
                policyAccepted ? 'bg-[#222120] hover:bg-black hover:scale-[1.02]' : 'bg-gray-300 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Instagram size={20} className="mr-2" /> {t[lang].bookViaDM}
            </a>
            <p className="text-xs md:text-sm text-center text-gray-500 mt-2 px-4">{t[lang].dmNote}</p>
          </div>
        )}
      </main>

      {/* Footer Público (Siempre al fondo) */}
      <footer className="mt-auto py-8 border-t border-[#DDD6CC] flex flex-col items-center justify-center gap-4 text-xs md:text-sm text-gray-500 bg-[#F7F4EF]">
        <a
          href="https://www.instagram.com/tinastudioo/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-[#C5A059] transition-colors font-medium"
        >
          <Instagram size={18} /> @tinastudioo
        </a>
        <button
          onClick={() => setShowPinModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 border border-[#DDD6CC] bg-white hover:border-[#222120] hover:bg-[#222120] hover:text-white transition-all rounded-sm shadow-sm"
        >
          <Lock size={14} /> {t[lang].privateProfile}
        </button>
      </footer>

      {/* === BARRA INFERIOR FLOTANTE PARA NAVEGACIÓN EN CELULAR (Sticky Bottom Bar) === */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#DDD6CC] p-4 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 md:relative md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:max-w-3xl md:mx-auto md:mb-12">
          
          <div className="w-1/3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="w-full py-3 border border-[#222120] uppercase tracking-wider text-xs md:text-sm font-bold hover:bg-[#222120] hover:text-white transition-all rounded-sm"
              >
                {t[lang].back}
              </button>
            )}
          </div>

          <div className="w-[60%]">
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(step + 1); }}
              disabled={cart.length === 0 || (step === 2 && (!date || !time || !clientData.name))}
              className="w-full py-3 bg-[#222120] text-white uppercase tracking-wider text-xs md:text-sm font-bold disabled:opacity-40 disabled:scale-100 flex items-center justify-center transition-all hover:bg-black hover:shadow-md rounded-sm"
            >
              {t[lang].next} <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // --- PANEL PRIVADO DE VALENTINA (MOBILE & WEB) ---
  const renderAdminView = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-[#F7F4EF] min-h-screen text-[#222120] font-sans pb-24">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-[#DDD6CC]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#222120] flex items-center gap-2">
            <Lock size={20} className="text-[#C5A059]" /> {t[lang].adminPanel}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configuración en vivo guardada en tu dispositivo</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <button
            onClick={() => setLang(lang === 'EN' ? 'ES' : 'EN')}
            className="flex-1 md:flex-none text-xs font-bold border border-[#DDD6CC] bg-white px-4 py-3 rounded-sm shadow-sm"
          >
            {lang}
          </button>
          <button
            onClick={() => setIsAdmin(false)}
            className="flex-2 md:flex-none w-full text-xs font-bold tracking-wider uppercase text-white bg-red-800 px-6 py-3 rounded-sm shadow-sm hover:bg-red-900"
          >
            {t[lang].logout}
          </button>
        </div>
      </header>

      {saveBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-900 text-white rounded-full shadow-lg text-sm md:text-base flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
          <Check size={18} /> {t[lang].savedMsg}
        </div>
      )}

      {/* Pestañas Administrativas */}
      <div className="flex flex-col md:flex-row gap-2 mb-8">
        <button
          onClick={() => setAdminTab('catalog')}
          className={`flex-1 py-4 text-xs md:text-sm uppercase tracking-widest font-bold border rounded-sm transition-all ${
            adminTab === 'catalog'
              ? 'bg-[#222120] text-white border-[#222120] shadow-md'
              : 'bg-white text-[#222120] border-[#DDD6CC] hover:bg-gray-50'
          }`}
        >
          <ImageIcon size={16} className="inline mr-2 mb-0.5" /> {t[lang].tabCatalog}
        </button>
        <button
          onClick={() => setAdminTab('settings')}
          className={`flex-1 py-4 text-xs md:text-sm uppercase tracking-widest font-bold border rounded-sm transition-all ${
            adminTab === 'settings'
              ? 'bg-[#222120] text-white border-[#222120] shadow-md'
              : 'bg-white text-[#222120] border-[#DDD6CC] hover:bg-gray-50'
          }`}
        >
          <ShieldCheck size={16} className="inline mr-2 mb-0.5" /> {t[lang].tabSettings}
        </button>
      </div>

      {adminTab === 'catalog' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <label className="flex items-center justify-between p-5 bg-white border border-[#DDD6CC] cursor-pointer rounded-sm shadow-sm hover:shadow-md transition-shadow">
            <div>
              <span className="font-bold text-base md:text-lg block">{t[lang].nailsToggle}</span>
              <span className="text-xs text-gray-500">Muestra u oculta la categoría en el menú principal.</span>
            </div>
            <input
              type="checkbox"
              checked={nailsEnabled}
              onChange={(e) => {
                setNailsEnabled(e.target.checked);
                triggerSavedBanner();
              }}
              className="w-6 h-6 accent-[#C5A059] shrink-0"
            />
          </label>

          {Object.entries(catalog).map(([category, items]) => (
            <div key={category} className="bg-white border border-[#DDD6CC] p-4 md:p-6 rounded-sm shadow-sm">
              <h2 className="text-xl md:text-2xl font-serif uppercase tracking-widest text-[#C5A059] mb-4 md:mb-6 border-b border-[#DDD6CC] pb-2">
                {category}
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#F7F4EF] border border-[#DDD6CC] rounded-sm">
                    
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover border border-[#DDD6CC] rounded-sm bg-white"
                        />
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-[#DDD6CC] flex items-center justify-center text-gray-300 rounded-sm">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <span className="font-bold text-base md:text-lg">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex-1 md:flex-none flex items-center bg-white border border-[#DDD6CC] px-3 py-2 md:py-3 rounded-sm">
                        <span className="text-sm md:text-base text-gray-500 mr-1 font-serif">$</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handlePriceChange(category, item.id, e.target.value)}
                          className="w-16 md:w-20 text-base md:text-lg font-bold outline-none bg-transparent"
                        />
                      </div>

                      <label className="flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 bg-[#222120] text-white text-xs md:text-sm font-bold uppercase tracking-wide hover:bg-black rounded-sm transition-colors text-center">
                        <Camera size={16} className="shrink-0" />
                        <span>{item.image ? t[lang].changePhoto : t[lang].uploadPhoto}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(category, item.id, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-[#DDD6CC] p-5 md:p-8 space-y-4 rounded-sm shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl mb-2 border-b border-gray-100 pb-2">
              {lang === 'EN' ? 'Booking Conditions (50% Deposit)' : 'Condiciones de Reserva (Depósito 50%)'}
            </h2>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-[#C5A059] tracking-wider">English Message</label>
              <textarea
                rows="2"
                value={policyText.EN}
                onChange={(e) => { setPolicyText({ ...policyText, EN: e.target.value }); triggerSavedBanner(); }}
                className="w-full p-4 border border-[#DDD6CC] text-sm md:text-base bg-[#F7F4EF] focus:bg-white outline-none rounded-sm transition-colors"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-[#C5A059] tracking-wider mt-4">Mensaje en Español</label>
              <textarea
                rows="2"
                value={policyText.ES}
                onChange={(e) => { setPolicyText({ ...policyText, ES: e.target.value }); triggerSavedBanner(); }}
                className="w-full p-4 border border-[#DDD6CC] text-sm md:text-base bg-[#F7F4EF] focus:bg-white outline-none rounded-sm transition-colors"
              />
            </div>
          </div>

          <div className="bg-white border border-[#DDD6CC] p-5 md:p-8 space-y-4 rounded-sm shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl flex items-center gap-2 border-b border-gray-100 pb-2">
              <ShieldCheck size={20} className="text-[#C5A059]" /> {t[lang].changePinTitle}
            </h2>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Nuevo PIN (Ej: 4820)"
                className="flex-1 p-4 border border-[#DDD6CC] text-base md:text-lg tracking-[0.5em] text-center md:text-left bg-[#F7F4EF] focus:bg-white outline-none rounded-sm"
              />
              <button
                onClick={() => {
                  if (newPin.length === 4) {
                    setAdminPin(newPin);
                    localStorage.setItem('tina_admin_pin', newPin);
                    setNewPin('');
                    triggerSavedBanner();
                  } else {
                    alert(lang === 'EN' ? 'PIN must be 4 digits' : 'El PIN debe tener 4 números');
                  }
                }}
                className="px-6 py-4 bg-[#222120] text-white text-sm md:text-base uppercase tracking-wider font-bold rounded-sm hover:bg-black transition-colors"
              >
                {t[lang].updatePinBtn}
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#DDD6CC] p-5 md:p-8 space-y-4 rounded-sm shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl flex items-center gap-2 border-b border-gray-100 pb-2">
              <Calendar size={20} className="text-[#C5A059]" /> Google Calendar Sync
            </h2>
            <p className="text-sm text-gray-500">Pega aquí el enlace del script de Google para habilitar las alarmas automáticas al celular de Valentina.</p>
            <input
              type="text"
              value={scriptUrl}
              onChange={(e) => {
                setScriptUrl(e.target.value);
                localStorage.setItem('tina_script_url', e.target.value);
                triggerSavedBanner();
              }}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full p-4 border border-[#DDD6CC] text-sm md:text-base bg-[#F7F4EF] focus:bg-white outline-none rounded-sm transition-colors font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {!isAdmin ? renderClientView() : renderAdminView()}

      {/* Modal de Validación de PIN (Bloqueo Total) */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className={`bg-white p-6 md:p-10 max-w-sm w-full border-t-4 border-[#C5A059] rounded-sm shadow-2xl transition-transform ${pinError ? 'translate-x-2 md:translate-x-4' : ''}`}>
            
            <div className="text-center mb-8">
              <ShieldCheck size={32} className="mx-auto text-[#C5A059] mb-3" />
              <h3 className="font-serif text-xl md:text-2xl">{t[lang].enterPin}</h3>
            </div>
            
            <div className="flex justify-center mb-8 text-3xl md:text-4xl tracking-[0.5em] font-mono border-b-2 border-[#222120] pb-3 text-[#222120]">
              {pinInput.padEnd(4, '•').slice(0, 4)}
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => pinInput.length < 4 && setPinInput(pinInput + num)}
                  className="p-5 md:p-6 bg-[#F7F4EF] hover:bg-[#DDD6CC] font-bold text-xl md:text-2xl rounded-sm transition-colors active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button onClick={() => setPinInput('')} className="p-5 md:p-6 text-red-600 font-bold text-xl md:text-2xl rounded-sm hover:bg-red-50 active:scale-95">
                C
              </button>
              <button
                onClick={() => pinInput.length < 4 && setPinInput(pinInput + '0')}
                className="p-5 md:p-6 bg-[#F7F4EF] hover:bg-[#DDD6CC] font-bold text-xl md:text-2xl rounded-sm transition-colors active:scale-95"
              >
                0
              </button>
              <button onClick={handleAdminLogin} className="p-5 md:p-6 bg-[#222120] text-[#C5A059] hover:text-white font-bold text-2xl md:text-3xl rounded-sm transition-colors active:scale-95 flex items-center justify-center">
                →
              </button>
            </div>

            <button
              onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
              className="w-full text-center text-xs md:text-sm uppercase tracking-widest font-bold text-gray-400 hover:text-gray-800 transition-colors"
            >
              {lang === 'EN' ? 'Cancel / Go Back' : 'Cancelar / Volver'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
