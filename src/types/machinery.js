export const PRICING_CONFIG = {
  tractor: {
    pricingType: 'area',
    unitKey: 'bigha',
    unitName: 'Bigha',
    ratePerUnit: 1300,
    rateDescription: '₹1300 / Bigha',
    formulaText: 'Estimated Price = Number of Bighas × ₹1300'
  },
  harvester: {
    pricingType: 'area',
    unitKey: 'bigha',
    unitName: 'Bigha',
    ratePerUnit: 1500,
    rateDescription: '₹1500 / Bigha',
    formulaText: 'Estimated Price = Number of Bighas × ₹1500'
  },
  jcb: {
    pricingType: 'time',
    unitKey: 'hours',
    unitName: 'Hours',
    ratePerUnit: 1000,
    rateDescription: '₹1000 / Hour',
    formulaText: 'Estimated Price = Number of Hours × ₹1000'
  },
  truck: {
    pricingType: 'distance',
    unitKey: 'km',
    unitName: 'Kilometers',
    baseLoadingCharge: 500,
    ratePerKm: 50,
    rateDescription: '₹500 Base + ₹50 / Km',
    formulaText: 'Estimated Price = ₹500 + (Distance in Km × ₹50)'
  }
};

export const MOCK_DROP_LOCATIONS = [
  { id: 'loc_1', name: 'Krishi Mandi / APMC Grain Market', distanceKm: 14, district: 'Malihabad Mandi', tag: 'High Volume' },
  { id: 'loc_2', name: 'Regional Cold Storage & Silo', distanceKm: 22, district: 'Kakori Complex', tag: 'Perishable Hub' },
  { id: 'loc_3', name: 'District Grain Warehouse / FCI Godown', distanceKm: 8, district: 'Bakshi Ka Talab', tag: 'Govt Depot' },
  { id: 'loc_4', name: 'Local Flour & Oil Processing Mill', distanceKm: 5, district: 'Gram Samiti', tag: 'Direct Buyer' },
  { id: 'loc_5', name: 'Custom Field Distance (अपनी दूरी दर्ज करें)', distanceKm: 10, district: 'Custom Field', tag: 'Flexible' }
];

