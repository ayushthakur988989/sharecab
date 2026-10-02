import { create } from 'zustand';
import { socketService, SOCKET_EVENTS } from '../services/socketService';
import { INITIAL_MOCK_DRIVERS } from '../config/constants';

const DEFAULT_DRIVER = INITIAL_MOCK_DRIVERS[0] || {
  id: 'drv_101',
  name: 'Rajesh Kumar',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  rating: 4.88,
  totalTrips: 1420,
  vehicleType: 'cab_share',
  vehicleName: 'White Maruti Swift Dzire',
  vehicleNumber: 'KA 01 MJ 4821',
  currentLat: 12.9720,
  currentLng: 77.6350,
  status: 'online',
  isAcceptingShared: true,
};

const INITIAL_REQUESTS = [
  {
    id: 'REQ_9921',
    passengerName: 'Ananya Roy',
    phone: '+91 98123 45678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    pickupAddress: 'Indiranagar 100ft Rd',
    destinationAddress: 'Embassy TechVillage, ORR',
    distanceKm: 9.8,
    estimatedPayout: 215,
    isShared: true,
    sharedBonus: 45,
    coPassengers: 2,
    detourKm: 0.8,
    timeAgo: 'Just now',
    rideOtp: '4821',
    status: 'PENDING'
  },
  {
    id: 'REQ_9922',
    passengerName: 'Rohan Verma',
    phone: '+91 98765 11223',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 4.85,
    pickupAddress: 'Koramangala 80ft Rd',
    destinationAddress: 'HSR Layout Sector 1',
    distanceKm: 6.2,
    estimatedPayout: 145,
    isShared: true,
    sharedBonus: 30,
    coPassengers: 1,
    detourKm: 0.4,
    timeAgo: '3 mins ago',
    rideOtp: '7193',
    status: 'PENDING'
  }
];

