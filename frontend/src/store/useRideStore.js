import { create } from 'zustand';
import { MOCK_LOCATIONS, INITIAL_MOCK_DRIVERS } from '../config/constants';
import { calculateAllVehicleOptions } from '../services/fareEngine';
import { findCompatiblePassengers, MOCK_PASSENGER_CANDIDATES } from '../services/matchingEngine';
import { socketService, SOCKET_EVENTS } from '../services/socketService';
import { useDriverStore } from './useDriverStore';

export const RIDE_STATUS = {
  IDLE: 'IDLE',
  SEARCHING_MATCH: 'SEARCHING_MATCH',
  MATCH_FOUND: 'MATCH_FOUND',
  SEARCHING_DRIVER: 'SEARCHING_DRIVER',
  NO_DRIVER_AVAILABLE: 'NO_DRIVER_AVAILABLE',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  IN_TRIP: 'IN_TRIP',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'COMPLETED',
};

export const useRideStore = create((set, get) => {
  // Wire up Socket.IO event listeners for real-time updates
  socketService.on(SOCKET_EVENTS.DRIVER_LOCATION_UPDATE, (data) => {
    const currentDriver = get().activeDriver;
    if (currentDriver) {
      set({
        activeDriver: {
          ...currentDriver,
          currentLat: data.lat,
          currentLng: data.lng,
          heading: data.heading,
          etaMins: data.etaMins
        }
      });
    }
  });

  socketService.on(SOCKET_EVENTS.RIDE_STATUS_CHANGE, (data) => {
    if (data.status) {
      set({ rideStatus: data.status });
    }
  });

  socketService.on(SOCKET_EVENTS.DRIVER_ACCEPT_RIDE, (data) => {
    if (data.driver) {
      get().onDriverAccepted(data.driver);
    }
  });

  socketService.on(SOCKET_EVENTS.SHARED_PASSENGER_JOINED, (data) => {
    const currentPass = get().sharedPassengers;
    if (data.newPassenger) {
      set({
        sharedPassengers: [...currentPass, { name: data.newPassenger.name, status: 'Joined Shared Ride', avatar: data.newPassenger.avatar }]
      });
    }
  });

  return {
    pickup: MOCK_LOCATIONS[0], // Default Indiranagar Metro Station
    destination: MOCK_LOCATIONS[2], // Default Embassy TechVillage
    selectedVehicleId: 'cab_share',
    isSharingPreferred: true,
    
    // Status state
    rideStatus: RIDE_STATUS.IDLE,
    
    // Vehicle fare options
    fareOptions: calculateAllVehicleOptions(9.8, 22),
    distanceKm: 9.8,
    durationMins: 22,
    
    // Dynamic Ride Matching & Driver State
    potentialMatch: null,
    allMatchedCandidates: [],
    activeDriver: null,
    sharedPassengers: [],
    currentRideId: null,
    rideOtp: '4829', // 4-digit unique start OTP
    searchSecondsRemaining: 300, // 5 minutes timeout (300 seconds)

    // Saved places
    savedPlaces: [
      { id: 'sp_1', label: 'Home', address: 'HSR Layout Sector 6, Bengaluru', icon: 'Home', loc: MOCK_LOCATIONS[4] },
      { id: 'sp_2', label: 'Work', address: 'Embassy TechVillage, Bellandur', icon: 'Briefcase', loc: MOCK_LOCATIONS[2] },
      { id: 'sp_3', label: 'Gym', address: '100ft Rd, Indiranagar', icon: 'Dumbbell', loc: MOCK_LOCATIONS[0] }
    ],

    // Recent rides history
    rideHistory: [
      {
        id: 'RIDE_8812',
        date: 'Yesterday, 6:30 PM',
        pickupName: 'Embassy TechVillage',
        destName: 'Indiranagar Metro',
        vehicleName: 'Share Cab',
        fare: 155,
        saved: 125,
        wasShared: true,
        coPassengersCount: 2,
        driverName: 'Rajesh Kumar',
        status: 'Completed'
      }
    ],

    // Actions
    setPickup: (location) => {
      set({ pickup: location });
      get().recalculateFares();
    },

    setDestination: (location) => {
      set({ destination: location });
      get().recalculateFares();
    },

    setSelectedVehicle: (vehicleId) => {
      const isShare = vehicleId.includes('share');
      set({
        selectedVehicleId: vehicleId,
        isSharingPreferred: isShare
      });
    },

    toggleSharingPreference: (preferred) => {
      const current = get().selectedVehicleId;
      let newVehicle = current;
      if (preferred && current === 'cab_private') newVehicle = 'cab_share';
      if (preferred && current === 'auto_private') newVehicle = 'auto_share';
      if (!preferred && current === 'cab_share') newVehicle = 'cab_private';
      if (!preferred && current === 'auto_share') newVehicle = 'auto_private';

      set({
        isSharingPreferred: preferred,
        selectedVehicleId: newVehicle
      });
    },

    recalculateFares: () => {
      const { pickup, destination } = get();
      if (!pickup || !destination) return;
      
      const dist = Math.max(2, Math.round((Math.abs(pickup.lat - destination.lat) + Math.abs(pickup.lng - destination.lng)) * 111 * 10) / 10);
      const dur = Math.max(5, Math.round((dist / 30) * 60));

      const options = calculateAllVehicleOptions(dist, dur);
      set({
        distanceKm: dist,
        durationMins: dur,
        fareOptions: options
      });
    },

    // Step 1: Start searching for shared passenger match
    startSearchingMatch: () => {
      set({ rideStatus: RIDE_STATUS.SEARCHING_MATCH });

      socketService.emit(SOCKET_EVENTS.RIDE_MATCH_SEARCHING, {
        pickup: get().pickup,
        destination: get().destination
      });

      setTimeout(() => {
        const { pickup, destination, selectedVehicleId } = get();
        const matches = findCompatiblePassengers(
          { pickup, destination, vehicleType: selectedVehicleId, passengerCount: 1 },
          MOCK_PASSENGER_CANDIDATES
        );
        
        if (matches.length > 0) {
          set({
            potentialMatch: matches[0],
            allMatchedCandidates: matches,
            rideStatus: RIDE_STATUS.MATCH_FOUND
          });
          socketService.emit(SOCKET_EVENTS.RIDE_MATCH_FOUND, { match: matches[0] });
        } else {
          set({
            potentialMatch: {
              passengerName: 'Rohan Verma',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
              rating: 4.85,
              routeOverlapPercent: 87,
              detourKm: 1.2,
              etaImpactMins: 2,
              pickupAddress: 'Koramangala 80ft Rd',
              destinationAddress: 'ORR Devarabesanahalli',
              fare: 155,
              savings: 125
            },
            allMatchedCandidates: [],
            rideStatus: RIDE_STATUS.MATCH_FOUND
          });
        }
      }, 1500);
    },

    // Step 2: Book Ride & Start 5-min Driver Search (Syncs to Driver console)
    acceptMatchAndFindDriver: () => {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const rideId = 'SR_' + Math.floor(100000 + Math.random() * 900000);
      const { pickup, destination, selectedVehicleId, fareOptions, distanceKm, durationMins } = get();
      const currentFare = fareOptions[selectedVehicleId]?.sharedFarePerPerson || fareOptions.cab_share?.sharedFarePerPerson || 155;

      set({
        rideStatus: RIDE_STATUS.SEARCHING_DRIVER,
        currentRideId: rideId,
        rideOtp: generatedOtp,
        searchSecondsRemaining: 300 // 5 minutes
      });

      // 1. Emit to Socket.IO
      socketService.emit(SOCKET_EVENTS.RIDE_REQUEST_INITIATED, {
        rideId,
        pickup,
        destination,
        vehicleType: selectedVehicleId,
        rideOtp: generatedOtp,
        estimatedPayout: currentFare,
        isShared: selectedVehicleId.includes('share'),
        distanceKm,
        durationMins
      });

      // 2. Sync directly with Driver Store so it appears in Driver's incoming requests queue
      useDriverStore.getState().addIncomingRequest({
        id: rideId,
        passengerName: 'Alex Mercer (You)',
        phone: '+91 98765 43210',
        rating: 4.92,
        pickupAddress: pickup?.name || pickup?.address || 'Pickup Point',
        destinationAddress: destination?.name || destination?.address || 'Destination Point',
        distanceKm,
        estimatedPayout: currentFare,
        isShared: selectedVehicleId.includes('share'),
        sharedBonus: selectedVehicleId.includes('share') ? 45 : 0,
        coPassengers: selectedVehicleId.includes('share') ? 2 : 1,
        detourKm: 0.8,
        rideOtp: generatedOtp
      });
    },

    // Direct booking (without matching step)
    directBookRide: () => {
      get().acceptMatchAndFindDriver();
    },

    // Decrement 5-minute search timer
    decrementSearchTimer: () => {
      const remaining = get().searchSecondsRemaining;
      if (remaining <= 1) {
        set({
          searchSecondsRemaining: 0,
          rideStatus: RIDE_STATUS.NO_DRIVER_AVAILABLE
        });
      } else {
        set({ searchSecondsRemaining: remaining - 1 });
      }
    },

    // Called when Driver accepts the ride
    onDriverAccepted: (driver) => {
      const assigned = driver || INITIAL_MOCK_DRIVERS[0];
      const candidates = get().allMatchedCandidates;

      const coPassList = [
        { name: 'You (Alex)', status: 'Pickup Pending', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
        { name: candidates[0]?.passengerName || 'Rohan Verma', status: 'Joining en route', avatar: candidates[0]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
      ];

      set({
        activeDriver: assigned,
        sharedPassengers: coPassList,
        rideStatus: RIDE_STATUS.DRIVER_ASSIGNED
      });

      // Start live GPS movement stream
      socketService.startDriverGpsStream({
        rideId: get().currentRideId,
        driverId: assigned.id,
        startCoords: { lat: assigned.currentLat || 12.9720, lng: assigned.currentLng || 77.6350 },
        destinationCoords: get().pickup
      });
    },

    // Simulation helpers for testing
    simulateDriverAccept: () => {
      get().onDriverAccepted(INITIAL_MOCK_DRIVERS[0]);
    },

    triggerNoDriverAvailable: () => {
      set({
        searchSecondsRemaining: 0,
        rideStatus: RIDE_STATUS.NO_DRIVER_AVAILABLE
      });
    },

    retryDriverSearch: () => {
      get().acceptMatchAndFindDriver();
    },

    setRideStatus: (status) => set({ rideStatus: status }),

    resetRide: () => {
      socketService.stopAll();
      set({
        rideStatus: RIDE_STATUS.IDLE,
        potentialMatch: null,
        allMatchedCandidates: [],
        activeDriver: null,
        sharedPassengers: [],
        currentRideId: null,
        searchSecondsRemaining: 300
      });
    }
  };
});
