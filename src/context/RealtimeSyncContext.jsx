import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { audioHelper } from '../utils/audioHelper';
import { DEFAULT_FARM_LOCATION, generateRouteWaypoints, calculateDistanceKm } from '../utils/geoUtils';
import CancellationAlertModal from '../components/common/CancellationAlertModal';

const RealtimeSyncContext = createContext();

// Pre-seeded pending applications for Admin Review
const INITIAL_PENDING_APPLICATIONS = [
  {
    id: 'app_101',
    driverName: 'Harbhajan Ram (हरभजन राम)',
    phone: '9833411223',
    vehicleType: 'tractor',
    modelName: 'Swaraj 855 FE (52 HP)',
    vehicleNumber: 'PB-11-AC-9088',
    hourlyRate: 1000,
    acreRate: 1300,
    submittedAt: '10 Mins ago',
    dlPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    platePhoto: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
    status: 'pending'
  },
  {
    id: 'app_102',
    driverName: 'Virender Chaudhary (वीरेंद्र चौधरी)',
    phone: '9412044556',
    vehicleType: 'jcb',
    modelName: 'JCB 3DX Plus Heavy',
    vehicleNumber: 'UP-14-BT-3321',
    hourlyRate: 1200,
    acreRate: 1500,
    submittedAt: '25 Mins ago',
    dlPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    platePhoto: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&auto=format&fit=crop&q=80',
    status: 'pending'
  }
];

