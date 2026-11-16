import React, { useState } from 'react';
import { Calendar, Clock, Instagram, Lock, Globe, ChevronRight, CheckCircle2, Plus, Trash2 } from 'lucide-react';

// --- DATOS DEL CATÁLOGO ---
const initialServices = {
  lashes: [
    { id: 'l1', name: 'Lifting', price: 50 },
    { id: 'l2', name: 'Classic', price: 60 },
    { id: 'l3', name: 'Hybrid', price: 65 },
    { id: 'l4', name: 'Wispy', price: 65 },
    { id: 'l5', name: 'Wet Set', price: 65 },
    { id: 'l6', name: 'Hawaiian', price: 70 },
    { id: 'l7', name: 'Egypt set', price: 70 },
    { id: 'l8', name: 'Volume', price: 80 },
    { id: 'l9', name: 'Mega Volume', price: 90 }, // Actualizado
    { id: 'l10', name: 'Wispy Volume', price: 85 }, // Actualizado
    { id: 'l11', name: 'Refill', price: 60 }, // Actualizado
    { id: 'l12', name: 'Remove', price: 40 },
  ],
  eyebrow: [
    { id: 'e1', name: 'Lamination', price: 20 },
    { id: 'e2', name: 'Wax + mapping', price: 35 },
    // Brow tint (henna) eliminado
  ],
  waxing: [
    { id: 'w1', name: 'Arm', price: 15 },
    { id: 'w2', name: 'Underarm', price: 15 },
    { id: 'w3', name: 'Lips', price: 5 },
    { id: 'w4', name: 'Traditional bikini', price: 20 },
    { id: 'w5', name: 'Extended bikini', price: 30 },
    { id: 'w6', name: 'Half leg', price: 25 },
    { id: 'w7', name: 'Full leg', price: 35 },
  ],
  facial: [
    { id: 'f1', name: 'Facial with extractions (40 min)', price: 40 },
  ],
  nails: [
    // Ocultos por defecto
    { id: 'n1', name: 'Acrylic Full Set', price: 45 },
  ]
};

