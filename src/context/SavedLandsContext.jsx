import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_FARM_LOCATION } from '../utils/geoUtils';
import { useAuth } from './AuthContext';

const SavedLandsContext = createContext();

export const INITIAL_SAVED_LANDS = [
  {
    id: 'land_1',
    userPhone: '9876543210',
    name: 'नदी वाला खेत (Khet near River)',
    bigha: 4.5,
    cropType: 'Wheat / गेहूँ',
    address: 'Plot #12, Gomti River Basin, Malihabad',
    lat: 26.8485,
    lng: 80.9495,
    soilType: 'Alluvial Loam (दोमट मिट्टी)',
    icon: '🌊',
    isGovtVerified: true,
    khasraNumber: '142',
    areaHectare: 1.139,
    ulpin: 'UP-LKO-MLH-142-01'
  },
  {
    id: 'land_2',
    userPhone: '9876543210',
    name: 'गाँव की मुख्य ज़मीन (Main Village Land)',
    bigha: 3.0,
    cropType: 'Paddy / धान',
    address: 'Khet #14, Gram Panchayat Rampur, Malihabad',
    lat: DEFAULT_FARM_LOCATION.lat,
    lng: DEFAULT_FARM_LOCATION.lng,
    soilType: 'Clay Soil (चिकनी मिट्टी)',
    icon: '🏡',
    isGovtVerified: true,
    khasraNumber: '74',
    areaHectare: 0.760,
    ulpin: 'UP-LKO-MLH-074-04'
  },
  {
    id: 'land_3',
    userPhone: '9876543210',
    name: 'पश्चिम चक (West Highway Plot)',
    bigha: 6.0,
    cropType: 'Mustard / सरसों',
    address: 'Chak #7, Near State Highway 25',
    lat: 26.8420,
    lng: 80.9410,
    soilType: 'Sandy Loam (बलुई मिट्टी)',
    icon: '🛣️',
    isGovtVerified: false
  }
];

export function SavedLandsProvider({ children }) {
  const { currentUser } = useAuth();
  const activePhone = currentUser?.phone || '9876543210';

  const [allLands, setAllLands] = useState(() => {
    const saved = localStorage.getItem('krishi_saved_lands');
    return saved ? JSON.parse(saved) : INITIAL_SAVED_LANDS;
  });

  useEffect(() => {
    localStorage.setItem('krishi_saved_lands', JSON.stringify(allLands));
  }, [allLands]);

  // Compute lands belonging to the currently logged in farmer
  const savedLands = allLands.filter(land => land.userPhone === activePhone);

  const [selectedLandId, setSelectedLandId] = useState('');

  // Automatically update selectedLandId when lands list or active user changes
  useEffect(() => {
    if (savedLands.length > 0) {
      if (!savedLands.some(l => l.id === selectedLandId)) {
        setSelectedLandId(savedLands[0].id);
      }
    } else {
      setSelectedLandId('');
    }
  }, [allLands, activePhone, selectedLandId]);

  const selectedLand = savedLands.find(l => l.id === selectedLandId) || savedLands[0] || null;

  const addLand = (newLand) => {
    const land = {
      ...newLand,
      id: `land_${Date.now()}`,
      userPhone: activePhone,
      bigha: Number(newLand.bigha) || 1,
      lat: Number(newLand.lat) || DEFAULT_FARM_LOCATION.lat,
      lng: Number(newLand.lng) || DEFAULT_FARM_LOCATION.lng,
      icon: newLand.icon || '🌾',
      isGovtVerified: Boolean(newLand.isGovtVerified),
      khasraNumber: newLand.khasraNumber || null,
      areaHectare: newLand.areaHectare ? Number(newLand.areaHectare) : null,
      ulpin: newLand.ulpin || null
    };
    setAllLands(prev => [land, ...prev]);
    setSelectedLandId(land.id);
    return land;
  };

  const updateLand = (id, updatedFields) => {
    setAllLands(prev =>
      prev.map(land => (land.id === id ? { ...land, ...updatedFields, bigha: Number(updatedFields.bigha) || land.bigha } : land))
    );
  };

  const deleteLand = (id) => {
    setAllLands(prev => {
      const remaining = prev.filter(land => land.id !== id);
      return remaining;
    });
  };

  return (
    <SavedLandsContext.Provider
      value={{
        savedLands,
        selectedLand,
        selectedLandId,
        setSelectedLandId,
        addLand,
        updateLand,
        deleteLand
      }}
    >
      {children}
    </SavedLandsContext.Provider>
  );
}

export function useSavedLands() {
  const ctx = useContext(SavedLandsContext);
  if (!ctx) throw new Error('useSavedLands must be used within SavedLandsProvider');
  return ctx;
}
