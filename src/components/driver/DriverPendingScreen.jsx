import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, FileText, XCircle, RefreshCw, Radio, ShieldAlert } from 'lucide-react';

export default function DriverPendingScreen() {
  const { lang } = useLanguage();
  const { driverProfile, setDriverVerification } = useAuth();

  const isRejected = driverProfile.verificationStatus === 'rejected';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl text-center space-y-6">
        
        {/* Animated Badge Icon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {isRejected ? (
            <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
              <XCircle className="w-10 h-10" />
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-amber-200/60 rounded-full animate-ping-slow"></div>
              <div className="relative w-20 h-20 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Clock className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </>
          )}
        </div>

        {isRejected ? (
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-red-800 bg-red-100 px-3.5 py-1 rounded-full border border-red-300">
              {lang === 'hi' ? 'सत्यापन अस्वीकृत (Verification Rejected)' : 'Verification Rejected'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              {lang === 'hi' ? 'दस्तावेज़ पुनः अपलोड करने की आवश्यकता है' : 'Action Required: Re-upload Documents'}
            </h2>
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold max-w-md mx-auto space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-red-950 font-black">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>{lang === 'hi' ? 'एडमिन द्वारा दिया गया कारण:' : 'Reason from Admin:'}</span>
              </div>
              <p className="pl-5 font-semibold text-red-900">
                "{driverProfile.rejectionReason || 'Driving license photo is blurry or number plate does not match vehicle details.'}"
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 inline-flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{lang === 'hi' ? 'सत्यापन प्रक्रियाधीन' : 'Verification Under Review'}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              {lang === 'hi' ? 'आवेदन जमा हो गया - एडमिन सत्यापन की प्रतीक्षा है' : 'Application Submitted - Waiting for Admin Approval'}
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              {lang === 'hi'
                ? 'आपका ड्राइविंग लाइसेंस और गाड़ी का नंबर प्लेट प्रशासक द्वारा जाँचा जा रहा है। सत्यापन पूर्ण होते ही यह स्क्रीन स्वतः अनलॉक हो जाएगी।'
                : 'Your Driving License and Vehicle Plate are currently being reviewed by our Admin team. Your active dashboard will automatically unlock once approved.'}
            </p>
          </div>
        )}

        {/* Submitted Details Snapshot */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left space-y-3 text-xs">
          <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-stone-600" />
            <span>{lang === 'hi' ? 'जमा किए गए विवरण (Submitted Profile)' : 'Submitted Vehicle Details'}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-stone-600">
            <div>
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Driver Name</span>
              <span className="font-bold text-stone-900">{driverProfile.fullName}</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Vehicle Reg</span>
              <span className="font-black text-stone-900">{driverProfile.vehicleNumber}</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Vehicle Model</span>
              <span className="font-bold text-stone-900">{driverProfile.modelName}</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Documents</span>
              <span className="font-bold text-emerald-700">✓ DL & Plate Uploaded</span>
            </div>
          </div>
        </div>

        {/* Re-upload Action (Only shown when rejected) */}
        {isRejected && (
          <div className="pt-2">
            <button
              onClick={() => setDriverVerification('unregistered')}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-98"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === 'hi' ? 'दस्तावेज़ पुनः अपलोड करें और दोबारा जमा करें' : 'Re-upload Documents & Resubmit'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