export const MACHINERY_CATEGORIES = [
  {
    id: 'tractor',
    nameKey: 'tractor',
    title: 'High-Power Tractor & Implements',
    hindiTitle: 'ट्रैक्टर एवं जुताई उपकरण',
    icon: '🚜',
    tagline: 'Deep Tillage, Cultivation, Rotavating & Seeding',
    pricingType: 'area',
    rateSummary: '₹1300 / Bigha',
    requiresAttachment: true,
    hp: '45 - 65 HP 4WD',
    fuel: 'Diesel Direct Injection',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80',
    badge: 'Fastest Response • 8 mins',
    models: ['Mahindra 575 DI (50 HP)', 'Sonalika Tiger 55 (55 HP)', 'John Deere 5310 (55 HP)', 'Swaraj 855 FE (52 HP)'],
    attachments: [
      {
        id: 'rotavator',
        nameKey: 'rotavator',
        descKey: 'rotavatorDesc',
        icon: '⚙️',
        popular: true,
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'plough',
        nameKey: 'plough',
        descKey: 'ploughDesc',
        icon: '⛏️',
        popular: false,
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'cultivator',
        nameKey: 'cultivator',
        descKey: 'cultivatorDesc',
        icon: '🌾',
        popular: false,
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'seedDrill',
        nameKey: 'seedDrill',
        descKey: 'seedDrillDesc',
        icon: '🌱',
        popular: true,
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'laserLeveler',
        nameKey: 'laserLeveler',
        descKey: 'laserLevelerDesc',
        icon: '📡',
        popular: false,
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'trolley',
        nameKey: 'trolley',
        descKey: 'trolleyDesc',
        icon: '🚛',
        popular: false,
        image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&auto=format&fit=crop&q=60'
      }
    ]
  },
  {
    id: 'harvester',
    nameKey: 'harvester',
    title: 'Self-Propelled Combine Harvester',
    hindiTitle: 'कंबाइन हार्वेस्टर (फसल कटाई)',
    icon: '🌾',
    tagline: 'High-speed Wheat, Paddy, Mustard & Multi-crop Harvesting',
    pricingType: 'area',
    rateSummary: '₹1500 / Bigha',
    requiresAttachment: true,
    hp: '101 - 130 HP Turbocharged',
    fuel: 'High Capacity Diesel Tank',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    badge: 'Grain Loss < 1% Guaranteed',
    models: ['Preet 987 Heavy Combine', 'Standard 412 Multi-crop', 'John Deere W70', 'Kartar 4000'],
    attachments: [
      {
        id: 'harvesterWheat',
        nameKey: 'harvesterWheat',
        descKey: 'harvesterWheat',
        icon: '🌾',
        popular: true,
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'harvesterPaddy',
        nameKey: 'harvesterPaddy',
        descKey: 'harvesterPaddy',
        icon: '🍚',
        popular: true,
        image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'harvesterMulti',
        nameKey: 'harvesterMulti',
        descKey: 'harvesterMulti',
        icon: '🌱',
        popular: false,
        image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=400&auto=format&fit=crop&q=60'
      }
    ]
  },
  {
    id: 'jcb',
    nameKey: 'jcb',
    title: 'Heavy Earthmover & Backhoe Loader',
    hindiTitle: 'जेसीबी / अर्थमूवर (खुदाई व समतलीकरण)',
    icon: '🏗️',
    tagline: 'Farm Pond Excavation, Drainage Channels, Field Bunding & Grading',
    pricingType: 'time',
    rateSummary: '₹1000 / Hour',
    requiresAttachment: true,
    hp: '76 - 92 HP Heavy Hydraulic',
    fuel: 'EcoMAX Diesel',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
    badge: 'Precision Laser Grading',
    models: ['JCB 3DX Super Plus', 'CAT 424B2 Heavy Duty', 'Mahindra EarthMaster VX'],
    attachments: [
      {
        id: 'jcbBucket',
        nameKey: 'jcbBucket',
        descKey: 'jcbBucket',
        icon: '🪣',
        popular: true,
        image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'jcbTrench',
        nameKey: 'jcbTrench',
        descKey: 'jcbTrench',
        icon: '📐',
        popular: false,
        image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'jcbBreaker',
        nameKey: 'jcbBreaker',
        descKey: 'jcbBreaker',
        icon: '🔨',
        popular: false,
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=400&auto=format&fit=crop&q=60'
      }
    ]
  },
  {
    id: 'truck',
    nameKey: 'truck',
    title: 'Agricultural Transport & Heavy Logistics',
    hindiTitle: 'कृषि माल ढुलाई ट्रक व ट्रॉली',
    icon: '🚚',
    tagline: 'Mandi Transport, Fertilizer & Bulk Grain Delivery directly to Storage',
    pricingType: 'distance',
    rateSummary: '₹500 + ₹50 / Km',
    requiresAttachment: true,
    hp: '130 - 180 HP Heavy Haul',
    fuel: 'Direct Common Rail Diesel',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
    badge: 'Tarp Covered • Weatherproof',
    models: ['Tata LPT 1613 (10 Ton)', 'Ashok Leyland Ecomet 1215', 'Eicher Pro 3015'],
    attachments: [
      {
        id: 'truck10Ton',
        nameKey: 'truck10Ton',
        descKey: 'truck10Ton',
        icon: '🚛',
        popular: true,
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'truckMini',
        nameKey: 'truckMini',
        descKey: 'truckMini',
        icon: '🛻',
        popular: false,
        image: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=400&auto=format&fit=crop&q=60'
      },
      {
        id: 'truckGrain',
        nameKey: 'truckGrain',
        descKey: 'truckGrain',
        icon: '📦',
        popular: false,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=60'
      }
    ]
  }
];

// Calculation Function
export function calculateStaticFare({ machineryType, bigha = 1, hours = 1, distanceKm = 10 }) {
  const config = PRICING_CONFIG[machineryType] || PRICING_CONFIG.tractor;

  if (config.pricingType === 'area') {
    const qty = Math.max(1, Number(bigha) || 1);
    const total = qty * config.ratePerUnit;
    return {
      pricingType: 'area',
      quantity: qty,
      unitName: 'Bigha',
      ratePerUnit: config.ratePerUnit,
      baseCharge: 0,
      total,
      breakdownText: `${qty} Bigha × ₹${config.ratePerUnit}`,
      disclaimer: 'Final price may vary slightly based on actual work done or time taken.'
    };
  }

  if (config.pricingType === 'time') {
    const qty = Math.max(1, Number(hours) || 1);
    const total = qty * config.ratePerUnit;
    return {
      pricingType: 'time',
      quantity: qty,
      unitName: 'Hours',
      ratePerUnit: config.ratePerUnit,
      baseCharge: 0,
      total,
      breakdownText: `${qty} Hours × ₹${config.ratePerUnit}`,
      disclaimer: 'Final price may vary slightly based on actual work done or time taken.'
    };
  }

  if (config.pricingType === 'distance') {
    const km = Math.max(1, Number(distanceKm) || 1);
    const distanceCost = km * config.ratePerKm;
    const total = config.baseLoadingCharge + distanceCost;
    return {
      pricingType: 'distance',
      quantity: km,
      unitName: 'Km',
      ratePerUnit: config.ratePerKm,
      baseCharge: config.baseLoadingCharge,
      total,
      breakdownText: `₹${config.baseLoadingCharge} (Base) + (${km} Km × ₹${config.ratePerKm})`,
      disclaimer: 'Final price may vary slightly based on actual work done or time taken.'
    };
  }

  return { total: 1300, breakdownText: '₹1300', disclaimer: 'Final price may vary slightly based on actual work done or time taken.' };
}
