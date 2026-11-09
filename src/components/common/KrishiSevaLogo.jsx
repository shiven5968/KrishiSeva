import React from 'react';

export default function KrishiSevaLogo({ className = "h-11 w-11 sm:h-12 sm:w-12", ...props }) {
  return (
    <img
      src="/images/logo.png"
      alt="KrishiSeva (कृषि सेवा) Official Agricultural Machinery Network Logo"
      loading="lazy"
      decoding="async"
      className={`object-contain rounded-full select-none shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm ${className}`}
      {...props}
    />
  );
}
