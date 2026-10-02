// SmartRide Intelligent Route & Passenger Matching Engine
import { MATCHING_THRESHOLDS, VEHICLE_TYPES, PLATFORM_CONFIG } from '../config/constants';

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates pickup distance between primary ride pickup and candidate passenger pickup.
 */
export function calculatePickupDistance(p1, p2) {
  return calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
}

/**
 * Calculates destination distance between primary ride drop and candidate passenger drop.
 */
export function calculateDestinationDistance(d1, d2) {
  return calculateDistanceKm(d1.lat, d1.lng, d2.lat, d2.lng);
}

/**
 * Estimates detour distance in kilometers when adding co-passenger pickups & drops.
 */
export function calculateDetour(pickup1, drop1, pickup2, drop2) {
  const directDistance = calculateDistanceKm(pickup1.lat, pickup1.lng, drop1.lat, drop1.lng);
  
  // Seq 1: P1 -> P2 -> D2 -> D1
  const distSeq1 = 
    calculateDistanceKm(pickup1.lat, pickup1.lng, pickup2.lat, pickup2.lng) +
    calculateDistanceKm(pickup2.lat, pickup2.lng, drop2.lat, drop2.lng) +
    calculateDistanceKm(drop2.lat, drop2.lng, drop1.lat, drop1.lng);
    
  // Seq 2: P1 -> P2 -> D1 -> D2
  const distSeq2 =
    calculateDistanceKm(pickup1.lat, pickup1.lng, pickup2.lat, pickup2.lng) +
    calculateDistanceKm(pickup2.lat, pickup2.lng, drop1.lat, drop1.lng) +
    calculateDistanceKm(drop1.lat, drop1.lng, drop2.lat, drop2.lng);

  const bestSharedDistance = Math.min(distSeq1, distSeq2);
  const extraDetourKm = Math.max(0, Math.round((bestSharedDistance - directDistance) * 10) / 10);
  
  return {
    directDistance,
    bestSharedDistance: Math.round(bestSharedDistance * 10) / 10,
    extraDetourKm,
    detourPercentage: Math.round((extraDetourKm / (directDistance || 1)) * 100),
    optimalSequence: distSeq1 <= distSeq2 ? ['P1', 'P2', 'D2', 'D1'] : ['P1', 'P2', 'D1', 'D2']
  };
}

/**
 * Calculates ETA impact (extra delay in minutes) based on vehicle speed and detour km.
 */
export function calculateETAImpact(detourKm, vehicleSpeedKmh = 35) {
  const extraMinutes = Math.round((detourKm / vehicleSpeedKmh) * 60) + 2; // +2 mins for stop dwell time
  return Math.max(1, extraMinutes);
}

/**
 * Calculates route overlap percentage based on directional vector alignment and shared segment.
 */
export function calculateRouteOverlap(p1, d1, p2, d2) {
  const pickupDist = calculatePickupDistance(p1, p2);
  const dropDist = calculateDestinationDistance(d1, d2);
  
  // High overlap if pickup & drop are close to primary route direction
  const proximityDeduction = (pickupDist + dropDist) * 8; 
  const overlapPercent = Math.max(10, Math.min(98, Math.round(100 - proximityDeduction)));

  return overlapPercent;
}

/**
 * Validates if the vehicle has capacity for additional passengers.
 */
export function validateVehicleCapacity(vehicleType, currentPassengerCount, requestedSeats = 1) {
  const vehicleConfig = Object.values(VEHICLE_TYPES).find(v => v.id === vehicleType) || VEHICLE_TYPES.CAB_SHARE;
  const maxCap = vehicleConfig.capacity || 4;
  return (currentPassengerCount + requestedSeats) <= maxCap;
}

/**
 * Realistic Candidate Passenger Requests for Demonstration
 */
export const MOCK_PASSENGER_CANDIDATES = [
  {
    id: 'cand_101',
    passengerName: 'Rohan Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4.85,
    pickup: { name: 'Koramangala 80ft Rd', address: 'Near Sony World Signal', lat: 12.9352, lng: 77.6245 },
    destination: { name: 'Bellandur EcoSpace', address: 'Outer Ring Rd', lat: 12.9260, lng: 77.6934 },
    seatsRequested: 1
  },
  {
    id: 'cand_102',
    passengerName: 'Ananya Roy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    rating: 4.92,
    pickup: { name: 'Indiranagar 100ft Rd', address: 'Stage 2 Indiranagar', lat: 12.9720, lng: 77.6350 },
    destination: { name: 'HSR Layout Sector 1', address: 'Outer Ring Rd Junction', lat: 12.9116, lng: 77.6389 },
    seatsRequested: 1
  },
  {
    id: 'cand_103',
    passengerName: 'Vikram Seth (Out of route)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 4.60,
    pickup: { name: 'Hebbal Flyover', address: 'North Bengaluru', lat: 13.0358, lng: 77.5970 },
    destination: { name: 'Yelahanka New Town', address: 'Doddaballapur Rd', lat: 13.1007, lng: 77.5963 },
    seatsRequested: 1
  }
];

