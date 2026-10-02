// SmartRide Centralized Fare Calculation Engine
import { VEHICLE_TYPES, PLATFORM_CONFIG } from '../config/constants';
import { calculateDriverEarnings } from './matchingEngine';

/**
 * Calculates accurate private and shared ride fares.
 * 
 * @param {Object} params
 * @param {string} params.vehicleTypeId - Vehicle key (e.g., 'cab_share', 'cab_private')
 * @param {number} params.distanceKm - Ride distance in kilometers
 * @param {number} params.durationMins - Ride duration in minutes
 * @param {number} [params.surgeMultiplier=1.0] - Dynamic surge factor (e.g. 1.2)
 * @param {number} [params.passengerCount=1] - Number of passengers sharing
 * @returns {Object} Complete fare breakdown
 */
export function calculateRideFare({
  vehicleTypeId,
  distanceKm,
  durationMins,
  surgeMultiplier = 1.0,
  passengerCount = 1
}) {
  const vehicleConfig = Object.values(VEHICLE_TYPES).find(v => v.id === vehicleTypeId) || VEHICLE_TYPES.CAB_PRIVATE;

  const {
    baseFare,
    perKm,
    perMin,
    allowSharing,
    sharingDiscountPercent = 35
  } = vehicleConfig;

  // 1. Calculate Standard Solo (Private) Base Fare
  const distanceCost = distanceKm * perKm;
  const durationCost = durationMins * perMin;
  const rawSoloFare = (baseFare + distanceCost + durationCost) * surgeMultiplier;
  
  // Add tax & round
  const soloFareBeforeTax = rawSoloFare;
  const taxAmount = (soloFareBeforeTax * PLATFORM_CONFIG.TAX_PERCENT) / 100;
  const privateFare = Math.round(soloFareBeforeTax + taxAmount);

  // 2. Calculate Shared Fare per passenger
  let sharedFarePerPerson = privateFare;
  let totalSharedCollected = privateFare;
  let savingsPerPerson = 0;
  let totalSavings = 0;

  if (allowSharing || vehicleTypeId.includes('share')) {
    // Discount factor based on sharing & passenger count
    const discountMultiplier = 1 - (sharingDiscountPercent / 100);
    sharedFarePerPerson = Math.max(30, Math.round(privateFare * discountMultiplier));
    
    // Total collected when 2+ passengers share
    const numSharingPassengers = Math.max(2, passengerCount + 1);
    totalSharedCollected = sharedFarePerPerson * numSharingPassengers;
    
    savingsPerPerson = Math.max(0, privateFare - sharedFarePerPerson);
    totalSavings = savingsPerPerson;
  }

  // 3. Driver Earnings Calculation
  const isSharedRide = vehicleTypeId.includes('share') || allowSharing;
  const effectiveTotalCollected = isSharedRide ? totalSharedCollected : privateFare;
  const earnings = calculateDriverEarnings(effectiveTotalCollected, isSharedRide, passengerCount);

  return {
    vehicleTypeId,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMins: Math.round(durationMins),
    surgeMultiplier,
    baseFare,
    perKm,
    perMin,
    privateFare,
    sharedFarePerPerson,
    savingsPerPerson,
    savingsPercentage: Math.round((savingsPerPerson / (privateFare || 1)) * 100),
    totalCollected: effectiveTotalCollected,
    driverEarning: earnings.driverNetEarnings,
    platformCommission: earnings.platformCommission,
    taxAmount: Math.round(taxAmount),
    formattedPrivateFare: `₹${privateFare}`,
    formattedSharedFare: `₹${sharedFarePerPerson}`,
    formattedSavings: `₹${savingsPerPerson}`
  };
}

/**
 * Calculates estimated fares for all available vehicle options at once.
 */
export function calculateAllVehicleOptions(distanceKm, durationMins, surgeMultiplier = 1.0) {
  const options = {};
  Object.keys(VEHICLE_TYPES).forEach(key => {
    const vehicle = VEHICLE_TYPES[key];
    options[vehicle.id] = calculateRideFare({
      vehicleTypeId: vehicle.id,
      distanceKm,
      durationMins,
      surgeMultiplier
    });
  });
  return options;
}
