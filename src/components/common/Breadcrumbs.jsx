import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronRight, Home, MapPin, Tractor, ShieldCheck, Mail, FileText, HelpCircle } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();

  if (!items || items.length <= 1) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 my-1"
    >
      <ol className={`flex items-center flex-wrap gap-1.5 text-xs font-semibold rounded-2xl px-3.5 py-1.5 border backdrop-blur-md transition-all ${
        isDark 
          ? 'bg-black/30 border-white/5 text-stone-400' 
          : 'bg-white/60 border-black/5 text-[#4F6358]'
      }`}>
        {items.map((crumb, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx === 0 ? (
                <a 
                  href={crumb.href || '/'}
                  onClick={(e) => {
                    if (crumb.onClick) {
                      e.preventDefault();
                      crumb.onClick();
                    }
                  }}
                  className={`flex items-center gap-1 hover:text-emerald-500 transition-colors ${
                    isLast ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{crumb.label || (lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home')}</span>
                </a>
              ) : isLast ? (
                <span 
                  aria-current="page"
                  className="font-bold text-[#0B1E14] dark:text-[#EAEFEA] truncate max-w-[200px] sm:max-w-none"
                >
                  {crumb.label}
                </span>
              ) : (
                <a 
                  href={crumb.href || '#'}
                  onClick={(e) => {
                    if (crumb.onClick) {
                      e.preventDefault();
                      crumb.onClick();
                    }
                  }}
                  className="hover:text-emerald-500 transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {crumb.label}
                </a>
              )}

              {!isLast && (
                <ChevronRight className="w-3 h-3 text-stone-400 dark:text-stone-600 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