const TinaLogo = () => (
  <img 
    src="/logo.png" 
    alt="TINA STUDIO by Valentina Arraiz" 
    className="h-16 md:h-20 w-auto object-contain mx-auto"
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
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [nailsEnabled, setNailsEnabled] = useState(false);
  const [catalog, setCatalog] = useState(initialServices);

  // Traducciones
  const t = {
    EN: {
      book: 'Book Appointment',
      services: 'Select Services',
      datetime: 'Date & Time',
      details: 'Your Details',
      summary: 'Summary',
      next: 'Next Step',
      back: 'Back',
      cartEmpty: 'Select at least one service',
      total: 'Estimated Total',
      policy: 'A 50% non-refundable deposit is required to secure this booking.',
      acceptPolicy: 'I accept the 50% non-refundable deposit policy',
      bookViaDM: 'Book via Instagram DM',
      dmNote: 'We will redirect you to Instagram. Send us the generated message to confirm your deposit.',
      privateProfile: 'Private Profile',
      adminPanel: 'Valentina\'s Agenda',
      enterPin: 'Enter PIN to access',
      logout: 'Logout',
      settings: 'Settings & Prices',
      nailsToggle: 'Enable Nails Category'
    },
    ES: {
      book: 'Reservar Cita',
      services: 'Seleccionar Servicios',
      datetime: 'Fecha y Hora',
      details: 'Tus Datos',
      summary: 'Resumen',
      next: 'Siguiente',
      back: 'Volver',
      cartEmpty: 'Selecciona al menos un servicio',
      total: 'Total Estimado',
      policy: 'Se requiere un depósito del 50% no reembolsable para asegurar la cita.',
      acceptPolicy: 'Acepto la política de depósito del 50% no reembolsable',
      bookViaDM: 'Reservar por Instagram DM',
      dmNote: 'Te redirigiremos a Instagram. Envíanos el mensaje generado para confirmar tu depósito.',
      privateProfile: 'Perfil Privado',
      adminPanel: 'Agenda de Valentina',
      enterPin: 'Ingresa el PIN para acceder',
      logout: 'Cerrar Sesión',
      settings: 'Ajustes y Precios',
      nailsToggle: 'Habilitar categoría de Uñas'
    }
  };

  const handleServiceToggle = (service) => {
    setCart(prev => 
      prev.find(item => item.id === service.id)
        ? prev.filter(item => item.id !== service.id)
        : [...prev, service]
    );
  };

  const totalCart = cart.reduce((acc, curr) => acc + curr.price, 0);

  const generateMessage = () => {
    const servicesList = cart.map(s => s.name).join(', ');
    const txt = `Hi Tina Studio! 🤎 I'd like to book an appointment.\n\n👤 Name: ${clientData.name}\n📱 Contact: ${clientData.contact}\n✨ Services: ${servicesList}\n🗓 Date: ${date}\n⏰ Time: ${time}\n📝 Notes: ${clientData.notes || 'None'}\n💳 Total: $${totalCart}\n\nI agree to the 50% non-refundable deposit. Please send me the payment details!`;
    return encodeURIComponent(txt);
  };

  const handleAdminLogin = () => {
    if (pin === '2026') {
      setIsAdmin(true);
      setShowPinModal(false);
      setPin('');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
      setPin('');
    }
  };

  // VISTAS DEL CLIENTE
  const renderClientView = () => (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-[#F7F4EF] min-h-screen text-[#222120] font-sans">
      <header className="flex items-center justify-between py-4 mb-6 border-b border-[#DDD6CC]">
        <div className="w-8"></div>
        <TinaLogo />
        <button 
          onClick={() => setLang(lang === 'EN' ? 'ES' : 'EN')}
          className="flex items-center gap-1 text-sm font-semibold tracking-widest uppercase hover:text-[#C5A059] transition-colors"
        >
          <Globe size={16} /> {lang}
        </button>
      </header>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8 text-xs font-semibold tracking-widest uppercase text-gray-400">
        <span className={step >= 1 ? 'text-[#222120]' : ''}>1. {t[lang].services}</span>
        <span className={step >= 2 ? 'text-[#222120]' : ''}>2. {t[lang].datetime}</span>
        <span className={step >= 3 ? 'text-[#222120]' : ''}>3. {t[lang].summary}</span>
      </div>

      {/* Paso 1: Servicios */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {Object.entries(catalog).map(([category, items]) => {
            if (category === 'nails' && !nailsEnabled) return null;
            return (
              <div key={category}>
                <h2 className="text-2xl font-serif mb-4 uppercase tracking-widest text-[#C5A059] border-b border-[#DDD6CC] pb-2">
                  {category}
                </h2>
                <div className="grid gap-3">
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleServiceToggle(item)}
                      className={`flex justify-between items-center p-4 border transition-all duration-300 ${
                        cart.find(c => c.id === item.id) 
                          ? 'border-[#C5A059] bg-[#C5A059]/10' 
                          : 'border-[#DDD6CC] bg-white hover:border-gray-400'
                      }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="font-serif italic">${item.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paso 2: Fecha y Hora */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 bg-white p-6 border border-[#DDD6CC]">
          <h2 className="text-xl font-serif uppercase tracking-widest text-center">{t[lang].datetime}</h2>
          <p className="text-center text-sm text-gray-500 italic">Friday & Saturday Only</p>
          
          <input 
            type="date" 
            className="w-full p-4 border border-[#DDD6CC] bg-[#F7F4EF] outline-none focus:border-[#C5A059]"
            onChange={(e) => {
              const d = new Date(e.target.value);
              const day = d.getUTCDay();
              if (day !== 5 && day !== 6) {
                alert(lang === 'EN' ? 'Please select a Friday or Saturday.' : 'Por favor selecciona viernes o sábado.');
                e.target.value = '';
                setDate('');
              } else {
                setDate(e.target.value);
              }
            }}
          />

          {date && (
            <div className="grid grid-cols-1 gap-3 pt-4">
              {['9:00 AM', '12:30 PM', '4:00 PM'].map(tSlot => (
                <button
                  key={tSlot}
                  onClick={() => setTime(tSlot)}
                  className={`p-4 border transition-colors ${time === tSlot ? 'bg-[#222120] text-white border-[#222120]' : 'border-[#DDD6CC] bg-white hover:bg-gray-50'}`}
                >
                  <Clock size={16} className="inline mr-2" /> {tSlot}
                </button>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-[#DDD6CC] space-y-4">
            <input type="text" placeholder={lang === 'EN' ? 'Full Name' : 'Nombre Completo'} className="w-full p-3 border border-[#DDD6CC]" onChange={e => setClientData({...clientData, name: e.target.value})} />
            <input type="text" placeholder="Instagram User (e.g. @maria)" className="w-full p-3 border border-[#DDD6CC]" onChange={e => setClientData({...clientData, contact: e.target.value})} />
            <textarea placeholder={lang === 'EN' ? 'Notes (Optional)' : 'Notas (Opcional)'} className="w-full p-3 border border-[#DDD6CC]" rows="2" onChange={e => setClientData({...clientData, notes: e.target.value})}></textarea>
          </div>
        </div>
      )}

      {/* Paso 3: Resumen y CTA */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-6 border border-[#DDD6CC]">
            <h2 className="text-2xl font-serif mb-6 text-center">{t[lang].summary}</h2>
            <div className="space-y-3 mb-6 pb-6 border-b border-[#DDD6CC]">
              <p><strong>Name:</strong> {clientData.name}</p>
              <p><strong>Date:</strong> {date} at {time}</p>
              <div>
                <strong>Services:</strong>
                <ul className="list-disc pl-5 mt-2">
                  {cart.map(c => <li key={c.id}>{c.name} - ${c.price}</li>)}
                </ul>
              </div>
            </div>
            <div className="flex justify-between text-xl font-serif mb-6">
              <span>{t[lang].total}:</span>
              <span>${totalCart}</span>
            </div>

            <div className="bg-[#F3DCE0]/30 p-4 border border-[#F3DCE0] mb-6 flex items-start gap-3">
              <input 
                type="checkbox" 
                id="policy" 
                className="mt-1 w-5 h-5 accent-[#C5A059]"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
              />
              <label htmlFor="policy" className="text-sm cursor-pointer select-none">
                <span className="font-semibold text-red-800 block mb-1">Important:</span>
                {t[lang].policy} <br/>
                <span className="underline">{t[lang].acceptPolicy}</span>
              </label>
            </div>

            <a 
              href={policyAccepted ? `https://ig.me/m/tinastudioo?text=${generateMessage()}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center p-4 text-white uppercase tracking-widest font-semibold transition-colors ${policyAccepted ? 'bg-[#222120] hover:bg-black' : 'bg-gray-300 cursor-not-allowed pointer-events-none'}`}
            >
              <Instagram size={20} className="mr-2" /> {t[lang].bookViaDM}
            </a>
            <p className="text-xs text-center text-gray-500 mt-4">{t[lang].dmNote}</p>
          </div>
        </div>
      )}

      {/* Navegación Footer */}
      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-[#222120] uppercase tracking-wider text-sm font-semibold hover:bg-black hover:text-white transition-colors">
            {t[lang].back}
          </button>
        ) : <div></div>}
        
        {step < 3 && (
          <button 
            onClick={() => setStep(step + 1)} 
            disabled={cart.length === 0 || (step === 2 && (!date || !time || !clientData.name))}
            className="px-6 py-3 bg-[#222120] text-white uppercase tracking-wider text-sm font-semibold disabled:opacity-50 flex items-center"
          >
            {t[lang].next} <ChevronRight size={16} className="ml-2"/>
          </button>
        )}
      </div>

      <footer className="mt-16 pt-8 border-t border-[#DDD6CC] flex flex-col items-center justify-center gap-4 text-sm text-gray-400">
        <a href="https://instagram.com/tinastudioo" target="_blank" className="hover:text-[#C5A059]"><Instagram /></a>
        <button onClick={() => setShowPinModal(true)} className="flex items-center gap-1 hover:text-[#222120] transition-colors">
          <Lock size={12} /> {t[lang].privateProfile}
        </button>
      </footer>
    </div>
  );

  // VISTA DEL ADMINISTRADOR (TINA STUDIO)
  const renderAdminView = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white min-h-screen text-[#222120] font-sans">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-2xl font-serif text-[#C5A059]">{t[lang].adminPanel}</h1>
        <button onClick={() => setIsAdmin(false)} className="text-sm font-semibold tracking-widest uppercase text-red-500 border border-red-500 px-4 py-2 hover:bg-red-50">
          {t[lang].logout}
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border p-6 bg-[#F7F4EF]">
          <h2 className="text-xl font-serif mb-4">{t[lang].settings}</h2>
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-white border border-[#DDD6CC]">
            <input 
              type="checkbox" 
              checked={nailsEnabled}
              onChange={(e) => setNailsEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#C5A059]"
            />
            <span className="font-semibold">{t[lang].nailsToggle} (Coming Mid-December)</span>
          </label>

          <p className="text-sm text-gray-500 mt-6 mb-2">Aquí puedes agregar la carga de fotos y conexión a Google Script.</p>
          <div className="p-4 border border-dashed border-gray-400 text-center text-gray-500 bg-white">
            📸 Editor de Precios y Subida de Fotos (En desarrollo)
          </div>
        </div>

        <div className="border p-6">
          <h2 className="text-xl font-serif mb-4">Google Calendar Sync</h2>
          <p className="text-sm text-gray-600 mb-4">Pega aquí tu URL de Google Apps Script para sincronizar citas automáticamente.</p>
          <input type="text" placeholder="https://script.google.com/macros/s/.../exec" className="w-full p-3 border border-[#DDD6CC] mb-4" />
          <button className="w-full bg-[#222120] text-white p-3 uppercase tracking-widest font-semibold text-sm">
            Connect Script
          </button>
        </div>
      </div>
    </div>
  );

  // MODAL DE PIN
  return (
    <>
      {!isAdmin ? renderClientView() : renderAdminView()}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className={`bg-white p-8 max-w-sm w-full transition-transform ${pinError ? 'translate-x-2' : ''}`}>
            <h3 className="text-center font-serif text-xl mb-6">{t[lang].enterPin}</h3>
            <div className="flex justify-center mb-6 text-2xl tracking-[1em] font-mono border-b-2 border-[#222120] pb-2">
              {pin.padEnd(4, '•').slice(0, 4)}
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num} 
                  onClick={() => pin.length < 4 && setPin(pin + num)}
                  className="p-4 bg-[#F7F4EF] hover:bg-[#DDD6CC] font-semibold text-lg"
                >
                  {num}
                </button>
              ))}
              <button onClick={() => setPin('')} className="p-4 text-red-500 font-bold">C</button>
              <button onClick={() => pin.length < 4 && setPin(pin + '0')} className="p-4 bg-[#F7F4EF] hover:bg-[#DDD6CC] font-semibold text-lg">0</button>
              <button onClick={handleAdminLogin} className="p-4 text-[#C5A059] font-bold">→</button>
            </div>
            
            <button onClick={() => setShowPinModal(false)} className="w-full text-center text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
