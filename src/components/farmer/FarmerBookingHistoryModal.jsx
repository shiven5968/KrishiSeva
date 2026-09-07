import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  History, 
  X, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Package
} from 'lucide-react';

const SEED_BOOKING_HISTORY = [
  {
    id: 'book_1787550102',
    farmerName: 'Balram Kisan (बलराम किसान)',
    landName: 'Main Farm (गाटा #142)',
    machineryType: 'tractor',
    attachment: { nameKey: 'rotavator', descKey: 'rotavatorDesc' },
    landSize: 4,
    sizeUnit: 'bigha',
    estimatedPrice: 5200,
    paidAmount: 5200,
    paymentMethod: 'online',
    status: 'completed',
    completedAt: '2026-08-23T16:30:00.000Z',
    farmerRating: 5,
    feedbackTags: ['punctual', 'skilled', 'clean'],
    assignedDriver: {
      name: 'Jagjit Singh (जगजीत सिंह)',
      vehicleNumber: 'UP-32-KR-7744',
      modelName: 'Mahindra 575 DI (50 HP)',
      phone: '9876501234'
    }
  },
  {
    id: 'book_1787498100',
    farmerName: 'Balram Kisan (बलराम किसान)',
    landName: 'Mustard Plot (सरसों का खेत)',
    machineryType: 'harvester',
    attachment: { nameKey: 'grainHarvester', descKey: 'grainHarvesterDesc' },
    landSize: 2.5,
    sizeUnit: 'bigha',
    estimatedPrice: 3750,
    paidAmount: 3750,
    paymentMethod: 'cod',
    status: 'completed',
    completedAt: '2026-08-20T11:15:00.000Z',
    farmerRating: 5,
    feedbackTags: ['clean', 'fair_price'],
    assignedDriver: {
      name: 'Rampal Sharma (रामपाल शर्मा)',
      vehicleNumber: 'UP-32-BT-9901',
      modelName: 'Preet 987 Combine (110 HP)',
      phone: '9876505678'
    }
  },
  {
    id: 'book_1787412000',
    farmerName: 'Balram Kisan (बलराम किसान)',
    landName: 'Khet #14, Malihabad',
    machineryType: 'truck',
    cargoName: 'Harvested Grains / Crops (गेहूँ की बोरियां)',
    cargoDetails: '80 Bags Wheat to APMC Mandi',
    dropLocation: 'APMC Grain Mandi, Malihabad',
    landSize: 14,
    sizeUnit: 'km',
    estimatedPrice: 1200,
    paidAmount: 1200,
    paymentMethod: 'online',
    status: 'completed',
    completedAt: '2026-08-16T14:45:00.000Z',
    farmerRating: 5,
    feedbackTags: ['punctual', 'safe'],
    assignedDriver: {
      name: 'Gurmeet Singh (गुरमीत सिंह)',
      vehicleNumber: 'UP-32-TR-4421',
      modelName: '10-Ton Hydraulic Tipper',
      phone: '9876509988'
    }
  }
];

export default function FarmerBookingHistoryModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();

  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('krishi_farmer_booking_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistoryList(parsed);
            return;
          }
        }
        localStorage.setItem('krishi_farmer_booking_history', JSON.stringify(SEED_BOOKING_HISTORY));
        setHistoryList(SEED_BOOKING_HISTORY);
      } catch (e) {
        setHistoryList(SEED_BOOKING_HISTORY);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border relative overflow-hidden transition-all ${
        isDark 
          ? 'bg-[#0E1512] border-emerald-500/30 text-white shadow-emerald-950/40' 
          : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-200 dark:border-slate-800 bg-stone-950/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md border ${
              isDark ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}>
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {lang === 'hi' ? 'बुकिंग इतिहास व रसीदें' : 'My Booking History & Receipts'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'आपके सभी पूर्ण किए गए कार्य व चालक रेटिंग्स' : 'All completed machinery dispatches & ratings'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition active:scale-95 ${
              isDark 
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-white hover:border-stone-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable History List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {historyList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-stone-500 flex items-center justify-center text-2xl mx-auto">
                🚜
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                {lang === 'hi' ? 'अभी तक कोई बुकिंग इतिहास उपलब्ध नहीं है।' : 'No booking history recorded yet.'}
              </p>
            </div>
          ) : (
            historyList.map((item, index) => {
              const driver = item.assignedDriver || {
                name: 'Jagjit Singh (जगजीत सिंह)',
                vehicleNumber: 'UP-32-KR-7744',
                modelName: 'Mahindra 575 DI'
              };

              return (
                <div
                  key={item.id || index}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                    isDark 
                      ? 'bg-stone-950/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40' 
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  {/* Top Bar: Booking ID, Date & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                        #{String(item.id).replace('book_', 'KS-')}
                      </span>
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                        <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span>{formatDate(item.completedAt || item.createdAt)}</span>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{lang === 'hi' ? 'सफल संपन्न ✓' : 'Completed ✓'}</span>
                    </span>
                  </div>

                  {/* Body: Machinery & Farm Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                        {lang === 'hi' ? 'वाहन व उपकरण' : 'Machinery & Cargo'}
                      </span>
                      <p className="font-black text-sm text-emerald-400 flex items-center gap-1.5">
                        <span>{item.machineryType === 'truck' ? '🚛' : item.machineryType === 'harvester' ? '🌾' : '🚜'}</span>
                        <span>{item.cargoName || t(item.machineryType) || 'Tractor'}</span>
                      </p>
                      {item.attachment && (
                        <p className="text-emerald-300 font-bold text-[11px]">
                          + {t(item.attachment.nameKey)}
                        </p>
                      )}
                      {item.cargoDetails && (
                        <p className={`text-[11px] font-medium ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                          📦 {item.cargoDetails}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                        {lang === 'hi' ? 'खेत / गंतव्य स्थान' : 'Farm / Destination'}
                      </span>
                      <p className={`font-bold text-xs ${isDark ? 'text-stone-200' : 'text-slate-800'}`}>
                        {item.dropLocation ? `📍 ${item.dropLocation}` : (item.landName || 'Main Farm')}
                      </p>
                      <p className="text-amber-400 font-bold text-[11px]">
                        {item.landSize} {item.sizeUnit}
                      </p>
                    </div>
                  </div>

                  {/* Driver & Payout Bar */}
                  <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isDark ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-stone-500' : 'text-slate-400'}`}>
                        {lang === 'hi' ? 'चालक पार्टनर' : 'Driver Partner'}
                      </span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{driver.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">({driver.vehicleNumber})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Farmer Rating given */}
                      <div className="text-right">
                        <span className="text-[10px] text-amber-400 font-black flex items-center gap-0.5 justify-end">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{Number(item.farmerRating || 5.0).toFixed(1)} / 5.0</span>
                        </span>
                        <span className={`text-[9px] ${isDark ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`}>
                          {lang === 'hi' ? 'आपकी रेटिंग' : 'Your Rating'}
                        </span>
                      </div>

                      {/* Paid Amount */}
                      <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-800">
                        <span className="text-base font-black text-emerald-400 block">
                          ₹{item.paidAmount || item.estimatedPrice}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          {item.paymentMethod === 'cod' ? 'Paid COD' : 'Paid Online'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${
          isDark ? 'border-slate-200 dark:border-slate-800 bg-stone-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition active:scale-95 shadow-md"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close History'}
          </button>
        </div>

      </div>
    </div>
  );
}