export function RealtimeSyncProvider({ children }) {
  // Active Booking (Strictly active only)
  const [activeBooking, setActiveBooking] = useState(() => {
    const saved = localStorage.getItem('krishi_active_booking');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && ['searching', 'accepted', 'arrived', 'in_progress'].includes(parsed.status)) {
        return parsed;
      }
      localStorage.removeItem('krishi_active_booking');
      return null;
    } catch {
      localStorage.removeItem('krishi_active_booking');
      return null;
    }
  });

  // Admin Pending Drivers
  const [pendingApplications, setPendingApplications] = useState(() => {
    const saved = localStorage.getItem('krishi_pending_apps');
    return saved ? JSON.parse(saved) : INITIAL_PENDING_APPLICATIONS;
  });

  // Real-time live toast message
  const [liveToast, setLiveToast] = useState(null);

  // Real-time cancellation alert popup for the other connected party
  const [cancellationAlert, setCancellationAlert] = useState(null);

  // Online fleet registry
  const [onlineFleet, setOnlineFleet] = useState(() => {
    return [
      {
        id: 'drv_my_vehicle',
        name: 'Jagjit Singh (जगजीत सिंह)',
        phone: '9876501234',
        vehicleType: 'tractor',
        modelName: 'Mahindra 575 DI (50 HP)',
        lat: DEFAULT_FARM_LOCATION.lat + 0.0088,
        lng: DEFAULT_FARM_LOCATION.lng + 0.0076,
        status: 'online',
        rating: 4.95
      },
      {
        id: 'drv_fleet_2',
        name: 'Balwinder Singh',
        phone: '9812345678',
        vehicleType: 'harvester',
        modelName: 'Preet 987 Combine',
        lat: DEFAULT_FARM_LOCATION.lat - 0.0075,
        lng: DEFAULT_FARM_LOCATION.lng + 0.0062,
        status: 'online',
        rating: 4.88
      }
    ];
  });

  // Current Live GPS of Driver during ride
  const [driverCurrentPos, setDriverCurrentPos] = useState(() => {
    const defaultDriver = onlineFleet.find(d => d.status === 'online');
    if (defaultDriver && defaultDriver.lat && defaultDriver.lng) {
      return { lat: defaultDriver.lat, lng: defaultDriver.lng };
    }
    return { lat: DEFAULT_FARM_LOCATION.lat + 0.0088, lng: DEFAULT_FARM_LOCATION.lng + 0.0076 };
  });

  // Real device hardware GPS telemetry
  const [isHardwareGpsActive, setIsHardwareGpsActive] = useState(false);
  const [hardwareGpsTelemetry, setHardwareGpsTelemetry] = useState({
    accuracy: null,
    speed: null,
    heading: null,
    lat: null,
    lng: null
  });

  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);

  // Broadcast channel for multi-tab instantaneous messaging
  const channelRef = useRef(null);
  const watchGpsIdRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setLiveToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setLiveToast(null);
    }, 4500);
  };

  // Helper to get active session role and phone
  const getSessionIdentity = () => {
    try {
      const savedUser = localStorage.getItem('krishi_current_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const role = localStorage.getItem('krishi_role') || parsedUser?.role || 'landing';
      const phone = parsedUser?.phone || '';
      return { role, phone };
    } catch {
      return { role: 'landing', phone: '' };
    }
  };

  // Broadcast helper
  const broadcast = (type, payload) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type, payload });
      } catch (err) {
        console.warn('Broadcast error:', err);
      }
    }
  };

  // Start Real Hardware Device GPS continuous tracking
  const startHardwareGpsTracking = (role = 'driver') => {
    if (!navigator.geolocation) {
      showToast('⚠️ Geolocation not supported on this device', 'error');
      return;
    }

    setIsHardwareGpsActive(true);

    if (watchGpsIdRef.current) {
      navigator.geolocation.clearWatch(watchGpsIdRef.current);
    }

    watchGpsIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        
        setHardwareGpsTelemetry({
          accuracy: Math.round(accuracy),
          speed: speed ? Math.round(speed * 3.6) : 22,
          heading: heading || 0,
          lat: latitude,
          lng: longitude
        });

        if (role === 'driver') {
          setDriverCurrentPos(coords);
          broadcast('DRIVER_LOCATION_UPDATE', {
            pos: coords,
            accuracy: Math.round(accuracy),
            speed: speed ? Math.round(speed * 3.6) : 22,
            heading: heading || 0,
            isRealHardwareGps: true
          });
        }
      },
      (err) => {
        console.warn('Hardware GPS error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopHardwareGpsTracking = () => {
    if (watchGpsIdRef.current) {
      navigator.geolocation.clearWatch(watchGpsIdRef.current);
      watchGpsIdRef.current = null;
    }
    setIsHardwareGpsActive(false);
  };

  // Initialize BroadcastChannel & Cross-Tab Storage Listener
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('krishi_realtime_network');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        const session = getSessionIdentity();

        if (type === 'NEW_DRIVER_APPLICATION') {
          setPendingApplications(prev => [payload, ...prev.filter(a => a.id !== payload.id)]);
          // ONLY notify Admin!
          if (session.role === 'admin') {
            showToast(`🔔 नई ड्राइवर अर्जी: ${payload.driverName} (${payload.modelName})`, 'success');
            audioHelper.playOtpChime();
          }
        } else if (type === 'DRIVER_VERIFIED') {
          setPendingApplications(prev => prev.filter(app => app.id !== payload.appId && app.phone !== payload.phone));
          // ONLY notify the Driver (NEVER Farmer or Admin)!
          if (session.role === 'driver') {
            showToast(`🎉 आपका खाता व वाहन सत्यापित हो चुका है! अब आप ऑनलाइन हो सकते हैं।`, 'success');
            audioHelper.playBookingConfirmed();
          }
        } else if (type === 'DRIVER_REJECTED') {
          setPendingApplications(prev => prev.filter(app => app.id !== payload.appId));
          // ONLY notify the Driver!
          if (session.role === 'driver') {
            showToast(`❌ आवेदन अस्वीकृत: ${payload.reason || 'दस्तावेज़ स्पष्ट नहीं'}`, 'error');
          }
        } else if (type === 'NEW_BOOKING_REQUEST') {
          // ONLY notify Drivers!
          if (session.role === 'driver') {
            setActiveBooking(payload);
            showToast(`🚜 नई खेत बुकिंग: ${payload.machineryType.toUpperCase()} - ₹${payload.estimatedPrice}`, 'success');
            audioHelper.playIncomingRideAlert();
          }
        } else if (type === 'BOOKING_ACCEPTED') {
          setActiveBooking(payload);
          if (payload.assignedDriver?.lat && payload.assignedDriver?.lng) {
            setDriverCurrentPos({ lat: payload.assignedDriver.lat, lng: payload.assignedDriver.lng });
          }
          // ONLY notify Farmer!
          if (session.role === 'farmer') {
            showToast(`🎉 ड्राइवर ने बुकिंग स्वीकार की! खेत की ओर रवाना`, 'success');
            audioHelper.playBookingConfirmed();
          }
        } else if (type === 'BOOKING_REJECTED') {
          if (session.role === 'farmer') {
            setActiveBooking(null);
            showToast(`ड्राइवर ने बुकिंग अस्वीकार की।`, 'info');
          }
        } else if (type === 'BOOKING_CANCELLED') {
          setActiveBooking(null);
          localStorage.removeItem('krishi_active_booking');
          // ONLY show alert to the OTHER party (not the one who cancelled)!
          if (session.role !== payload.cancelledByRole) {
            setCancellationAlert(payload);
            showToast(`❌ बुकिंग रद्द: "${payload.reason}"`, 'error');
            audioHelper.playOtpChime();
          }
        } else if (type === 'BOOKING_STATUS_CHANGED') {
          setActiveBooking(payload);
          if (payload.status === 'arrived') {
            if (session.role === 'farmer') {
              showToast(`📍 मशीनरी आपके खेत पर पहुँच चुकी है!`, 'success');
              audioHelper.playBookingConfirmed();
            }
          } else if (payload.status === 'in_progress') {
            showToast(`🌾 खेत में जुताई/कटाई कार्य शुरू हुआ!`, 'info');
          } else if (payload.status === 'completed') {
            showToast(`✅ खेत कार्य संपन्न हुआ!`, 'success');
            audioHelper.playBookingConfirmed();
          }
        } else if (type === 'JOB_COMPLETED_PAYOUT') {
          // Update driver's total earnings and completed rides in onlineFleet
          setOnlineFleet(prev => prev.map(d => {
            if (d.phone === payload.driverPhone) {
              return {
                ...d,
                totalEarnings: (Number(d.totalEarnings) || 0) + Number(payload.payout),
                completedRides: (Number(d.completedRides) || 0) + 1
              };
            }
            return d;
          }));

          if (session.role === 'driver') {
            showToast(`💰 कार्य संपन्न! ₹${payload.payout} आपके वॉलेट में जुड़ गए`, 'success');
            audioHelper.playBookingConfirmed();
          }
        } else if (type === 'DRIVER_RATING_SUBMITTED') {
          // Update driver rating and earnings in onlineFleet
          setOnlineFleet(prev => prev.map(d => {
            if (d.phone === payload.driverPhone) {
              return {
                ...d,
                rating: payload.newRating || d.rating,
                totalEarnings: (Number(d.totalEarnings) || 0) + (Number(payload.payout) || 0),
                completedRides: (Number(d.completedRides) || 0) + 1
              };
            }
            return d;
          }));

          if (session.role === 'driver') {
            showToast(`⭐ किसान से नई रेटिंग व समीक्षा प्राप्त हुई! कुल रेटिंग: ${payload.newRating} / 5.0`, 'success');
            audioHelper.playBookingConfirmed();
          }
        } else if (type === 'DRIVER_LOCATION_UPDATE') {
          setDriverCurrentPos(payload.pos);
          if (payload.isRealHardwareGps) {
            setIsHardwareGpsActive(true);
            setHardwareGpsTelemetry({
              accuracy: payload.accuracy,
              speed: payload.speed,
              heading: payload.heading,
              lat: payload.pos.lat,
              lng: payload.pos.lng
            });
          }
        } else if (type === 'DRIVER_ONLINE_STATUS') {
          setOnlineFleet(prev => {
            const exists = prev.find(d => d.phone === payload.phone);
            if (exists) {
              return prev.map(d => d.phone === payload.phone ? { ...d, ...payload } : d);
            }
            return [...prev, payload];
          });
          if (payload.status === 'online' && payload.lat && payload.lng) {
            setDriverCurrentPos({ lat: payload.lat, lng: payload.lng });
          }
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Listen to Storage events for multi-tab sync across different origins or background tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'krishi_active_booking') {
        const val = e.newValue ? JSON.parse(e.newValue) : null;
        setActiveBooking(val);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Persist Active Booking to LocalStorage
  useEffect(() => {
    if (activeBooking) {
      localStorage.setItem('krishi_active_booking', JSON.stringify(activeBooking));
    } else {
      localStorage.removeItem('krishi_active_booking');
    }
  }, [activeBooking]);

  // Persist Pending Apps
  useEffect(() => {
    localStorage.setItem('krishi_pending_apps', JSON.stringify(pendingApplications));
  }, [pendingApplications]);

  // Route Polyline generation directly between the Driver's actual location & Farmer's location
  useEffect(() => {
    if (activeBooking && (activeBooking.status === 'accepted' || activeBooking.status === 'arrived' || activeBooking.status === 'in_progress')) {
      let startPos = activeBooking.driverStartPos || driverCurrentPos;
      const endPos = activeBooking.farmerLocation || DEFAULT_FARM_LOCATION;
      
      // Snapping helper for testing: if distance is > 10 km, keep the path local for realistic dispatch demo
      const dist = calculateDistanceKm(startPos.lat, startPos.lng, endPos.lat, endPos.lng);
      if (dist > 10) {
        startPos = {
          lat: endPos.lat + 0.0088,
          lng: endPos.lng + 0.0076
        };
      }
      
      const waypoints = generateRouteWaypoints(startPos, endPos, 25);
      setRouteWaypoints(waypoints);
    }
  }, [activeBooking?.status, activeBooking?.driverStartPos, activeBooking?.farmerLocation]);

  // Active Booking Real-Time Telemetry Simulation Loop
  useEffect(() => {
    if (!activeBooking || activeBooking.status !== 'accepted' || routeWaypoints.length === 0 || isHardwareGpsActive) {
      setCurrentWaypointIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentWaypointIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < routeWaypoints.length) {
          const nextPos = routeWaypoints[nextIndex];
          setDriverCurrentPos(nextPos);

          // Update active booking's driver position
          setActiveBooking(prev => {
            if (!prev) return null;
            return {
              ...prev,
              assignedDriver: {
                ...prev.assignedDriver,
                lat: nextPos.lat,
                lng: nextPos.lng
              }
            };
          });

          // Broadcast updated location to other tabs
          broadcast('DRIVER_LOCATION_UPDATE', {
            pos: nextPos,
            isRealHardwareGps: false
          });

          return nextIndex;
        } else {
          // Arrived at the field!
          clearInterval(interval);
          updateBookingStatus('arrived');
          return prevIndex;
        }
      });
    }, 2500); // Move every 2.5 seconds for visible live movement

    return () => clearInterval(interval);
  }, [activeBooking?.status, routeWaypoints, isHardwareGpsActive]);

  // Actions
  const createBookingRequest = (bookingDetails) => {
    const initialDriverPos = (driverCurrentPos && driverCurrentPos.lat) 
      ? driverCurrentPos 
      : {
          lat: (bookingDetails.farmerLocation?.lat || DEFAULT_FARM_LOCATION.lat) + 0.0088,
          lng: (bookingDetails.farmerLocation?.lng || DEFAULT_FARM_LOCATION.lng) + 0.0076
        };

    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));

    const booking = {
      id: `book_${Date.now()}`,
      farmerName: bookingDetails.farmerName || 'Balram Kisan',
      farmerPhone: bookingDetails.farmerPhone || '9876543210',
      farmerLocation: bookingDetails.farmerLocation || DEFAULT_FARM_LOCATION,
      machineryType: bookingDetails.machineryType,
      attachment: bookingDetails.attachment,
      landName: bookingDetails.landName || 'My Farm',
      landSize: bookingDetails.landSize,
      sizeUnit: bookingDetails.sizeUnit || 'bigha',
      estimatedPrice: bookingDetails.estimatedPrice,
      estimatedETA: bookingDetails.estimatedETA || '35-60 Mins',
      status: 'searching',
      startOtp: generatedOtp,
      createdAt: new Date().toISOString(),
      driverStartPos: initialDriverPos
    };

    setActiveBooking(booking);
    broadcast('NEW_BOOKING_REQUEST', booking);
    return booking;
  };

  const acceptBooking = (driver) => {
    if (!activeBooking) return;

    const exactDriverPos = (driver && driver.lat && driver.lng) 
      ? { lat: driver.lat, lng: driver.lng } 
      : driverCurrentPos;

    const assignedDriver = {
      id: driver?.id || 'drv_assigned',
      name: driver?.fullName || driver?.name || 'Jagjit Singh (जगजीत सिंह)',
      phone: driver?.phone || '9876501234',
      vehicleType: driver?.vehicleType || activeBooking.machineryType || 'tractor',
      modelName: driver?.modelName || 'Mahindra 575 DI (50 HP)',
      vehicleNumber: driver?.vehicleNumber || 'UP-32-KR-7744',
      rating: driver?.rating || 4.95,
      avatar: driver?.dlPhoto || driver?.dlImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lat: exactDriverPos.lat,
      lng: exactDriverPos.lng
    };

    const updated = {
      ...activeBooking,
      status: 'accepted',
      assignedDriver: assignedDriver,
      driverStartPos: exactDriverPos,
      acceptedAt: new Date().toISOString()
    };

    setDriverCurrentPos(exactDriverPos);
    setActiveBooking(updated);
    broadcast('BOOKING_ACCEPTED', updated);
    audioHelper.playBookingConfirmed();

    startHardwareGpsTracking('driver');
  };

  const rejectBooking = () => {
    broadcast('BOOKING_REJECTED', { bookingId: activeBooking?.id });
    setActiveBooking(null);
  };

  const updateBookingStatus = (status) => {
    if (!activeBooking) return;
    const updated = { ...activeBooking, status };
    setActiveBooking(updated);
    broadcast('BOOKING_STATUS_CHANGED', updated);
    if (status === 'arrived') {
      audioHelper.playBookingConfirmed();
    } else if (status === 'completed') {
      completeJobAndPayout(updated);
    }
  };

  // Complete Job and disburse payout to driver
  const completeJobAndPayout = (targetBooking = null) => {
    const booking = targetBooking || activeBooking;
    if (!booking) return;

    const payout = Number(booking.estimatedPrice) || 0;
    const driverPhone = booking.assignedDriver?.phone || '9876501234';

    // 1. Update driverProfile & usersDb in localStorage
    try {
      const savedDriver = localStorage.getItem('krishi_driver_profile');
      if (savedDriver) {
        const parsed = JSON.parse(savedDriver);
        const updated = {
          ...parsed,
          totalEarnings: (Number(parsed.totalEarnings) || 0) + payout,
          completedRides: (Number(parsed.completedRides) || 0) + 1
        };
        localStorage.setItem('krishi_driver_profile', JSON.stringify(updated));
      }

      const savedUsersDb = localStorage.getItem('krishi_users_db');
      if (savedUsersDb) {
        const parsedUsers = JSON.parse(savedUsersDb);
        if (parsedUsers[driverPhone]) {
          parsedUsers[driverPhone] = {
            ...parsedUsers[driverPhone],
            totalEarnings: (Number(parsedUsers[driverPhone].totalEarnings) || 0) + payout,
            completedRides: (Number(parsedUsers[driverPhone].completedRides) || 0) + 1
          };
          localStorage.setItem('krishi_users_db', JSON.stringify(parsedUsers));
        }
      }
    } catch (err) {
      console.warn('Error updating payout to local storage:', err);
    }

    const updatedBooking = { 
      ...booking, 
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    setActiveBooking(updatedBooking);

    // Save to Farmer Booking History in localStorage
    try {
      const historyKey = 'krishi_farmer_booking_history';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newHistoryItem = {
        ...updatedBooking,
        id: updatedBooking.id || `book_${Date.now()}`,
        completedAt: new Date().toISOString(),
        paidAmount: payout
      };
      const updatedHistory = [newHistoryItem, ...existingHistory.filter(b => b.id !== newHistoryItem.id)];
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Error saving booking history:', e);
    }

    // Dispatch in-tab custom event for immediate UI reflection in the same tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('krishi_driver_profile_updated', {
        detail: { payout: payout }
      }));
    }

    // Broadcast status change and payout
    broadcast('BOOKING_STATUS_CHANGED', updatedBooking);
    broadcast('JOB_COMPLETED_PAYOUT', {
      driverPhone,
      payout,
      bookingId: booking.id
    });

    showToast(`✅ खेत कार्य संपन्न हुआ! ₹${payout} ड्राइवर को हस्तांतरित`, 'success');
    audioHelper.playBookingConfirmed();
  };

  // Farmer submits driver rating (1-5 stars)
  const submitDriverRating = (ratingData) => {
    const { rating, tags, comment, driverPhone, amountPaid, paymentMethod } = ratingData;
    const targetPhone = driverPhone || activeBooking?.assignedDriver?.phone || '9876501234';
    const stars = Math.min(5, Math.max(1, Number(rating) || 5));
    const paid = Number(amountPaid) || activeBooking?.estimatedPrice || 0;

    let newAvgRating = 5.0;

    // Update localStorage for driver profile & usersDb
    try {
      const savedDriver = localStorage.getItem('krishi_driver_profile');
      if (savedDriver) {
        const parsed = JSON.parse(savedDriver);
        const currentRides = Math.max(1, Number(parsed.completedRides) || 1);
        const currentRating = Number(parsed.rating) || 5.0;
        const computed = currentRides > 1
          ? (((currentRating * (currentRides - 1)) + stars) / currentRides)
          : stars;
        newAvgRating = Number(computed.toFixed(2));
        const updated = {
          ...parsed,
          rating: Math.min(5.0, Math.max(1.0, newAvgRating))
        };
        localStorage.setItem('krishi_driver_profile', JSON.stringify(updated));
      }

      const savedUsersDb = localStorage.getItem('krishi_users_db');
      if (savedUsersDb) {
        const parsedUsers = JSON.parse(savedUsersDb);
        if (parsedUsers[targetPhone]) {
          const currentRides = Math.max(1, Number(parsedUsers[targetPhone].completedRides) || 1);
          const currentRating = Number(parsedUsers[targetPhone].rating) || 5.0;
          const computed = currentRides > 1
            ? (((currentRating * (currentRides - 1)) + stars) / currentRides)
            : stars;
          newAvgRating = Number(computed.toFixed(2));
          parsedUsers[targetPhone] = {
            ...parsedUsers[targetPhone],
            rating: Math.min(5.0, Math.max(1.0, newAvgRating))
          };
          localStorage.setItem('krishi_users_db', JSON.stringify(parsedUsers));
        }
      }

      // Update rating in farmer booking history
      const historyKey = 'krishi_farmer_booking_history';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const updatedHistory = existingHistory.map(b => {
        if (b.id === ratingData.bookingId || (activeBooking && b.id === activeBooking.id)) {
          return {
            ...b,
            paidAmount: paid,
            paymentMethod: paymentMethod || b.paymentMethod || 'cash',
            farmerRating: stars,
            feedbackTags: tags,
            feedbackComment: comment
          };
        }
        return b;
      });
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

      // Dispatch in-tab custom event for immediate UI reflection
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('krishi_driver_profile_updated', {
          detail: { newRating: newAvgRating, payout: paid }
        }));
      }
    } catch (err) {
      console.warn('Error updating driver rating in local storage:', err);
    }

    // Broadcast rating and payout across tabs/devices
    broadcast('DRIVER_RATING_SUBMITTED', {
      driverPhone: targetPhone,
      payout: paid,
      newRating: newAvgRating,
      tags,
      comment
    });

    // Clear active booking from active radar after rating
    localStorage.removeItem('krishi_active_booking');
    setActiveBooking(null);
    showToast('⭐ रेटिंग व प्रतिक्रिया सफलतापूर्वक दर्ज की गई!', 'success');
  };

  const cancelBooking = (reason = 'Plan Changed', cancelledByRole = 'farmer', cancelledByName = '') => {
    localStorage.removeItem('krishi_active_booking');
    setActiveBooking(null);
    broadcast('BOOKING_CANCELLED', {
      reason,
      cancelledByRole,
      cancelledByName,
      timestamp: new Date().toISOString()
    });
    showToast(`बुकिंग रद्द की गई (${reason})`, 'info');
    stopHardwareGpsTracking();
  };

  const updateBookingPrice = (newPrice) => {
    if (!activeBooking) return;
    
    // Recalculate advancePaid and balanceDue based on new price
    const method = activeBooking.paymentMethod || 'cod';
    const advancePaid = method === 'cod' ? Math.round(newPrice * 0.3) : newPrice;
    const balanceDue = Math.round(newPrice - advancePaid);
    
    const updated = { 
      ...activeBooking, 
      estimatedPrice: newPrice,
      advancePaid,
      balanceDue
    };
    setActiveBooking(updated);
    broadcast('BOOKING_PRICE_BARGAINED', updated);
  };

  // Broadcast driver online status
  const broadcastDriverDuty = (driverInfo) => {
    if (driverInfo.status === 'online' && driverInfo.lat && driverInfo.lng) {
      setDriverCurrentPos({ lat: driverInfo.lat, lng: driverInfo.lng });
    }
    broadcast('DRIVER_ONLINE_STATUS', driverInfo);
  };

  // Submit Driver KYC
  const submitDriverKycRealtime = (applicationData) => {
    const newApp = {
      ...applicationData,
      id: `app_${Date.now()}`,
      submittedAt: 'Just now',
      status: 'pending'
    };
    setPendingApplications(prev => [newApp, ...prev]);
    broadcast('NEW_DRIVER_APPLICATION', newApp);
    showToast(`✅ आवेदन जमा हुआ! एडमिन सत्यापन लंबित है`, 'info');
    audioHelper.playOtpChime();
    return newApp;
  };

  // Admin approves application
  const approveApplication = (appId, extra = {}) => {
    setPendingApplications(prev => prev.filter(app => app.id !== appId));
    broadcast('DRIVER_VERIFIED', { appId, ...extra });
    showToast(`✅ ड्राइवर को सफलतापूर्वक स्वीकृत किया गया!`, 'success');
  };

  // Admin rejects application
  const rejectApplication = (appId, reason = 'Blurry document / Incomplete details') => {
    setPendingApplications(prev => prev.filter(app => app.id !== appId));
    broadcast('DRIVER_REJECTED', { appId, reason });
    showToast(`❌ आवेदन अस्वीकृत किया गया (${reason})`, 'error');
  };

  return (
    <RealtimeSyncContext.Provider
      value={{
        activeBooking,
        driverCurrentPos,
        routeWaypoints,
        currentWaypointIndex,
        pendingApplications,
        onlineFleet,
        isHardwareGpsActive,
        hardwareGpsTelemetry,
        liveToast,
        showToast,
        startHardwareGpsTracking,
        stopHardwareGpsTracking,
        createBookingRequest,
        acceptBooking,
        rejectBooking,
        updateBookingStatus,
        completeJobAndPayout,
        submitDriverRating,
        cancelBooking,
        updateBookingPrice,
        broadcastDriverDuty,
        submitDriverKycRealtime,
        approveApplication,
        rejectApplication
      }}
    >
      {children}

      {/* Global Cancellation Alert Popup for the other party */}
      <CancellationAlertModal
        isOpen={!!cancellationAlert}
        alertData={cancellationAlert}
        onClose={() => setCancellationAlert(null)}
      />

      {/* Global Real-Time Event Notification Toast */}
      {liveToast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce-gentle max-w-sm">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md text-white font-extrabold text-xs ${
            liveToast.type === 'success' ? 'bg-emerald-900/95 border-emerald-500' :
            liveToast.type === 'error' ? 'bg-red-900/95 border-red-500' :
            'bg-stone-900/95 border-stone-700'
          }`}>
            <span className="text-base">⚡</span>
            <span>{liveToast.message}</span>
          </div>
        </div>
      )}
    </RealtimeSyncContext.Provider>
  );
}

export function useRealtimeSync() {
  const ctx = useContext(RealtimeSyncContext);
  if (!ctx) throw new Error('useRealtimeSync must be used within RealtimeSyncProvider');
  return ctx;
}