export const useDriverStore = create((set, get) => {
  // Listen for real-time ride request emissions from Socket.IO
  socketService.on(SOCKET_EVENTS.RIDE_REQUEST_INITIATED, (req) => {
    if (get().isOnline) {
      get().addIncomingRequest({
        id: req.rideId || 'REQ_' + Math.floor(1000 + Math.random() * 9000),
        passengerName: req.passengerName || 'Passenger',
        phone: req.passengerPhone || '+91 98765 43210',
        rating: 4.9,
        pickupAddress: req.pickup?.name || req.pickup?.address || 'Pickup Point',
        destinationAddress: req.destination?.name || req.destination?.address || 'Destination Point',
        distanceKm: req.distanceKm || 8.5,
        estimatedPayout: req.estimatedPayout || 180,
        isShared: !!req.isShared,
        sharedBonus: req.isShared ? 40 : 0,
        coPassengers: req.isShared ? 2 : 1,
        detourKm: 0.6,
        timeAgo: 'Just now',
        rideOtp: req.rideOtp || '4821',
        status: 'PENDING'
      });
    }
  });

  return {
    isOnline: true,
    currentLocation: { lat: 12.9720, lng: 77.6350, heading: 45 },
    driverProfile: DEFAULT_DRIVER,

    // Earnings today summary
    todayEarnings: 1850,
    todayTrips: 9,
    todayOnlineHours: 6.2,
    acceptanceRate: 96,

    // Incoming ride request popup & queue
    incomingRequest: null,
    requestsList: INITIAL_REQUESTS,

    // Active navigation trip
    activeTrip: null,
    stopSequence: [],
    currentStopIndex: 0,

    // Actions
    toggleOnline: () => {
      const nextState = !get().isOnline;
      set({ isOnline: nextState });
      socketService.emit(SOCKET_EVENTS.DRIVER_STATUS_TOGGLE, { isOnline: nextState });
    },

    updateDriverProfile: (updates) => {
      set((state) => ({
        driverProfile: { ...state.driverProfile, ...updates }
      }));
    },

    addIncomingRequest: (newReq) => {
      const formattedReq = {
        ...newReq,
        timeAgo: 'Just now',
        status: 'PENDING',
        expiresInSec: 30
      };

      set((state) => ({
        incomingRequest: formattedReq,
        requestsList: [formattedReq, ...state.requestsList.filter(r => r.id !== newReq.id)]
      }));
    },

    triggerDemoIncomingRequest: () => {
      get().addIncomingRequest({
        id: 'REQ_' + Math.floor(1000 + Math.random() * 9000),
        passengerName: 'Kavya Sharma',
        phone: '+91 99012 34567',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        rating: 4.95,
        pickupAddress: 'Indiranagar 100ft Rd',
        destinationAddress: 'Embassy TechVillage, ORR',
        distanceKm: 9.8,
        estimatedPayout: 215,
        isShared: true,
        sharedBonus: 45,
        coPassengers: 2,
        detourKm: 0.8,
        rideOtp: '5829'
      });
    },

    acceptIncomingRequest: () => {
      const req = get().incomingRequest;
      if (!req) return;
      get().acceptRequestById(req.id);
    },

    acceptRequestById: (reqId) => {
      const targetReq = get().requestsList.find(r => r.id === reqId) || get().incomingRequest;
      if (!targetReq) return;

      const driverProfile = get().driverProfile;

      // Emit Socket event to backend and passenger app
      socketService.driverAcceptRide({
        rideId: targetReq.id,
        driver: driverProfile
      });

      // Also directly update useRideStore if in same window
      try {
        import('./useRideStore').then(({ useRideStore, RIDE_STATUS }) => {
          useRideStore.getState().onDriverAccepted(driverProfile);
        });
      } catch (e) {
        console.warn(e);
      }

      set((state) => ({
        incomingRequest: null,
        requestsList: state.requestsList.map(r => r.id === reqId ? { ...r, status: 'ACCEPTED' } : r),
        activeTrip: {
          id: targetReq.id,
          passengerName: targetReq.passengerName,
          passengerPhone: targetReq.phone || '+91 98765 43210',
          rating: targetReq.rating,
          status: 'ARRIVING_PICKUP',
          pickupAddress: targetReq.pickupAddress,
          destinationAddress: targetReq.destinationAddress,
          fare: targetReq.estimatedPayout,
          rideOtp: targetReq.rideOtp || '4821',
          passengersCount: targetReq.isShared ? 2 : 1,
          stops: [
            { type: 'PICKUP', name: targetReq.passengerName, address: targetReq.pickupAddress, status: 'NEXT' },
            { type: 'DROP', name: targetReq.passengerName, address: targetReq.destinationAddress, status: 'PENDING' }
          ]
        }
      }));
    },

    rejectIncomingRequest: () => {
      const req = get().incomingRequest;
      if (req) {
        get().rejectRequestById(req.id);
      }
    },

    rejectRequestById: (reqId) => {
      set((state) => ({
        incomingRequest: state.incomingRequest?.id === reqId ? null : state.incomingRequest,
        requestsList: state.requestsList.filter(r => r.id !== reqId)
      }));
    },

    progressTripStep: () => {
      const trip = get().activeTrip;
      if (!trip) return;

      let nextStatus = trip.status;
      if (trip.status === 'ARRIVING_PICKUP') {
        nextStatus = 'PICKUP_ARRIVED';
        socketService.emit(SOCKET_EVENTS.DRIVER_ARRIVED, { rideId: trip.id });
      } else if (trip.status === 'PICKUP_ARRIVED') {
        nextStatus = 'TRIP_IN_PROGRESS';
        socketService.emit(SOCKET_EVENTS.RIDE_STARTED, { rideId: trip.id });
      } else if (trip.status === 'TRIP_IN_PROGRESS') {
        nextStatus = 'COMPLETED';
        socketService.emit(SOCKET_EVENTS.RIDE_COMPLETED, { rideId: trip.id });
      }

      if (nextStatus === 'COMPLETED') {
        set((state) => ({
          activeTrip: null,
          todayEarnings: state.todayEarnings + trip.fare,
          todayTrips: state.todayTrips + 1
        }));
      } else {
        set({
          activeTrip: { ...trip, status: nextStatus }
        });
      }
    }
  };
});
