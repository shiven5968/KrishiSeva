import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { audioHelper } from '../../utils/audioHelper';
import { 
  Tractor, 
  MapPin, 
  Layers, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Volume2,
  AlertCircle
} from 'lucide-react';

export default function IncomingRideModal({ booking, onAccept, onReject }) {
  const { lang, t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    audioHelper.playIncomingRideAlert();

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!booking) return null;

  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-emerald-500 relative overflow-hidden">
        
        {/* Animated 30-second progress bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-stone-100">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Header with pulsating alert */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              {lang === 'hi' ? 'नई बुकिंग आई है!' : 'New Ride Request!'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Big Payout & Distance Banner */}
        <div className="my-5 bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-2xl p-5 shadow-lg shadow-emerald-600/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">
              {lang === 'hi' ? 'अनुमानित कुल किराया (Estimated Fare)' : 'Guaranteed Payout'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white mt-0.5">
              ₹{booking.estimatedPrice}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-emerald-100 font-bold uppercase">
              {lang === 'hi' ? 'खेत का आकार' : 'Work Area'}
            </span>
            <p className="text-xl font-black text-white">
              {booking.landSize} {booking.sizeUnit}
            </p>
          </div>
        </div>

        {/* Required Machine & Attachment (Requirement 2: machine/attachment needed) */}
        <div className="space-y-3 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0">
              🚜
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-black uppercase">
                {t('requiredMachine')}
              </span>
              <p className="font-extrabold text-stone-900 text-sm">
                {t(booking.machineryType)} + <span className="text-emerald-700">{t(booking.attachment?.nameKey)}</span>
              </p>
              <p className="text-stone-500 mt-0.5">
                {t(booking.attachment?.descKey)}
              </p>
            </div>
          </div>

          {/* Farmer Location (Requirement 2: User's location) */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-black uppercase">
                {t('farmerLocation')}
              </span>
              <p className="font-bold text-stone-900 text-sm">
                {booking.farmerLocation?.address || 'Rampur Khet, Malihabad'}
              </p>
              <p className="text-stone-500 font-medium">
                Farmer: {booking.farmerName} • ETA: ~6 Mins (1.8 km)
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons: Accept / Reject (Requirement 2: Accept or Reject) */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onReject}
            className="w-1/3 py-4 rounded-2xl border-2 border-stone-200 hover:bg-stone-100 text-stone-700 font-black text-sm transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-stone-500" />
            <span>{t('rejectRide')}</span>
          </button>

          <button
            onClick={onAccept}
            className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-base shadow-xl shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t('acceptRide')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
