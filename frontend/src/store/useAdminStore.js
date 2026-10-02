import { create } from 'zustand';

export const useAdminStore = create((set) => ({
  // Platform Metrics
  stats: {
    totalActiveRides: 48,
    sharedRidesActive: 31,
    matchSuccessRate: 84.5,
    todayRevenue: 42800,
    platformCommissionTotal: 6420,
    co2SavedKg: 420,
    totalRegisteredUsers: 14200,
    totalDriversOnline: 310,
    averageSharedSavings: 125
  },

  // Dynamic Pricing & Matching Controls
  config: {
    maxDetourKm: 2.5,
    maxDetourTimeMins: 6,
    minRouteOverlapPercent: 65,
    cabShareDiscountPercent: 45,
    autoShareDiscountPercent: 35,
    surgeMultiplier: 1.1,
    platformCommissionPercent: 15,
    baseFareCab: 50,
    perKmCab: 11
  },

  // Users Management Dataset
  usersList: [
    { id: 'USR_101', name: 'Alex Mercer', phone: '+91 98765 43210', ridesCount: 24, wallet: 450, rating: 4.92, status: 'Active' },
    { id: 'USR_102', name: 'Ananya Roy', phone: '+91 98123 45678', ridesCount: 18, wallet: 820, rating: 4.90, status: 'Active' },
    { id: 'USR_103', name: 'Rohan Verma', phone: '+91 97456 78901', ridesCount: 31, wallet: 120, rating: 4.85, status: 'Active' },
    { id: 'USR_104', name: 'Kavya Sharma', phone: '+91 99012 88221', ridesCount: 9, wallet: 0, rating: 4.65, status: 'Suspended' }
  ],

  // Drivers Management Dataset
  driversList: [
    { id: 'DRV_101', name: 'Rajesh Kumar', phone: '+91 98765 43210', vehicle: 'Swift Dzire (KA 01 MJ 4821)', rating: 4.88, rides: 1420, status: 'Online', earnings: 3250 },
    { id: 'DRV_102', name: 'Arjun Singh', phone: '+91 98123 76543', vehicle: 'Bajaj RE Auto (KA 05 EC 9012)', rating: 4.92, rides: 980, status: 'Online', earnings: 2140 },
    { id: 'DRV_103', name: 'Suresh Patil', phone: '+91 97456 12389', vehicle: 'Hero Splendor (KA 03 HL 1184)', rating: 4.75, rides: 2150, status: 'Offline', earnings: 1890 },
    { id: 'DRV_104', name: 'Priya Sharma', phone: '+91 99012 34567', vehicle: 'Hyundai Aura (KA 04 PC 7731)', rating: 4.95, rides: 830, status: 'In Trip', earnings: 4100 }
  ],

  // Active Rides Live Monitor
  activeRidesList: [
    { id: 'SR_9901', driver: 'Rajesh Kumar', vehicle: 'Share Cab', passengerCount: 2, pickup: 'Indiranagar Metro', destination: 'Embassy TechVillage', overlapPercent: 87, status: 'In Trip', fare: 310 },
    { id: 'SR_9902', driver: 'Arjun Singh', vehicle: 'Share Auto', passengerCount: 3, pickup: 'Koramangala 4th Block', destination: 'HSR Layout BDA', overlapPercent: 92, status: 'In Trip', fare: 255 },
    { id: 'SR_9903', driver: 'Priya Sharma', vehicle: 'Private Cab', passengerCount: 1, pickup: 'MG Road Metro', destination: 'Whitefield ITPL', overlapPercent: 0, status: 'Arriving Pickup', fare: 420 },
    { id: 'SR_9904', driver: 'Vikram Malhotra', vehicle: 'Share Cab', passengerCount: 2, pickup: 'Hebbal Flyover', destination: 'Manyata Tech Park', overlapPercent: 79, status: 'In Trip', fare: 290 }
  ],

  // Drivers Verification Pipeline
  driversPendingVerification: [
    {
      id: 'drv_201',
      name: 'Vikram Malhotra',
      phone: '+91 98450 11223',
      vehicleName: 'Hyundai Xcent',
      vehicleNumber: 'KA 03 MG 9912',
      submittedDate: '28 Sep 2026',
      documentsStatus: { license: 'VERIFIED', rc: 'PENDING', insurance: 'VERIFIED' }
    },
    {
      id: 'drv_202',
      name: 'Sunil Gowda',
      phone: '+91 97310 88221',
      vehicleName: 'TVS King Auto',
      vehicleNumber: 'KA 05 AB 3412',
      submittedDate: '27 Sep 2026',
      documentsStatus: { license: 'VERIFIED', rc: 'VERIFIED', insurance: 'VERIFIED' }
    }
  ],

  // Payments Real-time Log
  paymentsList: [
    { txnId: 'TXN_RZP_8812', user: 'Alex Mercer', amount: 155, method: 'Razorpay UPI', status: 'SUCCESS', commission: 23, driverPayout: 132, date: '28 Sep 11:45 AM' },
    { txnId: 'TXN_RZP_8811', user: 'Ananya Roy', amount: 155, method: 'SmartRide Wallet', status: 'SUCCESS', commission: 23, driverPayout: 132, date: '28 Sep 11:42 AM' },
    { txnId: 'TXN_RZP_8810', user: 'Rohan Verma', amount: 280, method: 'Credit Card', status: 'SUCCESS', commission: 42, driverPayout: 238, date: '28 Sep 11:30 AM' }
  ],

  // Complaints & Safety Logs
  complaintsList: [
    { id: 'CMP_501', user: 'Kavya Sharma', driver: 'Suresh Patil', category: 'Route Deviation', severity: 'HIGH', status: 'PENDING', details: 'Driver took 4.2 km detour without consent.', date: '28 Sep 10:15 AM' },
    { id: 'CMP_502', user: 'Rohan Verma', driver: 'Rajesh Kumar', category: 'AC Temperature', severity: 'LOW', status: 'RESOLVED', details: 'AC cooling was insufficient during commute.', date: '27 Sep 06:20 PM' }
  ],

  // Actions
  updateConfig: (key, val) => set((state) => ({
    config: { ...state.config, [key]: Number(val) }
  })),

  approveDriver: (driverId) => set((state) => ({
    driversPendingVerification: state.driversPendingVerification.filter(d => d.id !== driverId)
  })),

  resolveComplaint: (complaintId) => set((state) => ({
    complaintsList: state.complaintsList.map(c => c.id === complaintId ? { ...c, status: 'RESOLVED' } : c)
  }))
}));
