import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { useSavedLands } from '../../context/SavedLandsContext';
import { useAuth } from '../../context/AuthContext';
import { 
  DEFAULT_FARM_LOCATION, 
  calculatePolygonAreaBighas, 
  getPolygonCentroid,
  generateFarmPlotPolygon 
} from '../../utils/geoUtils';
import { 
  UP_DISTRICTS, 
  fetchBhulekhLandRecord, 
  UP_HECTARE_TO_BIGHA_MULTIPLIER, 
  convertHectareToBigha 
} from '../../services/bhulekhLandService';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Wheat, 
  Layers,
  CheckCircle2,
  Crosshair,
  RotateCcw,
  Maximize2,
  Landmark,
  Search,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Calculator,
  Building2
} from 'lucide-react';

// Ultra-fast Google Maps Tile Layers (100% English, crisp worldwide)
const MAP_LAYERS = {
  standard: {
    name: 'Road Map',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    maxZoom: 20
  },
  satellite: {
    name: 'Satellite Field View',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    maxZoom: 20
  }
};

// Sub-component: Interactive GPS Farmland Boundary Drawer
function KhetBoundaryDrawer({ onBoundaryCalculated, initialLocation }) {
  const { lang } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polygonLayerRef = useRef(null);

  const [points, setPoints] = useState([]);
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [isLocating, setIsLocating] = useState(false);
  const [calculatedArea, setCalculatedArea] = useState(null);

  const center = initialLocation || DEFAULT_FARM_LOCATION;

  // Initialize Boundary Drawing Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      // Default to Satellite View for realistic farm boundary marking
      const tile = L.tileLayer(MAP_LAYERS.satellite.url, {
        maxZoom: 20,
        subdomains: MAP_LAYERS.satellite.subdomains || ['0', '1', '2', '3']
      }).addTo(map);
      tileLayerRef.current = tile;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer groups for markers & polygon
      markersGroupRef.current = L.layerGroup().addTo(map);

      // Click listener to drop boundary corner pins
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setPoints(prev => [...prev, { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) }]);
      });

      mapInstanceRef.current = map;

      const t1 = setTimeout(() => map.invalidateSize(), 50);
      const t2 = setTimeout(() => map.invalidateSize(), 200);

      let resizeObserver = null;
      if (window.ResizeObserver && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        if (resizeObserver) resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // Update Markers and Polygon whenever points change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    // Clear old markers
    markersGroupRef.current.clearLayers();

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (points.length === 0) {
      setCalculatedArea(null);
      return;
    }

    // Add marker for each corner point
    points.forEach((pt, idx) => {
      const icon = L.divIcon({
        className: 'custom-corner-marker',
        html: `<div style="background-color: #10b981; color: #000; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">${idx + 1}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([pt.lat, pt.lng], { icon }).addTo(markersGroupRef.current);
    });

    // Draw Polygon if at least 3 points exist
    if (points.length >= 3) {
      const latLngs = points.map(p => [p.lat, p.lng]);
      const polygon = L.polygon(latLngs, {
        color: '#10b981',
        weight: 3,
        fillColor: '#10b981',
        fillOpacity: 0.35,
        dashArray: '4, 4'
      }).addTo(map);

      polygonLayerRef.current = polygon;

      // Compute precise area in Bighas
      const areaInfo = calculatePolygonAreaBighas(points);
      const centroid = getPolygonCentroid(points);
      setCalculatedArea(areaInfo);

      if (onBoundaryCalculated) {
        onBoundaryCalculated({
          bigha: areaInfo.bighas,
          centroid: centroid,
          polygonCoords: points
        });
      }
    } else {
      setCalculatedArea(null);
    }
  }, [points]);

  // Toggle Satellite vs Road Layer
  const toggleLayer = () => {
    const nextLayer = activeLayer === 'satellite' ? 'standard' : 'satellite';
    setActiveLayer(nextLayer);

    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const layerDef = MAP_LAYERS[nextLayer];
      const newTile = L.tileLayer(layerDef.url, {
        maxZoom: layerDef.maxZoom || 20,
        subdomains: layerDef.subdomains || ['0', '1', '2', '3']
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTile;
    }
  };

  // Detect Farmer's Live GPS
  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Undo last corner point
  const handleUndo = () => {
    setPoints(prev => prev.slice(0, -1));
  };

  // Clear all points
  const handleReset = () => {
    setPoints([]);
    setCalculatedArea(null);
  };

  // Quick 4-Corner Preset Box
  const handlePresetBox = () => {
    const centerPt = mapInstanceRef.current ? mapInstanceRef.current.getCenter() : center;
    const box = generateFarmPlotPolygon(centerPt.lat, centerPt.lng);
    setPoints(box.map(b => ({ lat: parseFloat(b[0].toFixed(6)), lng: parseFloat(b[1].toFixed(6)) })));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'hi' ? 'खेत का दायरा मैप पर मार्क करें:' : 'Mark Farmland Boundary on Map:'}</span>
        </span>
        <span className="text-[11px] font-bold text-stone-500">
          {points.length === 0 
            ? (lang === 'hi' ? 'मैप पर 3 या 4 कोने छुएं' : 'Tap 3 or 4 corners on map')
            : `${points.length} ${lang === 'hi' ? 'कोने मार्क हुए' : 'Corners Placed'}`}
        </span>
      </div>

      <div className="relative isolate overflow-hidden rounded-2xl border-2 border-emerald-500 shadow-md h-64 w-full bg-white dark:bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black shadow-md flex items-center gap-1 transition active:scale-95"
          >
            <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? (lang === 'hi' ? 'खोज रहे हैं...' : 'Locating...') : (lang === 'hi' ? '📍 मेरा खेत GPS' : '📍 My GPS Field')}</span>
          </button>

          <button
            type="button"
            onClick={toggleLayer}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/90 text-white text-[10px] font-bold shadow-md border border-stone-700 flex items-center gap-1"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>{activeLayer === 'satellite' ? (lang === 'hi' ? '🛰️ सैटेलाइट' : '🛰️ Satellite') : (lang === 'hi' ? '🗺️ नक्शा' : '🗺️ Map')}</span>
          </button>
        </div>

        {/* Top Right: Preset Box */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={handlePresetBox}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[10px] font-black shadow-md flex items-center gap-1 transition"
            title="Auto-create rectangular 4-corner boundary"
          >
            <Sparkles className="w-3 h-3" />
            <span>{lang === 'hi' ? '✨ स्वतः 4-कोना बॉक्स' : '✨ Auto 4-Corner Box'}</span>
          </button>
        </div>

        {/* Bottom Floating Stats & Undo Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between bg-stone-950/90 backdrop-blur-md p-2 rounded-xl border border-stone-700 text-white text-xs">
          <div>
            {calculatedArea ? (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-xs">
                  📐 {calculatedArea.bighas} {lang === 'hi' ? 'बीघा' : 'Bigha'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  (~{calculatedArea.acres} {lang === 'hi' ? 'एकड़' : 'Acres'} • {calculatedArea.areaM2.toLocaleString()} m²)
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {points.length < 3 ? (lang === 'hi' ? 'कम से कम 3 कोने जोड़ें' : 'Place at least 3 corner points') : (lang === 'hi' ? 'गणना कर रहे हैं...' : 'Calculating...')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {points.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-bold text-slate-700 dark:text-slate-300"
              >
                {lang === 'hi' ? '↩ पूर्ववत' : '↩ Undo'}
              </button>
            )}
            {points.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="px-2 py-1 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 text-[10px] font-bold"
              >
                {lang === 'hi' ? 'साफ़ करें' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SavedLandsModal({ isOpen, onClose }) {
  const { lang, localize } = useLanguage();
  const { currentUser } = useAuth();
  const { savedLands, selectedLandId, setSelectedLandId, addLand, deleteLand } = useSavedLands();

  const isTenant = !!(currentUser?.isTenantFarmer || currentUser?.bataiPass?.active);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Entry Mode: 'bhulekh' (Govt Land Verification) vs 'manual' (Manual / GPS Drawing)
  const [entryMode, setEntryMode] = useState('bhulekh');

  // Govt Bhulekh Search Form States
  const [bhulekhQuery, setBhulekhQuery] = useState({
    district: 'lucknow',
    tehsil: 'Malihabad',
    village: 'Rampur',
    khasraNumber: '142'
  });

  const [isSearchingBhulekh, setIsSearchingBhulekh] = useState(false);
  const [bhulekhResult, setBhulekhResult] = useState(null);
  const [bhulekhError, setBhulekhError] = useState(null);

  // Farmland Form Data
  const [formData, setFormData] = useState({
    name: '',
    bigha: 3.0,
    cropType: 'Wheat',
    address: 'Khet near Gram Panchayat, Malihabad',
    soilType: 'Alluvial Loam',
    icon: '🌾',
    lat: DEFAULT_FARM_LOCATION.lat,
    lng: DEFAULT_FARM_LOCATION.lng,
    polygonCoords: null,
    isGovtVerified: false,
    khasraNumber: '',
    areaHectare: null,
    ulpin: ''
  });

  // Selected district tehsils list
  const activeDistrictObj = UP_DISTRICTS.find(d => d.id === bhulekhQuery.district) || UP_DISTRICTS[0];

  if (!isOpen) return null;

  // Handle District Change
  const handleDistrictChange = (districtId) => {
    const distObj = UP_DISTRICTS.find(d => d.id === districtId);
    setBhulekhQuery(prev => ({
      ...prev,
      district: districtId,
      tehsil: distObj ? distObj.tehsils[0] : ''
    }));
  };

  // Perform Government Land Verification & Auto-Fetch
  const handleFetchBhulekh = async (e) => {
    e?.preventDefault();
    if (!bhulekhQuery.khasraNumber.trim()) {
      setBhulekhError(lang === 'hi' ? 'कृपया खसरा / गाटा संख्या दर्ज करें' : 'Please enter Khasra / Gata number');
      return;
    }

    setIsSearchingBhulekh(true);
    setBhulekhError(null);
    setBhulekhResult(null);

    try {
      const res = await fetchBhulekhLandRecord(bhulekhQuery);
      if (res.success && res.record) {
        setBhulekhResult(res.record);
        
        // Auto-fill farmland details programmatically
        setFormData(prev => ({
          ...prev,
          name: lang === 'hi' ? `गाटा सं. #${res.record.khasraNumber} - ${res.record.village}` : `Gata #${res.record.khasraNumber} - ${res.record.village}`,
          bigha: res.record.areaBigha,
          address: `${res.record.village}, ${res.record.tehsil}, ${activeDistrictObj.nameEn} (#${res.record.khasraNumber})`,
          soilType: res.record.soilType,
          lat: res.record.lat || DEFAULT_FARM_LOCATION.lat,
          lng: res.record.lng || DEFAULT_FARM_LOCATION.lng,
          isGovtVerified: true,
          khasraNumber: res.record.khasraNumber,
          areaHectare: res.record.areaHectare,
          ulpin: res.record.ulpin
        }));
      } else {
        setBhulekhError(res.error || (lang === 'hi' ? 'भूलेख रिकॉर्ड नहीं मिला।' : 'Land record not found.'));
      }
    } catch (err) {
      setBhulekhError(lang === 'hi' ? 'सर्वर से संपर्क नहीं हो सका।' : 'Could not connect to government server.');
    } finally {
      setIsSearchingBhulekh(false);
    }
  };

  // Callback when user draws boundary on the interactive map
  const handleBoundaryCalculated = (boundaryInfo) => {
    setFormData(prev => ({
      ...prev,
      bigha: boundaryInfo.bigha,
      lat: boundaryInfo.centroid.lat,
      lng: boundaryInfo.centroid.lng,
      polygonCoords: boundaryInfo.polygonCoords
    }));
  };

  // Save Land to Portfolio
  const handleSaveLand = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    addLand(formData);
    
    // Reset Form
    setFormData({
      name: '',
      bigha: 3.0,
      cropType: 'Wheat',
      address: 'Khet near Gram Panchayat, Malihabad',
      soilType: 'Alluvial Loam',
      icon: '🌾',
      lat: DEFAULT_FARM_LOCATION.lat,
      lng: DEFAULT_FARM_LOCATION.lng,
      polygonCoords: null,
      isGovtVerified: false,
      khasraNumber: '',
      areaHectare: null,
      ulpin: ''
    });
    setBhulekhResult(null);
    setIsAddingNew(false);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1E14]/65 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FDFBF7] rounded-[2rem] max-w-3xl w-full p-6 sm:p-8 shadow-[0_25px_60px_rgba(11,30,20,0.25)] border border-[#0B1E14]/10 relative max-h-[90vh] overflow-y-auto space-y-6 text-[#0B1E14]"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#0B1E14]/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A4F32]/10 text-[#1A4F32] flex items-center justify-center text-2xl shrink-0 border border-[#1A4F32]/15">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#0B1E14] tracking-tight">
                  {lang === 'hi' ? 'मेरे सहेजे गए खेत' : 'My Saved Farmlands'}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1A4F32]/10 text-[#1A4F32] border border-[#1A4F32]/20">
                  {lang === 'hi' ? 'भूलेख इंटीग्रेटेड' : 'Govt Bhulekh Integrated'}
                </span>
              </div>
              <p className="text-[#4F6358] text-xs font-medium mt-0.5">
                {lang === 'hi' ? 'भूलेख/खसरा संख्या से सरकारी रिकॉर्ड स्वतः लोड करें या जीपीएस मैप से खेत का दायरा बनाएं' : 'Fetch verified land records via UP Bhulekh Khasra No. or mark on GPS satellite map'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 text-[#0B1E14] flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Farmer Locked Plot Alert */}
        {isTenant ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 text-base">
              🔒
            </div>
            <div>
              <h5 className="font-bold text-xs text-amber-900">
                {lang === 'hi' ? 'बटाईदार (Tenant Farmer) - खसरा लॉक सक्रिय' : 'Tenant Farmer (Batai) - Plot Locked'}
              </h5>
              <p className="text-[11px] text-amber-800/90 font-medium mt-0.5">
                {lang === 'hi'
                  ? 'भूस्वामी सत्यापन (eKYC) के अनुसार आपका खाता केवल अधिकृत खसरा #142/1 (मलिहाबाद) से लॉक है। नया खेत जोड़ना प्रतिबंधित है।'
                  : 'As per verified Landowner eKYC, booking is strictly restricted to authorized Khasra #142/1 (Malihabad). Additional plot registration is restricted.'}
              </p>
            </div>
          </div>
        ) : (
          /* Add New Land Button / Form */
          !isAddingNew ? (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-[#1A4F32]/30 bg-[#1A4F32]/5 hover:bg-[#1A4F32]/10 text-[#1A4F32] font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition active:scale-[0.99] shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#1A4F32]" />
              <span>{lang === 'hi' ? 'नया खेत जोड़ें (भूलेख / जीपीएस)' : 'Add New Land (Bhulekh / GPS)'}</span>
            </button>
          ) : (
            <div className="p-6 rounded-3xl border border-[#0B1E14]/10 bg-white shadow-sm space-y-5">
            
            {/* Mode Switcher Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#0B1E14]/10">
              <div>
                <h4 className="font-bold text-sm text-[#0B1E14] flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{lang === 'hi' ? 'खेत सत्यापन व जोड़ें' : 'Add & Verify Farmland'}</span>
                </h4>
                <p className="text-[11px] text-[#4F6358] font-medium">
                  {lang === 'hi' ? 'सरकारी खसरा संख्या से स्वतः लाएं या मैन्युअल दायरा मार्क करें' : 'Select mode to fetch government registry or draw boundary manually'}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setEntryMode('bhulekh')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    entryMode === 'bhulekh'
                      ? 'bg-[#0B1E14] text-white shadow-sm'
                      : 'text-[#4F6358] hover:text-[#0B1E14]'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>🏛️ {lang === 'hi' ? 'भूलेख खसरा' : 'Govt Khasra Fetch'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEntryMode('manual')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    entryMode === 'manual'
                      ? 'bg-[#0B1E14] text-white shadow-sm'
                      : 'text-[#4F6358] hover:text-[#0B1E14]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>✏️ {lang === 'hi' ? 'मैन्युअल / जीपीएस' : 'Manual / GPS Draw'}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: GOVT BHULEKH KHASRA / GATA AUTO-FETCH */}
            {entryMode === 'bhulekh' && (
              <div className="space-y-4">
                
                {/* Government Bhulekh Search Inputs Card */}
                <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#0B1E14]/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A4F32]">
                    <Building2 className="w-4 h-4 text-[#1A4F32]" />
                    <span>{lang === 'hi' ? 'उत्तर प्रदेश राजस्व परिषद (भूलेख सत्यापन):' : 'UP Bhulekh / AgriStack Land Verification:'}</span>
                  </div>

                  <form onSubmit={handleFetchBhulekh} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      
                      {/* District */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#4F6358] uppercase mb-1">
                          {lang === 'hi' ? 'जिला *' : 'District *'}
                        </label>
                        <select
                          value={bhulekhQuery.district}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-[#0B1E14]/15 font-semibold text-xs bg-white text-[#0B1E14] outline-none focus:border-[#1A4F32]"
                        >
                          {UP_DISTRICTS.map(d => (
                            <option key={d.id} value={d.id}>
                              {lang === 'hi' ? d.nameHi : d.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tehsil */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#4F6358] uppercase mb-1">
                          {lang === 'hi' ? 'तहसील *' : 'Tehsil *'}
                        </label>
                        <select
                          value={bhulekhQuery.tehsil}
                          onChange={(e) => setBhulekhQuery({ ...bhulekhQuery, tehsil: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-xl border border-[#0B1E14]/15 font-semibold text-xs bg-white text-[#0B1E14] outline-none focus:border-[#1A4F32]"
                        >
                          {activeDistrictObj.tehsils.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Village / Gram */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#4F6358] uppercase mb-1">
                          {lang === 'hi' ? 'ग्राम *' : 'Village *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={lang === 'hi' ? 'उदा. रामपुर / मलिहाबाद' : 'e.g. Rampur / Malihabad'}
                          value={bhulekhQuery.village}
                          onChange={(e) => setBhulekhQuery({ ...bhulekhQuery, village: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-xl border border-[#0B1E14]/15 font-semibold text-xs bg-white text-[#0B1E14] outline-none focus:border-[#1A4F32]"
                        />
                      </div>

                      {/* Khasra / Gata Number */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#1A4F32] uppercase mb-1">
                          {lang === 'hi' ? 'खसरा / गाटा संख्या *' : 'Khasra / Gata No. *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={lang === 'hi' ? 'उदा. 142 या 74' : 'e.g. 142 or 74'}
                          value={bhulekhQuery.khasraNumber}
                          onChange={(e) => setBhulekhQuery({ ...bhulekhQuery, khasraNumber: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-xl border-2 border-[#1A4F32] font-black text-xs bg-[#1A4F32]/5 text-[#0B1E14] outline-none focus:ring-2 focus:ring-[#1A4F32]/20"
                        />
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-[#4F6358] font-medium">
                        💡 {lang === 'hi' ? 'त्वरित परीक्षण खसरा संख्या: 142, 74, 215, 58' : 'Quick Demo Khasra Numbers: 142, 74, 215, 58'}
                      </span>

                      <button
                        type="submit"
                        disabled={isSearchingBhulekh}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#0B1E14] hover:bg-[#153424] text-white font-medium text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Search className={`w-3.5 h-3.5 ${isSearchingBhulekh ? 'animate-spin' : ''}`} />
                        <span>{isSearchingBhulekh ? (lang === 'hi' ? 'रिकॉर्ड खोज रहे हैं...' : 'Searching...') : (lang === 'hi' ? '🔍 खसरा विवरण लाएं' : '🔍 Fetch Land Records')}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Error Fallback Banner */}
                {bhulekhError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{bhulekhError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEntryMode('manual')}
                      className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] rounded-lg shrink-0 cursor-pointer"
                    >
                      {lang === 'hi' ? 'मैन्युअल दर्ज करें →' : 'Enter Manually →'}
                    </button>
                  </div>
                )}

                {/* Verified Government Record Display Card */}
                {bhulekhResult && (
                  <div className="p-5 rounded-2xl bg-[#0B1E14] text-white border border-[#1A4F32]/40 shadow-xl space-y-4 animate-fade-in">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-white/10 px-2.5 py-0.5 rounded-full">
                            {lang === 'hi' ? 'उत्तर प्रदेश भूलेख सत्यापित' : 'UP Bhulekh Government Verified'}
                          </span>
                          <h5 className="font-bold text-base text-white mt-1">
                            {lang === 'hi' ? `भूस्वामी: ${bhulekhResult.ownerName}` : `Land Owner: ${bhulekhResult.ownerName}`}
                          </h5>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-emerald-400 font-mono">ULPIN</span>
                        <p className="text-xs font-mono font-bold text-white">{bhulekhResult.ulpin}</p>
                      </div>
                    </div>

                    {/* Metadata Grid with Automated Hectare to Bigha Conversion */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-stone-400 block">{lang === 'hi' ? 'गाटा संख्या' : 'Gata / Khasra No.'}</span>
                        <span className="font-bold text-emerald-300 text-sm">#{bhulekhResult.khasraNumber}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-stone-400 block">{lang === 'hi' ? 'खतौनी संख्या' : 'Khata No.'}</span>
                        <span className="font-bold text-white text-sm">{bhulekhResult.khataNumber}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-stone-400 block">{lang === 'hi' ? 'क्षेत्रफल (हेक्टेयर)' : 'Area (Hectare)'}</span>
                        <span className="font-bold text-amber-300 text-sm">{bhulekhResult.areaHectare} Hec</span>
                      </div>

                      {/* PROGRAMMATIC CONVERSION TO BIGHA */}
                      <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500/50 text-emerald-100">
                        <span className="text-[10px] text-emerald-300 font-bold block">{lang === 'hi' ? 'स्वचालित बीघा' : 'Calculated Bigha'}</span>
                        <span className="font-black text-white text-base">{bhulekhResult.areaBigha} {lang === 'hi' ? 'बीघा' : 'Bigha'}</span>
                      </div>

                    </div>

                    {/* Formula Explanation Callout */}
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-stone-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{lang === 'hi' ? `रूपांतरण: ${bhulekhResult.areaHectare} हेक्टेयर × 3.95 = ${bhulekhResult.areaBigha} पक्का बीघा` : `Conversion: ${bhulekhResult.areaHectare} Hectares × 3.95 = ${bhulekhResult.areaBigha} Bigha`}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold hidden md:inline">✓ {lang === 'hi' ? 'ऑटो-भर गया' : 'Auto-filled'}</span>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* TAB 2: MANUAL ENTRY / GPS DRAWING MAP */}
            {entryMode === 'manual' && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#1A4F32]/10 border border-[#1A4F32]/20 text-[#0B1E14] text-xs font-medium flex items-center justify-between">
                  <span>{lang === 'hi' ? '🗺️ सैटेलाइट मैप पर अपने खेत के कोने छूकर दायरा बनाएं' : '🗺️ Tap corners on satellite map to draw boundary'}</span>
                  <button
                    type="button"
                    onClick={() => setEntryMode('bhulekh')}
                    className="text-[#1A4F32] hover:underline font-bold ml-2 shrink-0 cursor-pointer"
                  >
                    {lang === 'hi' ? '← भूलेख से लाएं' : '← Fetch via Bhulekh'}
                  </button>
                </div>

                <KhetBoundaryDrawer 
                  onBoundaryCalculated={handleBoundaryCalculated}
                  initialLocation={DEFAULT_FARM_LOCATION}
                />
              </div>
            )}

            {/* Farmland Confirmation & Save Form (Applies to both modes) */}
            <form onSubmit={handleSaveLand} className="space-y-4 pt-3 border-t border-[#0B1E14]/10">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4F6358] uppercase mb-1">
                    {lang === 'hi' ? 'खेत का नाम *' : 'Field Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'hi' ? 'उदा. उत्तर वाला खेत' : 'e.g. North Plot'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1E14]/15 font-semibold text-xs text-[#0B1E14] bg-[#FDFBF7] outline-none focus:border-[#1A4F32]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-[#4F6358] uppercase">
                      {lang === 'hi' ? 'खेत का आकार *' : 'Field Area Size *'}
                    </label>
                    <span className="text-[10px] font-bold text-[#1A4F32] bg-[#1A4F32]/10 px-2 py-0.5 rounded-full">
                      {lang === 'hi' ? 'सभी इकाइयाँ' : 'Any Unit Supported'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      value={formData.bigha}
                      onChange={(e) => setFormData({ ...formData, bigha: parseFloat(e.target.value) || 1 })}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#0B1E14]/15 font-black text-xs text-[#1A4F32] bg-[#1A4F32]/5 outline-none focus:border-[#1A4F32]"
                    />
                    <select
                      value={formData.unit || 'bigha'}
                      onChange={(e) => {
                        const newUnit = e.target.value;
                        setFormData(prev => ({ ...prev, unit: newUnit }));
                      }}
                      className="px-2.5 py-2.5 rounded-xl border border-[#0B1E14]/15 font-semibold text-xs bg-white text-[#0B1E14] outline-none focus:border-[#1A4F32]"
                    >
                      <option value="bigha">{lang === 'hi' ? 'बीघा' : 'Bigha'}</option>
                      <option value="acre">{lang === 'hi' ? 'एकड़' : 'Acre'}</option>
                      <option value="hectare">{lang === 'hi' ? 'हेक्टेयर' : 'Hectare'}</option>
                      <option value="biswa">{lang === 'hi' ? 'बिस्वा / गुंठा' : 'Biswa'}</option>
                      <option value="kanal">{lang === 'hi' ? 'कनाल' : 'Kanal'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4F6358] uppercase mb-1">
                    {lang === 'hi' ? 'मुख्य फसल / कार्य' : 'Crop / Operation Type'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'hi' ? 'उदा. गेहूँ / धान' : 'e.g. Wheat / Paddy'}
                    value={formData.cropType}
                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1E14]/15 font-semibold text-xs text-[#0B1E14] bg-[#FDFBF7] outline-none focus:border-[#1A4F32]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4F6358] uppercase mb-1">
                    {lang === 'hi' ? 'स्थान / पता' : 'Location / Address'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'hi' ? 'उदा. ग्राम रामपुर, मलिहाबाद' : 'e.g. Gram Rampur, Malihabad'}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1E14]/15 font-semibold text-xs text-[#0B1E14] bg-[#FDFBF7] outline-none focus:border-[#1A4F32]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-5 py-2.5 rounded-full border border-[#0B1E14]/15 bg-black/5 hover:bg-black/10 text-[#0B1E14] font-medium text-xs transition cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0B1E14] hover:bg-[#153424] text-white font-medium text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'hi' ? 'सत्यापित खेत सहेजें' : 'Save Verified Farmland'}</span>
                </button>
              </div>

            </form>

          </div>
        ))}

        {/* List of Saved Lands */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F6358]">
            {lang === 'hi' ? 'सहेजे गए खेत सूची' : 'Your Farmlands Portfolio'} ({savedLands.length})
          </span>

          <div className="grid grid-cols-1 gap-3">
            {savedLands.map(land => {
              const isSelected = land.id === selectedLandId;
              return (
                <div
                  key={land.id}
                  className={`p-4.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#1A4F32] bg-[#1A4F32]/5 shadow-sm ring-1 ring-[#1A4F32]/20'
                      : 'border-[#0B1E14]/10 bg-white hover:border-[#1A4F32]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{land.icon || '🌾'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#0B1E14] truncate">
                          {localize(land.name)}
                        </h4>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1A4F32] text-white shrink-0">
                            {lang === 'hi' ? 'सक्रिय खेत' : 'Active Field'}
                          </span>
                        )}
                        {land.isGovtVerified && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1A4F32]/10 text-[#1A4F32] border border-[#1A4F32]/20 shrink-0 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#1A4F32]" />
                            <span>{lang === 'hi' ? 'भूलेख सत्यापित' : 'UP Bhulekh Verified'}</span>
                          </span>
                        )}
                        {land.polygonCoords && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {lang === 'hi' ? 'GPS सीमा' : 'GPS Bordered'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#4F6358] truncate mt-0.5 font-medium">
                        📍 {localize(land.address)}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] font-bold text-[#0B1E14]">
                        <span className="text-[#1A4F32] font-black">{land.bigha} {lang === 'hi' ? 'बीघा' : 'Bigha'}</span>
                        <span>•</span>
                        <span>{localize(land.cropType)}</span>
                        {land.areaHectare && (
                          <>
                            <span>•</span>
                            <span className="text-[#4F6358]">{land.areaHectare} Hec</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setSelectedLandId(land.id); onClose(); }}
                      className={`px-4 py-1.5 rounded-full font-medium text-xs transition active:scale-95 cursor-pointer ${
                        isSelected 
                          ? 'bg-[#1A4F32] text-white shadow-sm' 
                          : 'bg-black/5 text-[#0B1E14] hover:bg-black/10'
                      }`}
                    >
                      {isSelected ? (lang === 'hi' ? '✓ चयनित' : '✓ Selected') : (lang === 'hi' ? 'चुनें' : 'Select')}
                    </button>

                    {savedLands.length > 1 && (
                      <button
                        onClick={() => deleteLand(land.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Land"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

