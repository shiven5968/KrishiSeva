import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePreBookings } from '../../context/PreBookingsContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tractor, 
  IndianRupee, 
  CheckCircle2, 
  X, 
  Trash2, 
  AlertCircle,
  FileText,
  CalendarDays,
  Sparkles,
  Sun,
  Sunrise,
  ShieldCheck
} from 'lucide-react';

export default function PreBookingsModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const { preBookings, cancelPreBooking, deletePreBooking } = usePreBookings();

  if (!isOpen) return null;

  const activePreBookings = preBookings.filter(b => b.status === 'scheduled');
  const pastPreBookings = preBookings.filter(b => b.status !== 'scheduled');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl shadow-inner shrink-0">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-stone-900">
                  {lang === 'hi' ? 'मेरी अग्रिम बुकिंग्स' : 'My Scheduled Pre-Bookings'}
                </h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                  {activePreBookings.length} {lang === 'hi' ? 'सक्रिय' : 'Active'}
                </span>
              </div>
              <p className="text-stone-500 text-xs font-semibold mt-0.5">
                {lang === 'hi' ? 'आगामी दिनों व तारीखों के लिए आरक्षित कृषि मशीनरी' : 'Guaranteed farm machinery reservations for future dates & operations'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Scheduled Reservations */}
        <div className="space-y-4">
          <h4 className="font-black text-xs uppercase tracking-wider text-stone-400">
            {lang === 'hi' ? 'आगामी आरक्षित बुकिंग्स' : 'Upcoming Scheduled Reservations'} ({activePreBookings.length})
          </h4>

          {activePreBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 text-center space-y-2">
              <CalendarDays className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-black text-stone-700">
                {lang === 'hi' ? 'कोई सक्रिय अग्रिम बुकिंग नहीं है' : 'No upcoming scheduled bookings'}
              </p>
              <p className="text-xs text-stone-500">
                {lang === 'hi' ? 'खेत बुकिंग स्क्रीन पर "अग्रिम बुकिंग" चुनकर किसी भी तारीख के लिए मशीन बुक करें।' : 'Select "Pre-Book for Date & Day" on the booking view to schedule a machine in advance.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activePreBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50/40 hover:bg-blue-50/70 transition space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{booking.scheduledDate} ({booking.scheduledDay})</span>
                      </span>

                      <span className="text-xs font-bold text-stone-700 bg-white px-2.5 py-0.5 rounded-full border border-stone-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{booking.timeSlot}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        <span>{lang === 'hi' ? 'सत्यापित ऑपरेटर' : 'Guaranteed Operator'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Machinery & Field Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'मशीन व उपकरण' : 'Machinery & Attachment'}</span>
                      <span className="font-black text-stone-900 capitalize">
                        {booking.machineryType} • {t(booking.attachment?.nameKey) || 'Rotavator'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">{lang === 'hi' ? 'खेत व आकार' : 'Field & Size'}</span>
                      <span className="font-black text-stone-900">
                        {booking.landName} ({booking.landSize} {booking.sizeUnit})
                      </span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                      <span className="text-[10px] text-emerald-700 block font-bold">{lang === 'hi' ? 'कुल अनुमानित किराया' : 'Total Estimated Price'}</span>
                      <span className="font-black text-base text-emerald-800">₹{booking.estimatedPrice}</span>
                    </div>
                  </div>

                  {booking.specialNotes && (
                    <p className="text-[11px] text-stone-600 bg-white/80 p-2 rounded-lg border border-stone-200 italic">
                      💬 "{booking.specialNotes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-400 font-bold">
                      ID: #{booking.id}
                    </span>

                    <button
                      onClick={() => cancelPreBooking(booking.id)}
                      className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-100 text-xs font-bold transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'अग्रिम बुकिंग रद्द करें' : 'Cancel Reservation'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past / Cancelled Pre-Bookings */}
        {pastPreBookings.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <h4 className="font-black text-xs uppercase tracking-wider text-stone-400">
              {lang === 'hi' ? 'रद्द व पिछली बुकिंग्स' : 'Cancelled & Past Reservations'}
            </h4>

            <div className="space-y-2">
              {pastPreBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-500 opacity-70"
                >
                  <div className="flex items-center gap-2">
                    <span className="line-through">{booking.scheduledDate}</span>
                    <span>•</span>
                    <span className="capitalize">{booking.machineryType} ({booking.landName})</span>
                    <span>•</span>
                    <span className="text-red-600 font-bold">{lang === 'hi' ? 'रद्द' : 'Cancelled'}</span>
                  </div>

                  <button
                    onClick={() => deletePreBooking(booking.id)}
                    className="p-1 text-stone-400 hover:text-red-600"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