/**
 * Finds all compatible passengers along an existing ride route based on configurable thresholds.
 */
export function findCompatiblePassengers(primaryRide, candidateRequests = MOCK_PASSENGER_CANDIDATES, customThresholds = {}) {
  const thresholds = { ...MATCHING_THRESHOLDS, ...customThresholds };
  const matches = [];

  const { pickup: p1, destination: d1, vehicleType, passengerCount = 1 } = primaryRide;

  for (const candidate of candidateRequests) {
    const p2 = candidate.pickup;
    const d2 = candidate.destination;

    // 1. Vehicle Capacity Check
    if (!validateVehicleCapacity(vehicleType, passengerCount, candidate.seatsRequested || 1)) {
      continue;
    }

    // 2. Spatial Calculations
    const pickupDist = calculatePickupDistance(p1, p2);
    const dropDist = calculateDestinationDistance(d1, d2);
    const detourResult = calculateDetour(p1, d1, p2, d2);
    const overlapPercent = calculateRouteOverlap(p1, d1, p2, d2);
    const etaImpactMins = calculateETAImpact(detourResult.extraDetourKm);

    // 3. Threshold Evaluation
    const isPickupOk = pickupDist <= thresholds.MAX_PICKUP_DETOUR_KM;
    const isDropOk = dropDist <= thresholds.MAX_DESTINATION_DETOUR_KM;
    const isDetourOk = etaImpactMins <= thresholds.MAX_DETOUR_TIME_MINS;
    const isOverlapOk = overlapPercent >= thresholds.MIN_ROUTE_OVERLAP_PERCENT;

    const isMatch = isPickupOk && isDropOk && isDetourOk && isOverlapOk;

    if (isMatch) {
      matches.push({
        candidateId: candidate.id,
        passengerName: candidate.passengerName,
        avatar: candidate.avatar,
        rating: candidate.rating,
        pickupDistanceKm: pickupDist,
        dropDistanceKm: dropDist,
        routeOverlapPercent: overlapPercent,
        detourKm: detourResult.extraDetourKm,
        etaImpactMins,
        pickupAddress: p2.address || p2.name,
        destinationAddress: d2.address || d2.name,
        pickupCoords: p2,
        destinationCoords: d2,
        seatsRequested: candidate.seatsRequested || 1,
        matchScore: Math.round(overlapPercent - (detourResult.extraDetourKm * 5)),
        fare: 155,
        savings: 125
      });
    }
  }

  // Sort candidates by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculates optimal multi-passenger route stop sequence.
 */
export function calculateMultiPassengerRouteSequence(primaryPickup, primaryDrop, matchedPassengers = []) {
  const stops = [
    { type: 'PICKUP', label: 'Pick up Primary Passenger', lat: primaryPickup.lat, lng: primaryPickup.lng, address: primaryPickup.name }
  ];

  matchedPassengers.forEach(p => {
    stops.push({ type: 'PICKUP_SHARED', label: `Pick up ${p.passengerName}`, lat: p.pickupCoords.lat, lng: p.pickupCoords.lng, address: p.pickupAddress });
  });

  matchedPassengers.forEach(p => {
    stops.push({ type: 'DROP_SHARED', label: `Drop off ${p.passengerName}`, lat: p.destinationCoords.lat, lng: p.destinationCoords.lng, address: p.destinationAddress });
  });

  stops.push({ type: 'DROP', label: 'Drop off Primary Passenger', lat: primaryDrop.lat, lng: primaryDrop.lng, address: primaryDrop.name });

  return stops;
}

/**
 * Centralized driver earnings calculation with shared ride incentives.
 */
export function calculateDriverEarnings(totalCollectedFare, isShared = false, passengerCount = 1) {
  const platformFee = (totalCollectedFare * PLATFORM_CONFIG.PLATFORM_COMMISSION_PERCENT) / 100;
  let driverBase = totalCollectedFare - platformFee;

  if (isShared && passengerCount > 1) {
    // Give bonus share for completing shared multi-stop ride
    const shareBonus = (driverBase * PLATFORM_CONFIG.DRIVER_SHARE_BONUS_PERCENT) / 100;
    driverBase += shareBonus;
  }

  return {
    grossFare: Math.round(totalCollectedFare),
    platformCommission: Math.round(platformFee),
    driverNetEarnings: Math.round(driverBase),
    isSharedBonusApplied: isShared && passengerCount > 1
  };
}
