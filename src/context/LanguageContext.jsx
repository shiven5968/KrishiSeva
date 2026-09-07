import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

/**
 * Universal text localizer for bilingual strings:
 * - "Hindi Name (English Name)" -> returns English or Hindi
 * - "English / Hindi" -> returns English or Hindi
 */
export function formatLocalizedText(str, lang = 'en') {
  if (!str || typeof str !== 'string') return str || '';
  
  // Pattern 1: "Part1 (Part2)" e.g. "गाँव का मुख्य खेत (Village Main Farmland)" or "Alluvial Loam (दोमट मिट्टी)"
  const parenMatch = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const part1 = parenMatch[1].trim();
    const part2 = parenMatch[2].trim();
    const isPart1Hindi = /[\u0900-\u097F]/.test(part1);
    if (isPart1Hindi) {
      return lang === 'hi' ? part1 : part2;
    } else {
      return lang === 'hi' ? part2 : part1;
    }
  }

  // Pattern 2: "Part1 / Part2" e.g., "Wheat / गेहूँ", "Paddy / धान"
  if (str.includes('/')) {
    const parts = str.split('/').map(s => s.trim());
    if (parts.length === 2) {
      const isPart1Hindi = /[\u0900-\u097F]/.test(parts[0]);
      if (isPart1Hindi) {
        return lang === 'hi' ? parts[0] : parts[1];
      } else {
        return lang === 'hi' ? parts[1] : parts[0];
      }
    }
  }

  return str;
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('krishi_lang') || 'hi'; // Default Hindi for rural reach
  });

  useEffect(() => {
    localStorage.setItem('krishi_lang', lang);
    document.documentElement.lang = lang;
    if (lang === 'hi') {
      document.documentElement.classList.add('lang-hi');
    } else {
      document.documentElement.classList.remove('lang-hi');
    }
  }, [lang]);

  const t = (key) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return key;
  };

  const localize = (str) => formatLocalizedText(str, lang);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
