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
        <div className="my-5 bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-2xl p-5 shadow-lg shadow-emerald-600/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">
                {booking.isBargained 
                  ? (lang === 'hi' ? '🤝 किसान का ऑफर किराया' : '🤝 Farmer Counter Offer') 
                  : (lang === 'hi' ? 'अनुमानित कुल किराया (Estimated Fare)' : 'Guaranteed Payout')}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-3xl sm:text-4xl font-black text-white">
                  ₹{booking.estimatedPrice}
                </h3>
                {booking.isBargained && booking.originalStandardPrice && (
                  <span className="text-xs text-emerald-200 line-through">
                    ₹{booking.originalStandardPrice}
                  </span>
                )}
              </div>
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

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-emerald-100">
            <span className="flex items-center gap-1 font-bold">
              <span>🔒</span>
              <span>{lang === 'hi' ? 'भुगतान: कार्य पूरा होने के बाद किसान द्वारा देय' : 'Payment: Due directly after work'}</span>
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded font-black text-[10px] text-white">
              0% Advance
            </span>
          </div>
        </div>

        {/* Required Machine & Attachment / Cargo */}
        <div className="space-y-3 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0">
              {booking.machineryType === 'truck' ? '🚛' : '🚜'}
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-black uppercase">
                {booking.machineryType === 'truck' ? (lang === 'hi' ? 'सामग्री व वाहन प्रकार' : 'Cargo & Vehicle') : t('requiredMachine')}
              </span>
              <p className="font-extrabold text-stone-900 text-sm">
                {booking.machineryType === 'truck' 
                  ? (booking.cargoName ? `${booking.cargoName} • ${t(booking.machineryType)}` : `${t(booking.machineryType)} + ${t(booking.attachment?.nameKey)}`)
                  : `${t(booking.machineryType)} + ${t(booking.attachment?.nameKey)}`}
              </p>
              <p className="text-stone-500 mt-0.5 font-medium">
                {booking.machineryType === 'truck' && booking.cargoDetails
                  ? `📦 ${booking.cargoDetails}`
                  : t(booking.attachment?.descKey)}
              </p>
            </div>
          </div>

          {/* Farmer Location & Destination (Requirement 2: User's location & Where to Go) */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="w-full">
              <span className="text-[10px] text-stone-400 font-black uppercase">
                {booking.machineryType === 'truck' ? (lang === 'hi' ? 'पिकअप व डिलीवरी रूट' : 'Pickup & Drop Route') : t('farmerLocation')}
              </span>
              <p className="font-bold text-stone-900 text-sm">
                {booking.pickupAddress || booking.farmerLocation?.address || 'Rampur Khet, Malihabad'}
              </p>
              {booking.machineryType === 'truck' && booking.dropLocation && (
                <p className="text-blue-700 font-extrabold text-xs mt-1 flex items-center gap-1">
                  <span>➔</span>
                  <span>{lang === 'hi' ? 'डिलीवरी गंतव्य:' : 'Delivery Drop:'} {booking.dropLocation} (~{booking.landSize} km)</span>
                </p>
              )}
              <p className="text-stone-500 font-medium mt-0.5">
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
