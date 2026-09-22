import React from 'react';

export default function KrishiSevaLogo({ className = "h-9 w-9", ...props }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} {...props}>
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Modern Organic Forest Squircle Badge */}
        <rect 
          x="1.5" 
          y="1.5" 
          width="45" 
          height="45" 
          rx="13" 
          fill="#0B1E14" 
          stroke="#1A4F32" 
          strokeWidth="1.5"
        />

        {/* Minimalist Golden Rising Sun */}
        <circle cx="33" cy="16" r="5.5" fill="#F59E0B" />
        <path 
          d="M 33 7.5 V 5.5 M 39.5 9.5 L 41 8 M 41.5 16 H 43.5 M 26.5 9.5 L 25 8 M 24.5 16 H 22.5" 
          stroke="#F59E0B" 
          strokeWidth="1.4" 
          strokeLinecap="round" 
          opacity="0.8" 
        />

        {/* Sweeping Farmland Furrows */}
        <path d="M 12 37 C 20 37, 30 35, 40 28" stroke="#22C55E" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 16 41 C 24 41, 33 39, 41 33" stroke="#15803D" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

        {/* Clean Geometric Tractor Profile */}
        <path 
          d="M 15 20 H 22 L 24 25 H 31 V 31 H 13 V 26 L 15 20 Z" 
          fill="#1A4F32" 
          stroke="#FFFFFF" 
          strokeWidth="1.8" 
          strokeLinejoin="round" 
        />
        {/* Cabin Glass Window */}
        <path d="M 16.5 22 H 21 L 22.5 25 H 16.5 Z" fill="#FFFFFF" opacity="0.9" />
        {/* Exhaust Stack */}
        <path d="M 29 25 V 21" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        {/* Rear Wheel */}
        <circle cx="17" cy="31" r="5.5" fill="#0B1E14" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="17" cy="31" r="2" fill="#22C55E" />
        {/* Front Wheel */}
        <circle cx="28" cy="32.5" r="3.5" fill="#0B1E14" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="28" cy="32.5" r="1.2" fill="#22C55E" />
      </svg>
    </div>
  );
}
