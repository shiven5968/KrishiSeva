import React, { createContext, useContext, useState, useEffect } from 'react';
import { audioHelper } from '../utils/audioHelper';
import { useAuth } from './AuthContext';

const PreBookingsContext = createContext();

export const INITIAL_PRE_BOOKINGS = [
  {
    id: 'pre_101',
    farmerName: 'Balram Kisan (बलराम किसान)',
    farmerPhone: '9876543210',
    landName: 'गाँव की मुख्य ज़मीन (Main Village Land)',
    machineryType: 'harvester',
    attachment: {
      id: 'grain_header',
      nameKey: 'grainHeader',
      icon: '🌾'
    },
    landSize: 4.5,
    sizeUnit: 'bigha',
    scheduledDate: '2026-08-26',
    scheduledDay: 'Wednesday (बुधवार)',
    timeSlot: 'Morning (06:00 AM - 10:00 AM)',
    estimatedPrice: 6500,
    specialNotes: 'Paddy crop ready for cutting. Bring 14-ft grain header.',
    status: 'scheduled', // 'scheduled' | 'cancelled' | 'dispatched'
    createdAt: '2026-08-19'
  }
];

export function PreBookingsProvider({ children }) {
  const { currentUser } = useAuth();
  const activePhone = currentUser?.phone || '9876543210';

  const [allPreBookings, setAllPreBookings] = useState(() => {
    const saved = localStorage.getItem('krishi_pre_bookings');
    return saved ? JSON.parse(saved) : INITIAL_PRE_BOOKINGS;
  });

  useEffect(() => {
    localStorage.setItem('krishi_pre_bookings', JSON.stringify(allPreBookings));
  }, [allPreBookings]);

  // Compute pre-bookings belonging to the currently logged in farmer
  const preBookings = allPreBookings.filter(b => b.farmerPhone === activePhone);

  const addPreBooking = (bookingData) => {
    const newPreBooking = {
      ...bookingData,
      id: `pre_${Date.now()}`,
      farmerPhone: activePhone, // Make sure it's linked to current user
      status: 'scheduled',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAllPreBookings(prev => [newPreBooking, ...prev]);
    audioHelper.playBookingConfirmed();
    return newPreBooking;
  };

  const cancelPreBooking = (id) => {
    setAllPreBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    audioHelper.playOtpChime();
  };

  const deletePreBooking = (id) => {
    setAllPreBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <PreBookingsContext.Provider
      value={{
        preBookings,
        addPreBooking,
        cancelPreBooking,
        deletePreBooking
      }}
    >
      {children}
    </PreBookingsContext.Provider>
  );
}

export function usePreBookings() {
  const ctx = useContext(PreBookingsContext);
  if (!ctx) throw new Error('usePreBookings must be used within PreBookingsProvider');
  return ctx;
}
