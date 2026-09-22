import React from 'react';

export default function KrishiSevaLogo({ className = "h-8 sm:h-9 w-auto", ...props }) {
  return (
    <svg 
      viewBox="0 0 160 105" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/* Subtle Dark Bronze / Forest Patina Gradient for Pill Badge */}
        <linearGradient id="ksPillBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1E14" />
          <stop offset="100%" stopColor="#142F21" />
        </linearGradient>

        {/* Golden Sun Radiant Gradient */}
        <linearGradient id="ksSunGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Forest Green Field & Tractor Body */}
        <linearGradient id="ksTractorGreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Soft Ambient Shadow */}
        <filter id="ksShadow" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0B1E14" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* ── 1. Sophisticated Pill Badge Container ── */}
      <rect 
        x="3" 
        y="3" 
        width="154" 
        height="99" 
        rx="34" 
        fill="url(#ksPillBg)" 
        stroke="#1A4F32" 
        strokeWidth="2.5" 
        filter="url(#ksShadow)"
      />

      {/* ── 2. Segmented Radial Sun (Top-Right) ── */}
      <g id="sunGroup">
        {/* Radial Ray Wedges converging cleanly */}
        <path d="M 112 36 L 100 23 A 18 18 0 0 1 112 18 Z" fill="url(#ksSunGold)" />
        <path d="M 112 36 L 115 18 A 18 18 0 0 1 127 24 Z" fill="url(#ksSunGold)" />
        <path d="M 112 36 L 129 27 A 18 18 0 0 1 130 40 Z" fill="url(#ksSunGold)" />
        <path d="M 112 36 L 130 43 A 18 18 0 0 1 122 53 Z" fill="url(#ksSunGold)" />
        <path d="M 112 36 L 119 54 A 18 18 0 0 1 106 54 Z" fill="url(#ksSunGold)" />
        <path d="M 112 36 L 103 52 A 18 18 0 0 1 95 44 Z" fill="url(#ksSunGold)" />
        <path d="M 112 36 L 94 40 A 18 18 0 0 1 97 27 Z" fill="url(#ksSunGold)" />
        {/* Central Core Accent */}
        <circle cx="112" cy="36" r="6.5" fill="#FDE68A" />
      </g>

      {/* ── 3. Sweeping Farmland Furrows (Bottom-Right) ── */}
      <g id="furrowLines" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        <path d="M 44 74 Q 85 76 132 53" />
        <path d="M 48 80 Q 90 83 130 62" strokeWidth="3.2" stroke="#22C55E" />
        <path d="M 54 86 Q 96 90 126 72" strokeWidth="3.5" stroke="#16A34A" />
        <path d="M 64 92 Q 102 96 122 83" strokeWidth="3" stroke="#15803D" />
      </g>

      {/* ── 4. Precision Tractor Profile (Center-Left) ── */}
      <g id="tractor" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        
        {/* Tractor Body Fill */}
        <path 
          d="M 50 36 
             L 70 36 
             L 74 48 
             L 94 48 
             Q 98 48 98 52 
             L 98 67 
             L 86 67 
             L 86 60 
             L 66 60 
             L 66 67 
             L 46 67 
             L 46 54 
             L 48 38 Z" 
          fill="url(#ksTractorGreen)" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
        />

        {/* Cabin Glass Window */}
        <path 
          d="M 52 40 L 67 40 L 70 48 L 52 48 Z" 
          fill="#FFFFFF" 
          fillOpacity="0.85" 
          stroke="#0B1E14" 
          strokeWidth="1.2" 
        />

        {/* Exhaust Stack / Chimney */}
        <path d="M 88 48 L 88 38 Q 88 35 91 35 L 93 35" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />

        {/* Front Grille Slits */}
        <line x1="94" y1="53" x2="94" y2="60" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="91" y1="53" x2="91" y2="60" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Rear Wheel (Large Tread) */}
        <circle cx="56" cy="65" r="15.5" fill="#0B1E14" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="56" cy="65" r="9" fill="#15803D" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="56" cy="65" r="3.5" fill="#FFFFFF" />
        {/* Treads */}
        <path d="M 56 47 L 56 50 M 56 80 L 56 83 M 38 65 L 41 65 M 71 65 L 74 65 M 43 52 L 46 54 M 66 76 L 69 78 M 43 78 L 46 76 M 66 54 L 69 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

        {/* Front Wheel (Smaller) */}
        <circle cx="89" cy="71" r="10" fill="#0B1E14" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="89" cy="71" r="5.5" fill="#15803D" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="89" cy="71" r="2.2" fill="#FFFFFF" />
        {/* Treads */}
        <path d="M 89 59 L 89 62 M 89 80 L 89 83 M 77 71 L 80 71 M 98 71 L 101 71" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
