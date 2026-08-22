import React, { createContext, useContext, useState, useEffect } from 'react';
import { audioHelper } from '../utils/audioHelper';

const AuthContext = createContext();

// Default Pre-Registered Users Database
export const MOCK_USER_DATABASE = {
  '9876543210': {
    phone: '9876543210',
    role: 'farmer',
    name: 'Balram Singh (बलराम सिंह)',
    village: 'Gram Malihabad, Lucknow',
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
  const [generatedOtp, setGeneratedOtp] = useState('1234');
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

  // Real-time listener for driver verification changes across tabs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('krishi_realtime_network');
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
        }
      };
      return () => channel.close();
    }
  }, []);

  // Request OTP
  const requestOtp = (phone) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setPendingAuthPhone(phone);
    audioHelper.playOtpChime();
    return otp;
  };

  // Verify OTP
  const verifyOtp = (phone, otp) => {
    if (otp === generatedOtp || otp === '1234' || otp === '9999') {
      const existingUser = usersDb[phone];

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
            lat: 26.8540,
            lng: 80.9520
          });
        }

        audioHelper.playBookingConfirmed();
        return { success: true, isNewUser: false, role: existingUser.role };
      } else {
        setPendingAuthPhone(phone);
        setIsNewUserRoleSelectionRequired(true);
        audioHelper.playOtpChime();
        return { success: true, isNewUser: true };
      }
    }
    return { success: false, error: 'Invalid OTP code' };
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
        lat: 26.8540,
        lng: 80.9520
      });
    }

    // 4. If Farmer has linked lands from AgriStack, save into Saved Lands
    if (extraData.linkedLands && extraData.linkedLands.length > 0) {
      try {
        const existingSaved = localStorage.getItem('krishi_saved_lands');
        const parsedLands = existingSaved ? JSON.parse(existingSaved) : [];
        const combined = [...extraData.linkedLands, ...parsedLands.filter(l => !extraData.linkedLands.some(nl => nl.id === l.id))];
        localStorage.setItem('krishi_saved_lands', JSON.stringify(combined));
      } catch (err) {
        console.warn('Error saving linked lands:', err);
      }
    }

    audioHelper.playBookingConfirmed();
    return user;
  };

  // Quick Direct Login
  const quickDemoLogin = (profileType) => {
    if (profileType === 'farmer') {
      const user = usersDb['9876543210'] || MOCK_USER_DATABASE['9876543210'];
      setCurrentUser({ isAuthenticated: true, ...user });
      setActiveRole('farmer');
    } else if (profileType === 'verified_driver') {
      const user = usersDb['9876501234'] || MOCK_USER_DATABASE['9876501234'];
      setCurrentUser({ isAuthenticated: true, ...user });
      setDriverProfile({
        ...DEFAULT_NEW_DRIVER_PROFILE,
        ...user,
        fullName: user.name,
        totalEarnings: 84500,
        completedRides: 142,
        rating: 4.95
      });
      setActiveRole('driver');
    } else if (profileType === 'admin') {
      const user = usersDb['9999999999'] || MOCK_USER_DATABASE['9999999999'];
      setCurrentUser({ isAuthenticated: true, ...user });
      setActiveRole('admin');
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

  const logout = () => {
    setCurrentUser(null);
    setActiveRole('landing');
    localStorage.removeItem('krishi_current_user');
    localStorage.removeItem('krishi_role');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
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
        requestOtp,
        verifyOtp,
        generatedOtp,
        pendingAuthPhone,
        isNewUserRoleSelectionRequired,
        completeNewUserRegistration,
        quickDemoLogin,
        logout
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
