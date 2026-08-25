import React, { createContext, useContext, useState, useEffect } from 'react';
import { audioHelper } from '../utils/audioHelper';

const AuthContext = createContext();

// Default Pre-Registered Users Database
export const MOCK_USER_DATABASE = {
  '9876543210': {
    phone: '9876543210',
    role: 'farmer',
    name: 'Balram Singh (बलराम सिंह)',
    village: 'Gram Malihabad',
    isRegistered: true,
    isAgriStackVerified: true,
    farmerId: 'UPFR-2026-88910'
  },
  '9876501234': {
    phone: '9876501234',
    role: 'driver',
    name: 'Jagjit Singh (जगजीत सिंह)',
    verificationStatus: 'verified',
    status: 'online',
    vehicleType: 'tractor',
    modelName: 'Mahindra 575 DI (50 HP)',
    vehicleNumber: 'UP-32-KR-7744',
    hourlyRate: 1000,
    acreRate: 1300,
    isRegistered: true,
    totalEarnings: 84500,
    completedRides: 142,
    rating: 4.95
  },
  '9811122233': {
    phone: '9811122233',
    role: 'driver',
    name: 'Rampal Sharma (रामपाल शर्मा)',
    verificationStatus: 'pending',
    status: 'offline',
    vehicleType: 'harvester',
    modelName: 'Preet 987 Combine (110 HP)',
    vehicleNumber: 'PB-10-AZ-1100',
    hourlyRate: 1500,
    acreRate: 1500,
    isRegistered: true,
    totalEarnings: 0,
    completedRides: 0,
    rating: 5.0
  },
  '9999999999': {
    phone: '9999999999',
    role: 'admin',
    name: 'Super Admin (प्रशासक)',
    isRegistered: true
  }
};

const DEFAULT_NEW_DRIVER_PROFILE = {
  id: 'drv_new',
  fullName: 'New Driver Partner (नया चालक)',
  phone: '',
  vehicleType: 'tractor',
  modelName: 'Tractor (50 HP)',
  vehicleNumber: '',
  hourlyRate: 1000,
  acreRate: 1300,
  status: 'offline',
  verificationStatus: 'unregistered',
  dlImage: '',
  plateImage: '',
  rejectionReason: '',
  rating: 5.0,
  completedRides: 0,
  totalEarnings: 0,
  lat: 26.8540,
  lng: 80.9520
};

