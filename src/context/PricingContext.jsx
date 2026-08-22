import React, { createContext, useContext, useState, useEffect } from 'react';

const PricingContext = createContext();

export const UNIT_CONVERSIONS_TO_BIGHA = {
  bigha: 1.0,
  acre: 1.61,
  hectare: 3.95,
  biswa: 0.05,
  guntha: 0.04025,
  kanal: 0.20125
};

export const SUPPORTED_QUANTITY_UNITS = [
  { id: 'bigha', labelEn: 'Bigha', labelHi: 'बीघा', icon: '🌾', step: 0.5, defaultMin: 0.5, defaultMax: 25, presets: [0.5, 1, 2, 3, 5, 8, 10] },
  { id: 'acre', labelEn: 'Acre', labelHi: 'एकड़', icon: '🚜', step: 0.5, defaultMin: 0.5, defaultMax: 15, presets: [0.5, 1, 1.5, 2, 3, 5, 8] },
  { id: 'hectare', labelEn: 'Hectare', labelHi: 'हेक्टेयर', icon: '📐', step: 0.25, defaultMin: 0.25, defaultMax: 10, presets: [0.25, 0.5, 1, 1.5, 2, 4] },
  { id: 'hours', labelEn: 'Hours', labelHi: 'घंटे (समय)', icon: '⏱️', step: 1, defaultMin: 1, defaultMax: 12, presets: [1, 2, 3, 4, 6, 8, 10] },
  { id: 'biswa', labelEn: 'Biswa / Guntha', labelHi: 'बिस्वा / गुंठा', icon: '📏', step: 1, defaultMin: 1, defaultMax: 40, presets: [2, 5, 10, 15, 20, 30] },
  { id: 'kanal', labelEn: 'Kanal', labelHi: 'कनाल', icon: '🌾', step: 1, defaultMin: 1, defaultMax: 24, presets: [1, 2, 4, 8, 12, 16] }
];

export const INITIAL_RATES = {
  tractor: {
    ratePerBigha: 1300,
    ratePerHour: 1000,
    unit: 'Bigha',
    label: 'Tractor + Implements'
  },
  harvester: {
    ratePerBigha: 1500,
    ratePerHour: 1400,
    unit: 'Bigha',
    label: 'Combine Harvester'
  },
  jcb: {
    ratePerHour: 1000,
    ratePerBigha: 1400,
    unit: 'Hours',
    label: 'JCB / Earthmovers'
  },
  truck: {
    baseLoadingCharge: 500,
    ratePerKm: 50,
    unit: 'Km',
    label: 'Trucks / Tractor-Trolleys'
  }
};

export function PricingProvider({ children }) {
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('krishi_pricing_rates');
    return saved ? JSON.parse(saved) : INITIAL_RATES;
  });

  useEffect(() => {
    localStorage.setItem('krishi_pricing_rates', JSON.stringify(rates));
  }, [rates]);

  // Update rates from Admin
  const updateRates = (newRates) => {
    setRates(prev => ({
      ...prev,
      ...newRates
    }));
  };

  // Reset to default
  const resetToDefaultRates = () => {
    setRates(INITIAL_RATES);
  };

  /**
   * Universal Dynamic Fare Calculator supporting any land unit or time metric
   */
  const calculateFare = ({
    machineryType = 'tractor',
    quantity = 1,
    unit = 'bigha',
    bigha = null,
    hours = null,
    distanceKm = 10
  }) => {
    const effectiveQty = Math.max(0.1, Number(quantity ?? bigha ?? hours) || 1);

    // 1. Truck / Transport calculation
    if (machineryType === 'truck' || unit === 'km') {
      const base = rates.truck?.baseLoadingCharge || 500;
      const perKm = rates.truck?.ratePerKm || 50;
      const km = Math.max(1, Number(distanceKm || effectiveQty));
      const total = base + (km * perKm);
      return {
        total,
        unitName: 'Km',
        quantity: km,
        ratePerUnit: perKm,
        baseCharge: base,
        breakdownText: `₹${base} (Base) + (${km} Km × ₹${perKm})`,
        formulaText: `Estimated Price = ₹${base} + (${km} Km × ₹${perKm})`
      };
    }

    // 2. Hourly Rate calculation
    if (unit === 'hours' || machineryType === 'jcb') {
      const baseHourlyRate = rates[machineryType]?.ratePerHour || 1000;
      const total = Math.round(effectiveQty * baseHourlyRate);
      return {
        total,
        unitName: 'Hours',
        quantity: effectiveQty,
        ratePerUnit: baseHourlyRate,
        breakdownText: `${effectiveQty} Hours × ₹${baseHourlyRate}/hr`,
        formulaText: `Estimated Price = ${effectiveQty} Hours × ₹${baseHourlyRate}`
      };
    }

    // 3. Multi-Unit Farmland Area calculation (Bigha, Acre, Hectare, Biswa, Guntha, Kanal)
    const baseRatePerBigha = rates[machineryType]?.ratePerBigha || (machineryType === 'harvester' ? 1500 : 1300);
    const multiplier = UNIT_CONVERSIONS_TO_BIGHA[unit] || 1.0;
    
    // Convert rate according to chosen unit
    const ratePerChosenUnit = Math.round(baseRatePerBigha * multiplier);
    const total = Math.round(effectiveQty * ratePerChosenUnit);

    const unitMeta = SUPPORTED_QUANTITY_UNITS.find(u => u.id === unit) || SUPPORTED_QUANTITY_UNITS[0];

    // Equivalent conversion hint
    const equivBigha = Math.round(effectiveQty * multiplier * 100) / 100;

    return {
      total,
      unitName: unitMeta.labelEn,
      unitNameHi: unitMeta.labelHi,
      quantity: effectiveQty,
      ratePerUnit: ratePerChosenUnit,
      equivBigha: equivBigha,
      breakdownText: `${effectiveQty} ${unitMeta.labelEn} × ₹${ratePerChosenUnit}`,
      formulaText: `Estimated Price = ${effectiveQty} ${unitMeta.labelEn} × ₹${ratePerChosenUnit} (≈ ${equivBigha} Bigha)`
    };
  };

  return (
    <PricingContext.Provider value={{ rates, updateRates, resetToDefaultRates, calculateFare }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error('usePricing must be used within PricingProvider');
  return ctx;
}
