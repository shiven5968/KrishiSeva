import React from 'react';

export default function KrishiSevaLogo({ className = "h-9 w-9 sm:h-10 sm:w-10", ...props }) {
  return (
    <img
      src="/images/logo.png"
      alt="KrishiSeva Logo"
      className={`object-contain rounded-full select-none shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
      {...props}
    />
  );
}