export function AuthProvider({ children }) {
  // Persistent Multi-User Database
  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem('krishi_users_db');
    return saved ? JSON.parse(saved) : MOCK_USER_DATABASE;
  });

  useEffect(() => {
    localStorage.setItem('krishi_users_db', JSON.stringify(usersDb));
  }, [usersDb]);

  // Current active view/role: 'landing' | 'farmer' | 'driver' | 'admin'
  const [activeRole, setActiveRole] = useState(() => {
    const savedUser = localStorage.getItem('krishi_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return parsed.role;
      } catch (e) {}
    }
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') return 'admin';
      if (window.location.hash === '#farmer') return 'farmer';
      if (window.location.hash === '#driver') return 'driver';
    }
    return 'landing';
  });

  // Current Logged In User
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('krishi_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Driver details
  const [driverProfile, setDriverProfile] = useState(() => {
    const saved = localStorage.getItem('krishi_driver_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.phone !== '9876501234' && parsed.verificationStatus !== 'verified') {
        return { ...parsed, totalEarnings: 0, completedRides: 0 };
      }
      return parsed;
    }
    return DEFAULT_NEW_DRIVER_PROFILE;
  });

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [pendingAuthPhone, setPendingAuthPhone] = useState('');
  const [isNewUserRoleSelectionRequired, setIsNewUserRoleSelectionRequired] = useState(false);

  useEffect(() => {
    localStorage.setItem('krishi_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('krishi_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('krishi_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('krishi_driver_profile', JSON.stringify(driverProfile));
  }, [driverProfile]);

  // Real-time listener for driver verification, rating updates, and payouts across tabs & sessions
  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const saved = localStorage.getItem('krishi_driver_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setDriverProfile(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener('krishi_driver_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('krishi_realtime_network');
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'DRIVER_VERIFIED') {
          setDriverProfile(prev => ({
            ...prev,
            fullName: payload.driverName || prev.fullName,
            phone: payload.phone || prev.phone,
            vehicleNumber: payload.vehicleNumber || prev.vehicleNumber,
            vehicleType: payload.vehicleType || prev.vehicleType,
            modelName: payload.modelName || prev.modelName,
            verificationStatus: 'verified',
            status: 'online',
            totalEarnings: prev.phone === '9876501234' ? 84500 : (prev.totalEarnings || 0),
            completedRides: prev.phone === '9876501234' ? 142 : (prev.completedRides || 0),
            rating: prev.phone === '9876501234' ? 4.95 : 5.0
          }));
        } else if (type === 'DRIVER_REJECTED') {
          setDriverProfile(prev => ({
            ...prev,
            verificationStatus: 'rejected',
            rejectionReason: payload.reason || 'Document blurry or vehicle number mismatch'
          }));
        } else if (type === 'DRIVER_RATING_SUBMITTED') {
          setDriverProfile(prev => {
            const nextRating = Number(payload.newRating) || prev.rating;
            const updated = {
              ...prev,
              rating: nextRating
            };
            localStorage.setItem('krishi_driver_profile', JSON.stringify(updated));
            return updated;
          });
        } else if (type === 'JOB_COMPLETED_PAYOUT') {
          setDriverProfile(prev => {
            const updated = {
              ...prev,
              totalEarnings: (Number(prev.totalEarnings) || 0) + Number(payload.payout || 0),
              completedRides: (Number(prev.completedRides) || 0) + 1
            };
            localStorage.setItem('krishi_driver_profile', JSON.stringify(updated));
            return updated;
          });
        }
      };
    }

    return () => {
      window.removeEventListener('krishi_driver_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
      if (channel) channel.close();
    };
  }, []);

  // Request 6-Digit OTP with 15-Minute Rate Limiting (Max 3 requests / 15 mins)
  const requestOtp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const rateLimitKey = `krishi_otp_rate_limit_${cleanPhone}`;
    const now = Date.now();
    let limitData = { requestTimestamps: [] };

    try {
      const saved = localStorage.getItem(rateLimitKey);
      if (saved) {
        limitData = JSON.parse(saved);
      }
    } catch (e) {}

    // Clean up timestamps older than 15 minutes
    const fifteenMinsAgo = now - 15 * 60 * 1000;
    limitData.requestTimestamps = (limitData.requestTimestamps || []).filter(ts => ts > fifteenMinsAgo);

    const lang = localStorage.getItem('krishi_lang') || 'hi';

    if (limitData.requestTimestamps.length >= 3) {
      const oldestActive = limitData.requestTimestamps[0];
      const timeRemainingMs = (oldestActive + 15 * 60 * 1000) - now;
      const minutesRemaining = Math.max(1, Math.ceil(timeRemainingMs / (60 * 1000)));

      const errorMsg = lang === 'hi'
        ? `सुरक्षा सीमा: 15 मिनट में अधिकतम 3 बार ओटीपी मंगा सकते हैं। कृपया ${minutesRemaining} मिनट बाद पुनः प्रयास करें।`
        : `Rate limit exceeded (Max 3 requests per 15 mins). Try again in ${minutesRemaining} minutes.`;

      return { success: false, error: errorMsg };
    }

    // Record request timestamp
    limitData.requestTimestamps.push(now);
    localStorage.setItem(rateLimitKey, JSON.stringify(limitData));

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpExpiresAt(now + 5 * 60 * 1000); // 5 minutes expiration
    setPendingAuthPhone(cleanPhone);
    audioHelper.playOtpChime();

    return { success: true, code: otp, expiresAt: now + 5 * 60 * 1000 };
  };

  // Verify OTP with 5-Minute Expiration and Role Assignment
  const verifyOtp = (phone, otpVal) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const lang = localStorage.getItem('krishi_lang') || 'hi';

    const isUniversalDemoOtp = otpVal === '123456';

    // 1. Expiration Check (bypassed if universal demo OTP 123456 is used)
    if (!isUniversalDemoOtp && otpExpiresAt > 0 && Date.now() > otpExpiresAt) {
      return { 
        success: false, 
        error: lang === 'hi' ? 'ओटीपी की समय सीमा समाप्त हो गई है (5 मिनट)। कृपया नया कोड प्राप्त करें।' : 'OTP has expired (5-minute limit). Please request a new code.' 
      };
    }

    // 2. Validate exact OTP match
    if (otpVal === generatedOtp || isUniversalDemoOtp) {
      const existingUser = usersDb[cleanPhone];

      if (existingUser) {
        const user = {
          isAuthenticated: true,
          phone: existingUser.phone,
          role: existingUser.role,
          name: existingUser.name,
          village: existingUser.village || 'Gram Panchayat Malihabad',
          isAgriStackVerified: !!existingUser.isAgriStackVerified,
          farmerId: existingUser.farmerId || null
        };
        setCurrentUser(user);
        setActiveRole(existingUser.role);

        if (existingUser.role === 'driver') {
          setDriverProfile({
            id: `drv_${existingUser.phone}`,
            fullName: existingUser.name,
            phone: existingUser.phone,
            vehicleNumber: existingUser.vehicleNumber || 'UP-32-KR-7744',
            vehicleType: existingUser.vehicleType || 'tractor',
            modelName: existingUser.modelName || 'Mahindra 575 DI (50 HP)',
            hourlyRate: existingUser.hourlyRate || 1000,
            acreRate: existingUser.acreRate || 1300,
            verificationStatus: existingUser.verificationStatus || 'verified',
            status: existingUser.status || 'online',
            totalEarnings: existingUser.totalEarnings ?? 0,
            completedRides: existingUser.completedRides ?? 0,
            rating: existingUser.rating ?? 5.0,
            dlImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
            plateImage: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
            lat: 26.9240,
            lng: 80.7130
          });
        }

        audioHelper.playBookingConfirmed();
        return { success: true, isNewUser: false, role: existingUser.role };
      } else {
        setPendingAuthPhone(cleanPhone);
        setIsNewUserRoleSelectionRequired(true);
        audioHelper.playOtpChime();
        return { success: true, isNewUser: true };
      }
    }

    return { 
      success: false, 
      error: lang === 'hi' ? 'गलत ओटीपी कोड। कृपया सही 6-अंकीय कोड दर्ज करें।' : 'Invalid OTP. Please check the code sent to your mobile.' 
    };
  };

  // Direct login upon successful Firebase Phone Auth verification
  const loginWithPhoneSuccess = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const existingUser = usersDb[cleanPhone];

    if (existingUser) {
      const user = {
        isAuthenticated: true,
        phone: existingUser.phone,
        role: existingUser.role,
        name: existingUser.name,
        village: existingUser.village || 'Gram Panchayat Malihabad',
        isAgriStackVerified: !!existingUser.isAgriStackVerified,
        farmerId: existingUser.farmerId || null
      };
      setCurrentUser(user);
      setActiveRole(existingUser.role);

      if (existingUser.role === 'driver') {
        setDriverProfile({
          id: `drv_${existingUser.phone}`,
          fullName: existingUser.name,
          phone: existingUser.phone,
          vehicleNumber: existingUser.vehicleNumber || 'UP-32-KR-7744',
          vehicleType: existingUser.vehicleType || 'tractor',
          modelName: existingUser.modelName || 'Mahindra 575 DI (50 HP)',
          hourlyRate: existingUser.hourlyRate || 1000,
          acreRate: existingUser.acreRate || 1300,
          verificationStatus: existingUser.verificationStatus || 'verified',
          status: existingUser.status || 'online',
          totalEarnings: existingUser.totalEarnings ?? 0,
          completedRides: existingUser.completedRides ?? 0,
          rating: existingUser.rating ?? 5.0,
          dlImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          plateImage: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
          lat: 26.9240,
          lng: 80.7130
        });
      }

      audioHelper.playBookingConfirmed();
      return { success: true, isNewUser: false, role: existingUser.role };
    } else {
      setPendingAuthPhone(cleanPhone);
      setIsNewUserRoleSelectionRequired(true);
      audioHelper.playOtpChime();
      return { success: true, isNewUser: true };
    }
  };

  // Direct Phone Login Helper (Fallback bypass)
  const loginWithPhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const existingUser = usersDb[cleanPhone];

    if (existingUser) {
      const user = {
        isAuthenticated: true,
        phone: existingUser.phone,
        role: existingUser.role,
        name: existingUser.name,
        village: existingUser.village || 'Gram Panchayat Malihabad',
        isAgriStackVerified: !!existingUser.isAgriStackVerified,
        farmerId: existingUser.farmerId || null
      };
      setCurrentUser(user);
      setActiveRole(existingUser.role);
      audioHelper.playBookingConfirmed();
      return { success: true, isNewUser: false, role: existingUser.role };
    } else {
      setPendingAuthPhone(cleanPhone);
      setIsNewUserRoleSelectionRequired(true);
      return { success: true, isNewUser: true };
    }
  };

  // Complete New User Registration & Persist to usersDb
  const completeNewUserRegistration = (role, extraData = {}) => {
    const userPhone = pendingAuthPhone || extraData.phone || '9876543210';
    const userName = extraData.name || (role === 'farmer' ? `Kisan ${userPhone.slice(-4)}` : `Driver ${userPhone.slice(-4)}`);

    const newUserRecord = {
      phone: userPhone,
      role: role,
      name: userName,
      village: extraData.village || 'Gram Malihabad',
      isRegistered: true,
      isAgriStackVerified: !!extraData.isAgriStackVerified,
      farmerId: extraData.farmerId || null,
      aadhaarMasked: extraData.aadhaarMasked || null,
      totalLandBigha: extraData.totalLandBigha || null,
      linkedLands: extraData.linkedLands || [],
      createdAt: new Date().toISOString()
    };

    // 1. Persist to Users Database
    setUsersDb(prev => ({
      ...prev,
      [userPhone]: newUserRecord
    }));

    // 2. Set Active Session
    const user = {
      isAuthenticated: true,
      ...newUserRecord
    };

    setCurrentUser(user);
    setActiveRole(role);
    setIsNewUserRoleSelectionRequired(false);

    // 3. If driver, initialize fresh profile
    if (role === 'driver') {
      setDriverProfile({
        id: `drv_${user.phone}`,
        fullName: user.name,
        phone: user.phone,
        verificationStatus: 'unregistered',
        status: 'offline',
        totalEarnings: 0,
        completedRides: 0,
        rating: 5.0,
        hourlyRate: 1000,
        acreRate: 1300,
        vehicleType: 'tractor',
        modelName: 'Tractor (50 HP)',
        vehicleNumber: '',
        dlImage: '',
        plateImage: '',
        rejectionReason: '',
        lat: 26.9240,
        lng: 80.7130
      });
    }

    // 4. If Farmer has linked lands from AgriStack, save into Saved Lands
    if (extraData.linkedLands && extraData.linkedLands.length > 0) {
      try {
        const existingSaved = localStorage.getItem('krishi_saved_lands');
        const parsedLands = existingSaved ? JSON.parse(existingSaved) : [];
        
        // Map the lands to associate them with the newly registered user
        const mappedNewLands = extraData.linkedLands.map(l => ({
          ...l,
          userPhone: userPhone
        }));

        const combined = [...mappedNewLands, ...parsedLands.filter(l => !mappedNewLands.some(nl => nl.id === l.id))];
        localStorage.setItem('krishi_saved_lands', JSON.stringify(combined));
      } catch (err) {
        console.warn('Error saving linked lands:', err);
      }
    }

    audioHelper.playBookingConfirmed();
    return user;
  };

  // Quick Direct Demo Login
  const quickDemoLogin = (profileType) => {
    if (profileType === 'farmer') {
      const user = usersDb['9876543210'] || MOCK_USER_DATABASE['9876543210'];
      setCurrentUser({ isAuthenticated: true, ...user });
      setActiveRole('farmer');
      if (typeof window !== 'undefined') window.location.hash = '#farmer';
    } else if (profileType === 'verified_driver' || profileType === 'driver') {
      const user = usersDb['9876501234'] || MOCK_USER_DATABASE['9876501234'];
      setCurrentUser({ isAuthenticated: true, ...user });
      setDriverProfile({
        ...DEFAULT_NEW_DRIVER_PROFILE,
        ...user,
        fullName: user.name,
        totalEarnings: 84500,
        completedRides: 142,
        rating: 4.95,
        status: 'online',
        verificationStatus: 'verified'
      });
      setActiveRole('driver');
      if (typeof window !== 'undefined') window.location.hash = '#driver';
    } else if (profileType === 'admin') {
      const user = usersDb['9999999999'] || MOCK_USER_DATABASE['9999999999'];
      setCurrentUser({ isAuthenticated: true, ...user });
      setActiveRole('admin');
      if (typeof window !== 'undefined') window.location.hash = '#admin';
    }
    audioHelper.playBookingConfirmed();
  };

  // Register Driver KYC
  const registerDriverKyc = (formData) => {
    const updated = {
      ...driverProfile,
      ...formData,
      verificationStatus: 'pending',
      rejectionReason: ''
    };
    setDriverProfile(updated);
    audioHelper.playBookingConfirmed();
    return updated;
  };

  // Toggle Driver Online / Offline Duty
  const toggleDriverDuty = () => {
    const nextStatus = driverProfile.status === 'online' ? 'offline' : 'online';
    setDriverProfile(prev => ({ ...prev, status: nextStatus }));
    audioHelper.playOtpChime();
  };

  const setDriverVerification = (status, reason = '') => {
    setDriverProfile(prev => ({ ...prev, verificationStatus: status, rejectionReason: reason }));
  };

  // Record Driver Job Earnings and increment completed rides count
  const recordDriverJobPayout = (amount, driverPhone = '') => {
    const targetPhone = driverPhone || driverProfile?.phone || '9876501234';
    const addedAmount = Number(amount) || 0;

    // Update driverProfile state
    setDriverProfile(prev => ({
      ...prev,
      totalEarnings: (Number(prev.totalEarnings) || 0) + addedAmount,
      completedRides: (Number(prev.completedRides) || 0) + 1
    }));

    // Update usersDb
    setUsersDb(prev => {
      const user = prev[targetPhone] || MOCK_USER_DATABASE[targetPhone];
      if (!user) return prev;
      return {
        ...prev,
        [targetPhone]: {
          ...user,
          totalEarnings: (Number(user.totalEarnings) || 0) + addedAmount,
          completedRides: (Number(user.completedRides) || 0) + 1
        }
      };
    });
  };

  // Record Driver Rating out of 5
  const recordDriverRating = (newRatingStars, driverPhone = '') => {
    const targetPhone = driverPhone || driverProfile?.phone || '9876501234';
    const stars = Math.min(5, Math.max(1, Number(newRatingStars) || 5));

    setDriverProfile(prev => {
      const currentRides = Math.max(1, Number(prev.completedRides) || 1);
      const currentRating = Number(prev.rating) || 4.95;
      // Rolling average calculation
      const computed = (((currentRating * (currentRides > 1 ? currentRides - 1 : 1)) + stars) / currentRides);
      const updatedRating = Number(computed.toFixed(2));
      return {
        ...prev,
        rating: Math.min(5.0, Math.max(1.0, updatedRating))
      };
    });

    setUsersDb(prev => {
      const user = prev[targetPhone] || MOCK_USER_DATABASE[targetPhone];
      if (!user) return prev;
      const currentRides = Math.max(1, Number(user.completedRides) || 1);
      const currentRating = Number(user.rating) || 4.95;
      const computed = (((currentRating * (currentRides > 1 ? currentRides - 1 : 1)) + stars) / currentRides);
      const updatedRating = Number(computed.toFixed(2));
      return {
        ...prev,
        [targetPhone]: {
          ...user,
          rating: Math.min(5.0, Math.max(1.0, updatedRating))
        }
      };
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRole('landing');
    localStorage.removeItem('krishi_current_user');
    localStorage.removeItem('krishi_role');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
  };

  // Delete Farmer / User Account Permanently from Database
  const deleteAccount = (phoneToDelete = '') => {
    const targetPhone = (phoneToDelete || currentUser?.phone || '').replace(/\D/g, '').slice(-10);
    if (!targetPhone) return { success: false, error: 'No phone number provided' };

    // 1. Remove permanently from usersDb
    setUsersDb(prev => {
      const updated = { ...prev };
      delete updated[targetPhone];
      localStorage.setItem('krishi_users_db', JSON.stringify(updated));
      return updated;
    });

    // 2. Clear current session and active role
    setCurrentUser(null);
    setActiveRole('landing');
    localStorage.removeItem('krishi_current_user');
    localStorage.removeItem('krishi_role');
    localStorage.removeItem('krishi_active_booking');

    // 3. Purge farmer-specific saved data
    try {
      // Purge farmer booking history
      localStorage.removeItem('krishi_farmer_booking_history');

      // Purge pre-bookings
      localStorage.removeItem('krishi_pre_bookings');

      // Purge rate limiting for this phone
      localStorage.removeItem(`krishi_otp_rate_limit_${targetPhone}`);

      // Filter out saved lands belonging to this phone
      const savedLandsRaw = localStorage.getItem('krishi_saved_lands');
      if (savedLandsRaw) {
        const parsedLands = JSON.parse(savedLandsRaw);
        const filteredLands = parsedLands.filter(l => l.userPhone !== targetPhone);
        localStorage.setItem('krishi_saved_lands', JSON.stringify(filteredLands));
      }
    } catch (e) {
      console.warn('Error clearing user data on account deletion:', e);
    }

    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }

    audioHelper.playOtpChime();
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        setCurrentUser,
        usersDb,
        driverProfile,
        setDriverProfile,
        registerDriverKyc,
        toggleDriverDuty,
        setDriverVerification,
        recordDriverJobPayout,
        recordDriverRating,
        loginWithPhone,
        loginWithPhoneSuccess,
        requestOtp,
        verifyOtp,
        generatedOtp,
        pendingAuthPhone,
        isNewUserRoleSelectionRequired,
        completeNewUserRegistration,
        quickDemoLogin,
        logout,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
