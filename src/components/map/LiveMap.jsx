import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { generateNearbyDrivers, generateFarmPlotPolygon, calculateDistanceKm } from '../../utils/geoUtils';
import { useRealtimeSync } from '../../context/RealtimeSyncContext';
import { Layers, Crosshair, Navigation2, Compass, Radio } from 'lucide-react';

// Tile Layer URLs
const MAP_LAYERS = {
  standard: {
    name: 'Road Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19
  }
};

// Calculate rotation angle (heading) between two coordinates
function calculateBearing(startLat, startLng, endLat, endLng) {
  const y = Math.sin((endLng - startLng) * Math.PI / 180) * Math.cos(endLat * Math.PI / 180);
  const x =
    Math.cos(startLat * Math.PI / 180) * Math.sin(endLat * Math.PI / 180) -
    Math.sin(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) * Math.cos((endLng - startLng) * Math.PI / 180);
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return bearing;
}

// Compact, modern, professional SVG / DivIcon generator for map markers
const createCustomIcon = (emoji, label, color = '#15803d', isLive = false, rotation = 0) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex flex-col items-center">
        ${isLive ? `<div class="absolute -top-1 w-9 h-9 bg-emerald-500/30 rounded-full animate-ping pointer-events-none"></div>` : ''}
        <div 
          class="w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-md border-2 border-white transition-all transform hover:scale-110" 
          style="background-color: ${color}; transform: rotate(${rotation}deg);"
        >
          <span>${emoji}</span>
        </div>
        ${label ? `<span class="mt-0.5 px-2 py-0.5 text-[9px] font-black bg-stone-900/90 text-white shadow-md rounded-md border border-stone-700/80 whitespace-nowrap backdrop-blur-md">${label}</span>` : ''}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export default function LiveMap({
  farmerLocation = null,
  driverPos = null,
  routeWaypoints = [],
  activeVehicleType = 'tractor',
  showNearbyDrivers = true,
  bookingStatus = 'idle',
  isDriverView = false,
  onLocationDetected = null,
  className = 'h-[300px] w-full rounded-2xl'
}) {
  const { onlineFleet } = useRealtimeSync();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const userGpsCircleRef = useRef(null);
  const routePolylineRef = useRef(null);
  const nearbyMarkersLayerRef = useRef(null);

  const [activeLayerType, setActiveLayerType] = useState('standard');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const prevDriverPosRef = useRef(driverPos);

  // Compute map center: If driver view and not booked, center on driver. Else center on farm.
  const center = (isDriverView && !farmerLocation && driverPos) 
    ? driverPos 
    : (farmerLocation || driverPos || { lat: 26.8467, lng: 80.9462 });

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    const tileLayer = L.tileLayer(MAP_LAYERS.standard.url, {
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layers (Standard vs Satellite)
  const toggleMapLayer = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const nextType = activeLayerType === 'standard' ? 'satellite' : 'standard';
    setActiveLayerType(nextType);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(MAP_LAYERS[nextType].url, {
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  };

  // Browser Real GPS Geolocation Trigger
  const handleDetectLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsAccuracy(Math.round(accuracy));

        const map = mapInstanceRef.current;
        if (map) {
          map.setView([latitude, longitude], 16, { animate: true });

          if (userGpsCircleRef.current) {
            map.removeLayer(userGpsCircleRef.current);
          }
          const circle = L.circle([latitude, longitude], {
            radius: Math.max(accuracy, 25),
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1.5
          }).addTo(map);
          userGpsCircleRef.current = circle;
        }

        if (onLocationDetected) {
          onLocationDetected({ lat: latitude, lng: longitude, accuracy });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS location permission denied or error:', err);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([center.lat, center.lng], 15, { animate: true });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Render Markers on Map dynamically based on Farmer vs Driver view
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (nearbyMarkersLayerRef.current) {
      map.removeLayer(nearbyMarkersLayerRef.current);
    }

    const newLayerGroup = L.layerGroup().addTo(map);
    nearbyMarkersLayerRef.current = newLayerGroup;

    // 1. IDLE DRIVER VIEW: Show ONLY Driver's Own Location & Radar Pulse (NO FAKE FARM)
    if (isDriverView && (bookingStatus === 'idle' || bookingStatus === 'offline')) {
      const dPos = driverPos || center;
      
      // Radar coverage radius circle (5 km operating zone)
      L.circle([dPos.lat, dPos.lng], {
        radius: 1200,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(newLayerGroup).bindPopup('<b>Driver Operating Radar</b><br>Active 5 km booking coverage');

      // Driver Vehicle Pin
      const vehicleEmoji = activeVehicleType === 'jcb' ? '🏗️' : activeVehicleType === 'harvester' ? '🌾' : '🚜';
      const myDriverIcon = createCustomIcon(vehicleEmoji, 'My Location (चालक)', '#2563eb', true);
      L.marker([dPos.lat, dPos.lng], { icon: myDriverIcon })
        .addTo(newLayerGroup)
        .bindPopup('<b>Your Tractor/Vehicle</b><br>GPS Radar Online');

      map.setView([dPos.lat, dPos.lng], 15);
      return;
    }

    // 2. FARMER VIEW: Show Farmer Field Boundary & All Nearby Active Drivers!
    if (farmerLocation) {
      // Draw Khet (Farmland Polygon boundary)
      const khetPolygonCoords = (farmerLocation.polygonCoords && farmerLocation.polygonCoords.length >= 3)
        ? farmerLocation.polygonCoords
        : generateFarmPlotPolygon(farmerLocation.lat, farmerLocation.lng, farmerLocation.bigha || farmerLocation.areaBigha || 3.0);

      L.polygon(khetPolygonCoords, {
        color: '#10b981',
        weight: 2,
        fillColor: '#34d399',
        fillOpacity: activeLayerType === 'satellite' ? 0.35 : 0.18,
        dashArray: '4, 4'
      }).addTo(newLayerGroup).bindPopup('<b>खेत सीमा (Farm Boundary)</b><br>GPS Cultivation Zone');

      // Add Farmer Pin
      const farmerIcon = createCustomIcon('🌾', 'आपका खेत', '#059669');
      L.marker([farmerLocation.lat, farmerLocation.lng], { icon: farmerIcon })
        .addTo(newLayerGroup)
        .bindPopup('<b>आपका खेत (Farm Location)</b><br>GPS Locked');
    }

    // 3. SHOW NEARBY DRIVERS ACROSS THE FLEET ON FARMER VIEW
    if (showNearbyDrivers && (bookingStatus === 'idle' || bookingStatus === 'searching')) {
      const fleetToRender = (onlineFleet && onlineFleet.length > 0) 
        ? onlineFleet.filter(d => d.status === 'online') 
        : generateNearbyDrivers(center.lat, center.lng);

      fleetToRender.forEach(drv => {
        const iconEmoji = drv.vehicleType === 'tractor' ? '🚜' : drv.vehicleType === 'jcb' ? '🏗️' : drv.vehicleType === 'harvester' ? '🌾' : '🚚';
        const color = drv.vehicleType === 'tractor' ? '#2563eb' : drv.vehicleType === 'jcb' ? '#d97706' : '#7c3aed';
        
        // Calculate distance from farm to this driver
        const distFromFarm = calculateDistanceKm(center.lat, center.lng, drv.lat, drv.lng);
        const distLabel = `~${distFromFarm} km`;

        const marker = L.marker([drv.lat || (center.lat + 0.008), drv.lng || (center.lng + 0.007)], {
          icon: createCustomIcon(iconEmoji, `${drv.name.split(' ')[0]} (${distLabel})`, color, false)
        }).addTo(newLayerGroup);

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 2px;">
            <b style="color: #0f172a; font-size: 12px;">${drv.modelName || 'Mahindra 575 DI'}</b><br/>
            <span style="font-size: 11px; color: #475569;">${drv.name} • ⭐ ${drv.rating || 4.9}</span><br/>
            <span style="font-weight: 700; color: #059669; font-size: 11px;">📍 ${distLabel} away • Ready for Dispatch</span>
          </div>
        `);
      });
    }
  }, [center.lat, center.lng, farmerLocation, isDriverView, showNearbyDrivers, bookingStatus, activeLayerType, onlineFleet, driverPos, activeVehicleType]);

  // Update Route Polyline with sleek glowing path
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeWaypoints && routeWaypoints.length > 0 && (bookingStatus === 'accepted' || isDriverView)) {
      const latlngs = routeWaypoints.map(pt => [pt.lat, pt.lng]);
      const polyline = L.polyline(latlngs, {
        color: '#10b981',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '8, 6'
      }).addTo(map);

      routePolylineRef.current = polyline;
    }
  }, [routeWaypoints, bookingStatus, isDriverView]);

  // Update Moving Driver Marker during active ride tracking
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !driverPos || bookingStatus === 'searching' || (!isDriverView && bookingStatus === 'idle')) return;

    let rotation = 0;
    if (prevDriverPosRef.current) {
      rotation = calculateBearing(
        prevDriverPosRef.current.lat,
        prevDriverPosRef.current.lng,
        driverPos.lat,
        driverPos.lng
      );
    }
    prevDriverPosRef.current = driverPos;

    const emoji = activeVehicleType === 'jcb' ? '🏗️' : activeVehicleType === 'harvester' ? '🌾' : '🚜';
    const driverIcon = createCustomIcon(emoji, isDriverView ? 'Your Vehicle' : 'चालक (En Route)', '#2563eb', true, rotation);

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
      driverMarkerRef.current.setIcon(driverIcon);
    } else {
      const marker = L.marker([driverPos.lat, driverPos.lng], { icon: driverIcon }).addTo(map);
      marker.bindPopup('<b>चालक लाइव लोकेशन (Driver GPS)</b><br>Real-Time Telemetry');
      driverMarkerRef.current = marker;
    }
  }, [driverPos, bookingStatus, activeVehicleType, isDriverView]);

  return (
    <div className="relative group overflow-hidden rounded-2xl shadow-inner">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className={className} />

      {/* Floating Modern Micro-Controls (Top Right & Bottom Left) */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-md p-1 rounded-xl border border-stone-700/80 shadow-md">
        <button
          onClick={toggleMapLayer}
          className="px-2.5 py-1 rounded-lg text-[10px] font-black text-stone-200 hover:text-white hover:bg-stone-800 transition flex items-center gap-1"
          title="Toggle Road vs Satellite Map"
        >
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>{activeLayerType === 'standard' ? 'Satellite' : 'Road'}</span>
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5">
        <button
          onClick={handleDetectLiveGPS}
          disabled={isLocating}
          className="px-2.5 py-1 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-[10px] font-black border border-stone-700 backdrop-blur-md shadow-md flex items-center gap-1 transition active:scale-95"
          title="Detect device GPS location"
        >
          <Crosshair className={`w-3 h-3 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locking...' : 'My GPS'}</span>
        </button>
      </div>

    </div>
  );
}
