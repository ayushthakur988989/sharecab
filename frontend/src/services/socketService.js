// SmartRide Socket.IO Real-time Architecture & Event Bridge
// Bidirectional event hub connecting Passenger <-> Backend Socket Server <-> Driver Console

export const SOCKET_EVENTS = {
  // Driver GPS & Status Events
  DRIVER_LOCATION_UPDATE: 'driver:location_update',
  DRIVER_STATUS_TOGGLE: 'driver:status_toggle',
  DRIVER_ACCEPT_RIDE: 'driver:accept_ride',
  DRIVER_REJECT_RIDE: 'driver:reject_ride',
  DRIVER_ARRIVED: 'driver:arrived',

  // Ride Lifecycle Events
  RIDE_REQUEST_INITIATED: 'ride:request_initiated',
  RIDE_STATUS_CHANGE: 'ride:status_change',
  RIDE_MATCH_SEARCHING: 'ride:match_searching',
  RIDE_MATCH_FOUND: 'ride:match_found',

  // Shared Ride Pooling Events
  SHARED_RIDE_REQUEST: 'ride:shared_ride_request',
  SHARED_PASSENGER_JOIN_REQUEST: 'ride:shared_passenger_join_request',
  SHARED_PASSENGER_JOINED: 'ride:shared_passenger_joined',

  // Trip Progress Events
  RIDE_STARTED: 'ride:started',
  RIDE_COMPLETED: 'ride:completed',
  RIDE_CANCELLED: 'ride:cancelled',
  PAYMENT_STATUS_UPDATE: 'payment:status_update',
};

class SocketService {
  constructor() {
    this.listeners = new Map();
    this.activeSimulations = new Map();
    this.isConnected = true;
  }

  /**
   * Subscribe callback to a Socket.IO event.
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe callback from a Socket.IO event.
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, callbacks);
  }

  /**
   * Emits an event to all subscribed client listeners (Bidirectional Event Bus).
   */
  emit(event, data) {
    console.log(`[Socket.IO Event Emitted] -> ${event}:`, data);
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }

  /**
   * Driver Action: Accepts an incoming ride request and broadcasts acceptance to passenger.
   */
  driverAcceptRide({ rideId, driver }) {
    this.emit(SOCKET_EVENTS.DRIVER_ACCEPT_RIDE, {
      rideId,
      driver,
      timestamp: new Date().toISOString(),
      status: 'DRIVER_ASSIGNED'
    });

    this.emit(SOCKET_EVENTS.RIDE_STATUS_CHANGE, {
      rideId,
      status: 'DRIVER_ASSIGNED',
      driver,
      message: `${driver.name} accepted your ride request`
    });
  }

  /**
   * Shared Ride Action: A co-passenger requests to join an ongoing route.
   */
  requestSharedPassengerJoin({ rideId, passenger }) {
    this.emit(SOCKET_EVENTS.SHARED_PASSENGER_JOIN_REQUEST, {
      rideId,
      passenger,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Shared Ride Action: Confirms a new passenger joining the ride pool.
   */
  confirmPassengerJoined({ rideId, newPassenger, totalPassengersCount, updatedFare }) {
    this.emit(SOCKET_EVENTS.SHARED_PASSENGER_JOINED, {
      rideId,
      newPassenger,
      totalPassengersCount,
      updatedFare,
      timestamp: new Date().toISOString()
    });

    this.emit(SOCKET_EVENTS.RIDE_STATUS_CHANGE, {
      rideId,
      status: 'SHARED_PASSENGER_JOINED',
      message: `${newPassenger.name} joined the shared ride`
    });
  }

  /**
   * Real-time GPS Tracker: Simulates high-frequency driver location updates (every 1.2s).
   */
  startDriverGpsStream({ rideId, driverId, startCoords, destinationCoords }) {
    this.stopDriverGpsStream(rideId);

    let step = 0;
    const totalSteps = 25;

    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;

      // Calculate smooth current coordinate position
      const currentLat = startCoords.lat + (destinationCoords.lat - startCoords.lat) * progress;
      const currentLng = startCoords.lng + (destinationCoords.lng - startCoords.lng) * progress;

      // Calculate bearing / heading angle
      const dLng = destinationCoords.lng - startCoords.lng;
      const heading = Math.round((Math.atan2(dLng, destinationCoords.lat - startCoords.lat) * 180) / Math.PI);

      const locationPayload = {
        rideId,
        driverId,
        lat: Math.round(currentLat * 100000) / 100000,
        lng: Math.round(currentLng * 100000) / 100000,
        heading,
        speedKmh: Math.round(30 + Math.random() * 8),
        etaMins: Math.max(1, Math.round(12 * (1 - progress))),
        progressPercent: Math.round(progress * 100)
      };

      // Broadcast location tick
      this.emit(SOCKET_EVENTS.DRIVER_LOCATION_UPDATE, locationPayload);

      // Status events at key thresholds
      if (step === 8) {
        this.emit(SOCKET_EVENTS.DRIVER_ARRIVED, {
          rideId,
          message: 'Driver has arrived at pickup point'
        });
      }

      if (step === 12) {
        this.emit(SOCKET_EVENTS.RIDE_STARTED, {
          rideId,
          message: 'Trip started'
        });
      }

      if (step >= totalSteps) {
        this.stopDriverGpsStream(rideId);
        this.emit(SOCKET_EVENTS.RIDE_COMPLETED, {
          rideId,
          timestamp: new Date().toISOString(),
          message: 'Ride completed successfully'
        });
      }
    }, 1200);

    this.activeSimulations.set(rideId, interval);
  }

  stopDriverGpsStream(rideId) {
    if (this.activeSimulations.has(rideId)) {
      clearInterval(this.activeSimulations.get(rideId));
      this.activeSimulations.delete(rideId);
    }
  }

  stopAll() {
    this.activeSimulations.forEach(id => clearInterval(id));
    this.activeSimulations.clear();
  }
}

export const socketService = new SocketService();
