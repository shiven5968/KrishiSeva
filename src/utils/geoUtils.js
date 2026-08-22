// Geolocation & Mapping utilities for rural navigation

// Default fallback coordinates: fertile agricultural zone near Lucknow / Punjab / MP
export const DEFAULT_FARM_LOCATION = {
  lat: 26.8467,
  lng: 80.9462,
  address: 'Khet #14, Gram Panchayat Rampur, Block Malihabad',
  areaName: 'Rampur Khet'
};

// Calculate distance between two coordinates in kilometers (Haversine Formula)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Calculate Farmland Polygon Area in Bighas & Acres from coordinate array
export function calculatePolygonAreaBighas(points) {
  if (!points || points.length < 3) return 0;
  
  const R = 6378137; // Earth radius in meters
  const meanLat = points.reduce((sum, p) => sum + (p.lat || p[0]), 0) / points.length;
  const latFactor = (Math.PI / 180) * R;
  const lngFactor = (Math.PI / 180) * R * Math.cos(meanLat * Math.PI / 180);

  let areaM2 = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];

    const x1 = (p1.lng ?? p1[1]) * lngFactor;
    const y1 = (p1.lat ?? p1[0]) * latFactor;
    const x2 = (p2.lng ?? p2[1]) * lngFactor;
    const y2 = (p2.lat ?? p2[0]) * latFactor;

    areaM2 += (x1 * y2) - (x2 * y1);
  }
  areaM2 = Math.abs(areaM2) / 2;

  // 1 Bigha (standard PUCA) ~ 2500 sq meters (~0.62 acres)
  const bighas = parseFloat((areaM2 / 2500).toFixed(1));
  const acres = parseFloat((areaM2 / 4046.86).toFixed(1));

  return {
    areaM2: Math.round(areaM2),
    bighas: Math.max(0.5, bighas),
    acres: Math.max(0.3, acres)
  };
}

// Get center centroid from polygon coordinate array
export function getPolygonCentroid(points) {
  if (!points || points.length === 0) return DEFAULT_FARM_LOCATION;
  const sumLat = points.reduce((sum, p) => sum + (p.lat ?? p[0]), 0);
  const sumLng = points.reduce((sum, p) => sum + (p.lng ?? p[1]), 0);
  return {
    lat: parseFloat((sumLat / points.length).toFixed(6)),
    lng: parseFloat((sumLng / points.length).toFixed(6))
  };
}

// Generate realistic intermediate waypoints along a rural road path
export function generateRouteWaypoints(start, end, numPoints = 25) {
  const points = [];
  const latStep = (end.lat - start.lat) / (numPoints - 1);
  const lngStep = (end.lng - start.lng) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    // Add subtle curvature to simulate rural tractor tracks / unpaved khet lanes
    const progress = i / (numPoints - 1);
    const wobble = Math.sin(progress * Math.PI) * 0.0018 * (i % 2 === 0 ? 1 : -0.8);
    
    points.push({
      lat: start.lat + latStep * i + wobble,
      lng: start.lng + lngStep * i + (wobble * 0.7)
    });
  }
  points[points.length - 1] = { lat: end.lat, lng: end.lng };
  return points;
}

// Generate random nearby driver positions around farmer's field
export function generateNearbyDrivers(centerLat, centerLng) {
  const drivers = [
    {
      id: 'drv_1',
      name: 'Ramesh Singh (रमेश सिंह)',
      phone: '+91 98765 43210',
      vehicleType: 'tractor',
      modelName: 'Mahindra 575 DI (50 HP)',
      vehicleNumber: 'UP-32-EK-8821',
      rating: 4.9,
      experienceYears: 8,
      status: 'online',
      verified: true,
      lat: centerLat + 0.0092,
      lng: centerLng + 0.0084,
      heading: 45,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      ratePerHour: 750,
      ratePerAcre: 850
    },
    {
      id: 'drv_2',
      name: 'Gurpreet Brar (गुरप्रीत सिंह)',
      phone: '+91 98123 77410',
      vehicleType: 'harvester',
      modelName: 'Preet 987 Combine (110 HP)',
      vehicleNumber: 'PB-10-CZ-4512',
      rating: 4.8,
      experienceYears: 12,
      status: 'online',
      verified: true,
      lat: centerLat - 0.0125,
      lng: centerLng + 0.0095,
      heading: 180,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      ratePerHour: 1600,
      ratePerAcre: 1800
    },
    {
      id: 'drv_3',
      name: 'Mukesh Yadav (मुकेश यादव)',
      phone: '+91 94550 91823',
      vehicleType: 'jcb',
      modelName: 'JCB 3DX Super 4WD',
      vehicleNumber: 'UP-32-BZ-9011',
      rating: 4.95,
      experienceYears: 6,
      status: 'online',
      verified: true,
      lat: centerLat + 0.0065,
      lng: centerLng - 0.0112,
      heading: 90,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      ratePerHour: 1200,
      ratePerAcre: 1400
    },
    {
      id: 'drv_4',
      name: 'Balwinder Dhillon (बलविंदर)',
      phone: '+91 97788 12345',
      vehicleType: 'truck',
      modelName: 'Tata LPT 1613 Tipper (10 Ton)',
      vehicleNumber: 'PB-08-AX-6009',
      rating: 4.7,
      experienceYears: 15,
      status: 'online',
      verified: true,
      lat: centerLat - 0.0088,
      lng: centerLng - 0.0076,
      heading: 270,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      ratePerHour: 950,
      ratePerAcre: 600
    }
  ];
  return drivers;
}

// Generate Khet (Farm Plot) polygon coordinates for visual agriculture boundary
export function generateFarmPlotPolygon(centerLat, centerLng) {
  const delta = 0.0035;
  return [
    [centerLat + delta, centerLng - delta * 1.3],
    [centerLat + delta * 1.1, centerLng + delta * 1.1],
    [centerLat - delta * 0.9, centerLng + delta * 1.4],
    [centerLat - delta * 1.2, centerLng - delta * 0.8]
  ];
}
