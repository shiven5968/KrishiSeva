import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PAN_INDIA_REGIONS, 
  SEARCHABLE_AGRO_HUBS, 
  resolveLocationToAgroZone 
} from '../utils/panIndiaAgroPricing';

const PricingContext = createContext();

export { PAN_INDIA_REGIONS, SEARCHABLE_AGRO_HUBS, resolveLocationToAgroZone };

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

// Baseline Reference Rates (UP Purvanchal / Central UP Baseline = 1.0x)
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

// Aliased for legacy compatibility with any legacy imports
export const REGIONAL_AGRO_ZONES = PAN_INDIA_REGIONS.map(r => ({
  id: r.id,
  nameEn: `${r.state} - ${r.regionNameEn}`,
  nameHi: `${r.stateHi} - ${r.regionNameHi}`,
  state: r.state,
  multiplier: r.multiplier,
  tag: r.tag,
  description: r.crops
}));

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
export function calculateDynamicRates(zoneId = 'up_central_purvanchal', seasonId = 'normal_cycle') {
  const zone = PAN_INDIA_REGIONS.find(z => z.id === zoneId) || PAN_INDIA_REGIONS[1];
  const season = SEASONAL_CROP_CYCLES.find(s => s.id === seasonId) || SEASONAL_CROP_CYCLES[0];
  
  const combinedMultiplier = Number((zone.multiplier * season.surgeMultiplier).toFixed(3));

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
      ratePerHour: Math.round(BASELINE_REFERENCE_RATES.jcb.ratePerHour * combinedMultiplier),
      ratePerBigha: Math.round(BASELINE_REFERENCE_RATES.jcb.ratePerBigha * combinedMultiplier)
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
    return localStorage.getItem('krishi_selected_zone') || 'up_central_purvanchal';
  });

  const [selectedSeasonId, setSelectedSeasonId] = useState(() => {
    return localStorage.getItem('krishi_selected_season') || 'normal_cycle';
  });

  // Active Pan-India Location with full state and micro-region context
  const [activeLocation, setActiveLocation] = useState(() => {
    const savedLoc = localStorage.getItem('krishi_active_location');
    if (savedLoc) {
      try {
        return JSON.parse(savedLoc);
      } catch (e) {}
    }
    return resolveLocationToAgroZone('Lucknow, Uttar Pradesh');
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
    localStorage.setItem('krishi_active_location', JSON.stringify(activeLocation));
  }, [activeLocation]);

  useEffect(() => {
    localStorage.setItem('krishi_pricing_rates', JSON.stringify(rates));
  }, [rates]);

  // Universal Location Resolver Hook method
  const resolveAndSetLocation = (queryOrCoords) => {
    const resolved = resolveLocationToAgroZone(queryOrCoords);
    setActiveLocation(resolved);
    setSelectedZoneId(resolved.region.id);
    const computedRates = calculateDynamicRates(resolved.region.id, selectedSeasonId);
    setRates(computedRates);
    return resolved;
  };

  // Apply Region & Season Preset with single trigger
  const applyRegionalAndSeasonalSurge = (zoneId, seasonId = selectedSeasonId) => {
    setSelectedZoneId(zoneId);
    setSelectedSeasonId(seasonId);
    const targetRegion = PAN_INDIA_REGIONS.find(r => r.id === zoneId) || PAN_INDIA_REGIONS[1];
    setActiveLocation(prev => ({
      ...prev,
      region: targetRegion,
      state: targetRegion.state,
      district: targetRegion.sampleDistricts[0],
      multiplier: targetRegion.multiplier,
      tag: targetRegion.tag,
      zoneGroup: targetRegion.zoneGroup,
      crops: targetRegion.crops,
      lat: targetRegion.center.lat,
      lng: targetRegion.center.lng
    }));
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
    setSelectedZoneId('up_central_purvanchal');
    setSelectedSeasonId('normal_cycle');
    const defaultLoc = resolveLocationToAgroZone('Lucknow, Uttar Pradesh');
    setActiveLocation(defaultLoc);
    const defaultRates = calculateDynamicRates('up_central_purvanchal', 'normal_cycle');
    setRates(defaultRates);
  };

  /**
   * Universal Dynamic Fare Calculator supporting any land unit or time metric
   * Formula: Rate = Baseline Rate × Regional Multiplier × Selected Farmland Area
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
        regionalMultiplier: rates.combinedMultiplier || 1.0,
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
        regionalMultiplier: rates.combinedMultiplier || 1.0,
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
      regionalMultiplier: rates.combinedMultiplier || 1.0,
      breakdownText: `${effectiveQty} ${unitMeta.labelEn} × ₹${ratePerChosenUnit}`,
      formulaText: `Estimated Price = ${effectiveQty} ${unitMeta.labelEn} × ₹${ratePerChosenUnit} (≈ ${equivBigha} Bigha)`
    };
  };

  return (
    <PricingContext.Provider value={{ 
      rates, 
      selectedZoneId,
      selectedSeasonId,
      activeLocation,
      allPanIndiaRegions: PAN_INDIA_REGIONS,
      searchableHubs: SEARCHABLE_AGRO_HUBS,
      resolveAndSetLocation,
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
