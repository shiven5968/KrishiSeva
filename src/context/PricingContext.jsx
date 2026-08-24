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

// Baseline Reference Rates (UP Purvanchal / Central UP Baseline)
export const BASELINE_REFERENCE_RATES = {
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

// Regional Agricultural Boom Configurations
export const REGIONAL_AGRO_ZONES = [
  {
    id: 'up_purvanchal',
    nameEn: 'UP Purvanchal & Central (Baseline)',
    nameHi: 'उत्तर प्रदेश पूर्वांचल व मध्य (आधार ₹1300)',
    state: 'Uttar Pradesh',
    agroBoomLevel: 'baseline',
    multiplier: 1.0,
    tag: 'Baseline (₹1,300/Bigha)',
    description: 'Wheat, Paddy, Mango & Sugarcane plains (Malihabad / Varanasi / Gorakhpur)'
  },
  {
    id: 'maharashtra_boom',
    nameEn: 'Maharashtra (Sugarcane & Cash Crop Boom)',
    nameHi: 'महाराष्ट्र (गन्ना व नकदी फसल बूम +18%)',
    state: 'Maharashtra',
    agroBoomLevel: 'high_boom',
    multiplier: 1.18,
    tag: 'High Boom (+18%)',
    description: 'Pune, Kolhapur, Solapur, Vidarbha - Heavy mechanization & high cash yield'
  },
  {
    id: 'punjab_haryana',
    nameEn: 'Punjab & Haryana (Granary Belt)',
    nameHi: 'पंजाब व हरियाणा (अन्न भंडार बेल्ट +15%)',
    state: 'Punjab / Haryana',
    agroBoomLevel: 'high_boom',
    multiplier: 1.15,
    tag: 'Granary Boom (+15%)',
    description: 'Ludhiana, Karnal - Intensive multi-crop harvester & turbo tractor demand'
  },
  {
    id: 'gujarat_commercial',
    nameEn: 'Gujarat (Commercial Cotton & Groundnut)',
    nameHi: 'गुजरात (व्यावसायिक कपास व मूंगफली +12%)',
    state: 'Gujarat',
    agroBoomLevel: 'moderate_boom',
    multiplier: 1.12,
    tag: 'Agro Boom (+12%)',
    description: 'Saurashtra, Rajkot - High capital commercial farm machinery'
  },
  {
    id: 'mp_central',
    nameEn: 'Madhya Pradesh (Soybean & Wheat Plateau)',
    nameHi: 'मध्य प्रदेश (सोयाबीन व गेहूं पठार +2%)',
    state: 'Madhya Pradesh',
    agroBoomLevel: 'moderate',
    multiplier: 1.02,
    tag: 'Steady Normal (1.02x)',
    description: 'Malwa plateau - Steady tractor & combine availability'
  },
  {
    id: 'bundelkhand_relief',
    nameEn: 'Bundelkhand & Dryland (Relief Zone)',
    nameHi: 'बुंदेलखंड व शुष्क क्षेत्र (राहत दर -10%)',
    state: 'UP/MP Border',
    agroBoomLevel: 'low_intensity',
    multiplier: 0.90,
    tag: 'Relief Pricing (-10%)',
    description: 'Rainfed pulses & coarse grains - Subsidized farmer friendly rates'
  },
  {
    id: 'bihar_eastern',
    nameEn: 'Bihar & Eastern Gangetic Plains',
    nameHi: 'बिहार व पूर्वी गंगा मैदान (-8%)',
    state: 'Bihar',
    agroBoomLevel: 'low_intensity',
    multiplier: 0.92,
    tag: 'Affordable Plains (-8%)',
    description: 'Smallholder high-density farms - High accessibility lower rates'
  }
];

// Seasonal Crop Cycle & Demand Surge Configurations
export const SEASONAL_CROP_CYCLES = [
  {
    id: 'rabi_harvest_peak',
    nameEn: 'Rabi Harvest Peak (Mar - May)',
    nameHi: 'रबी कटाई पीक सीजन (मार्च - मई)',
    surgeMultiplier: 1.15,
    seasonTag: '🌾 Harvest Peak Surge (+15%)',
    activeCrops: 'Wheat, Mustard, Gram, Barley',
    demandFocus: 'Harvesters & Threshers at 100% capacity'
  },
  {
    id: 'kharif_sowing_surge',
    nameEn: 'Kharif Sowing & Monsoon Prep (Jun - Aug)',
    nameHi: 'खरीफ बुवाई व मानसून तैयारी (जून - अगस्त)',
    surgeMultiplier: 1.10,
    seasonTag: '🚜 Sowing Surge (+10%)',
    activeCrops: 'Paddy (Dhaan), Maize, Cotton, Soybean',
    demandFocus: 'Rotavators, Laser Levelers & Puddlers in high demand'
  },
  {
    id: 'normal_cycle',
    nameEn: 'Normal Standard Cycle (Year-Round)',
    nameHi: 'सामान्य मानक चक्र (वर्ष भर)',
    surgeMultiplier: 1.0,
    seasonTag: '☀️ Standard Baseline (1.0x)',
    activeCrops: 'Inter-cropping, Vegetables, Regular Tillage',
    demandFocus: 'Balanced fleet distribution'
  },
  {
    id: 'winter_fallow_discount',
    nameEn: 'Winter Off-Season / Fallow (Nov - Jan)',
    nameHi: 'शीतकालीन ऑफ-सीजन छूट (नवंबर - जनवरी)',
    surgeMultiplier: 0.95,
    seasonTag: '❄️ Off-Peak Discount (-5%)',
    activeCrops: 'Early rabi maintenance & fallow prep',
    demandFocus: 'Promotional discount to keep fleet drivers busy'
  }
];

// Helper function to calculate dynamically adjusted rates based on zone and season
export function calculateDynamicRates(zoneId = 'up_purvanchal', seasonId = 'normal_cycle') {
  const zone = REGIONAL_AGRO_ZONES.find(z => z.id === zoneId) || REGIONAL_AGRO_ZONES[0];
  const season = SEASONAL_CROP_CYCLES.find(s => s.id === seasonId) || SEASONAL_CROP_CYCLES[0];
  
  const combinedMultiplier = zone.multiplier * season.surgeMultiplier;

  return {
    tractor: {
      ...BASELINE_REFERENCE_RATES.tractor,
      ratePerBigha: Math.round(BASELINE_REFERENCE_RATES.tractor.ratePerBigha * combinedMultiplier),
      ratePerHour: Math.round(BASELINE_REFERENCE_RATES.tractor.ratePerHour * combinedMultiplier)
    },
    harvester: {
      ...BASELINE_REFERENCE_RATES.harvester,
      ratePerBigha: Math.round(BASELINE_REFERENCE_RATES.harvester.ratePerBigha * combinedMultiplier),
      ratePerHour: Math.round(BASELINE_REFERENCE_RATES.harvester.ratePerHour * combinedMultiplier)
    },
    jcb: {
      ...BASELINE_REFERENCE_RATES.jcb,
      ratePerHour: Math.round(BASELINE_REFERENCE_RATES.jcb.ratePerHour * combinedMultiplier)
    },
    truck: {
      ...BASELINE_REFERENCE_RATES.truck,
      baseLoadingCharge: Math.round(BASELINE_REFERENCE_RATES.truck.baseLoadingCharge * combinedMultiplier),
      ratePerKm: Math.round(BASELINE_REFERENCE_RATES.truck.ratePerKm * combinedMultiplier)
    },
    activeZone: zone,
    activeSeason: season,
    combinedMultiplier
  };
}

export function PricingProvider({ children }) {
  const [selectedZoneId, setSelectedZoneId] = useState(() => {
    return localStorage.getItem('krishi_selected_zone') || 'up_purvanchal';
  });

  const [selectedSeasonId, setSelectedSeasonId] = useState(() => {
    return localStorage.getItem('krishi_selected_season') || 'normal_cycle';
  });

  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('krishi_pricing_rates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return calculateDynamicRates(selectedZoneId, selectedSeasonId);
  });

  useEffect(() => {
    localStorage.setItem('krishi_selected_zone', selectedZoneId);
  }, [selectedZoneId]);

  useEffect(() => {
    localStorage.setItem('krishi_selected_season', selectedSeasonId);
  }, [selectedSeasonId]);

  useEffect(() => {
    localStorage.setItem('krishi_pricing_rates', JSON.stringify(rates));
  }, [rates]);

  // Apply Region & Season Preset with single trigger
  const applyRegionalAndSeasonalSurge = (zoneId, seasonId) => {
    setSelectedZoneId(zoneId);
    setSelectedSeasonId(seasonId);
    const computed = calculateDynamicRates(zoneId, seasonId);
    setRates(computed);
  };

  // Update rates from Admin manually
  const updateRates = (newRates) => {
    setRates(prev => ({
      ...prev,
      ...newRates
    }));
  };

  // Reset to default
  const resetToDefaultRates = () => {
    setSelectedZoneId('up_purvanchal');
    setSelectedSeasonId('normal_cycle');
    const defaultRates = calculateDynamicRates('up_purvanchal', 'normal_cycle');
    setRates(defaultRates);
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
    <PricingContext.Provider value={{ 
      rates, 
      selectedZoneId,
      selectedSeasonId,
      applyRegionalAndSeasonalSurge,
      updateRates, 
      resetToDefaultRates, 
      calculateFare 
    }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error('usePricing must be used within PricingProvider');
  return ctx;
}
