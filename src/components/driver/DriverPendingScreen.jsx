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
      <div className="bg-white/80 dark:bg-[#0D1611]/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-black/[0.06] dark:border-white/[0.08] shadow-sm text-center space-y-6 text-[#0B1E14] dark:text-[#EAEFEA]">
        
        {/* Animated Badge Icon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {isRejected ? (
            <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
              <XCircle className="w-10 h-10" />
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 rounded-full animate-ping-slow"></div>
              <div className="relative w-20 h-20 rounded-full bg-[#0B1E14] text-[#4ADE80] flex items-center justify-center shadow-lg shadow-[#0B1E14]/30 border border-[#4ADE80]/30">
                <Clock className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </>
          )}
        </div>

        {isRejected ? (
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-red-700 dark:text-red-400 bg-red-500/10 px-3.5 py-1 rounded-full border border-red-500/20">
              {lang === 'hi' ? 'सत्यापन अस्वीकृत (Verification Rejected)' : 'Verification Rejected'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
              {lang === 'hi' ? 'दस्तावेज़ पुनः अपलोड करने की आवश्यकता है' : 'Action Required: Re-upload Documents'}
            </h2>
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold max-w-md mx-auto space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-red-950 dark:text-red-300 font-black">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>{lang === 'hi' ? 'एडमिन द्वारा दिया गया कारण:' : 'Reason from Admin:'}</span>
              </div>
              <p className="pl-5 font-semibold">
                "{driverProfile.rejectionReason || 'Driving license photo is blurry or number plate does not match vehicle details.'}"
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#1A4F32] dark:text-[#4ADE80] bg-[#1A4F32]/10 dark:bg-[#4ADE80]/10 px-3.5 py-1 rounded-full border border-[#1A4F32]/20 inline-flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#1A4F32] dark:text-[#4ADE80] animate-pulse" />
              <span>{lang === 'hi' ? 'सत्यापन प्रक्रियाधीन' : 'Verification Under Review'}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E14] dark:text-[#EAEFEA] tracking-tight">
              {lang === 'hi' ? 'आवेदन जमा हो गया - एडमिन सत्यापन की प्रतीक्षा है' : 'Application Submitted - Waiting for Admin Approval'}
            </h2>
            <p className="text-[#4F6358] dark:text-[#9FB1A7] text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-medium">
              {lang === 'hi'
                ? 'आपका ड्राइविंग लाइसेंस और गाड़ी का नंबर प्लेट प्रशासक द्वारा जाँचा जा रहा है। सत्यापन पूर्ण होते ही यह स्क्रीन स्वतः अनलॉक हो जाएगी।'
                : 'Your Driving License and Vehicle Plate are currently being reviewed by our Admin team. Your active dashboard will automatically unlock once approved.'}
            </p>
          </div>
        )}

        {/* Submitted Details Snapshot */}
        <div className="bg-white/60 dark:bg-white/[0.03] rounded-2xl p-5 border border-black/[0.06] dark:border-white/[0.08] text-left space-y-3 text-xs">
          <h4 className="font-extrabold text-[#0B1E14] dark:text-[#EAEFEA] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#4F6358] dark:text-[#9FB1A7]" />
            <span>{lang === 'hi' ? 'जमा किए गए विवरण (Submitted Profile)' : 'Submitted Vehicle Details'}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[#4F6358] dark:text-[#9FB1A7]">
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#4F6358]/70 dark:text-[#9FB1A7]/70">Driver Name</span>
              <span className="font-bold text-[#0B1E14] dark:text-[#EAEFEA]">{driverProfile.fullName}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#4F6358]/70 dark:text-[#9FB1A7]/70">Vehicle Reg</span>
              <span className="font-black text-[#0B1E14] dark:text-[#EAEFEA]">{driverProfile.vehicleNumber}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#4F6358]/70 dark:text-[#9FB1A7]/70">Vehicle Model</span>
              <span className="font-bold text-[#0B1E14] dark:text-[#EAEFEA]">{driverProfile.modelName}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#4F6358]/70 dark:text-[#9FB1A7]/70">Documents</span>
              <span className="font-bold text-[#1A4F32] dark:text-[#4ADE80]">✓ DL & Plate Uploaded</span>
            </div>
          </div>
        </div>

        {/* Re-upload Action (Only shown when rejected) */}
        {isRejected && (
          <div className="pt-2">
            <button
              onClick={() => setDriverVerification('unregistered')}
              className="w-full py-4 rounded-full bg-[#0B1E14] hover:bg-[#153424] dark:bg-[#EAEFEA] dark:hover:bg-white text-white dark:text-[#0B1E14] font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(11,30,20,0.12)] hover:-translate-y-0.5 transition-all duration-300"
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
