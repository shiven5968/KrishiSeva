import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { User, Truck, ShieldCheck, Home, ExternalLink } from 'lucide-react';

export default function RoleSwitcher() {
  const { activeRole, setActiveRole, driverProfile } = useAuth();
  const { lang } = useLanguage();
  const { pendingApplications, activeBooking } = useRealtimeSync();

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 backdrop-blur-md text-white p-1.5 rounded-2xl shadow-2xl border border-stone-700/60 flex items-center gap-1 max-w-[95vw]">
      
      <button
        onClick={() => setActiveRole('landing')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeRole === 'landing' ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">{lang === 'hi' ? 'होम' : 'Home'}</span>
      </button>

      <button
        onClick={() => setActiveRole('farmer')}
        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${activeRole === 'farmer' ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
      >
        <User className="w-4 h-4" />
        <span>{lang === 'hi' ? 'किसान (Farmer)' : 'Farmer'}</span>
        {activeBooking && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        )}
      </button>

      <button
        onClick={() => setActiveRole('driver')}
        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${activeRole === 'driver' ? 'bg-blue-600 text-white shadow-md' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
      >
        <Truck className="w-4 h-4" />
        <span>{lang === 'hi' ? 'ड्राइवर (Driver)' : 'Driver'}</span>
        {driverProfile.status === 'online' && (
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        )}
      </button>

      <button
        onClick={() => setActiveRole('admin')}
        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${activeRole === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{lang === 'hi' ? 'एडमिन (Admin)' : 'Admin'}</span>
        {pendingApplications.length > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500 text-white font-bold leading-none">
            {pendingApplications.length}
          </span>
        )}
      </button>

      {/* Tip */}
      <div className="hidden md:flex items-center text-[10px] text-stone-400 pl-2 border-l border-stone-700 pr-1">
        <span>💡 Open in 2 tabs for live demo</span>
      </div>
    </div>
  );
}
