import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Car, Bike, Users, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useRideStore } from '../../store/useRideStore';
import { VehicleCard, RidePreferenceSelector } from '../../components/booking/VehicleComponents';
import { MapView } from '../../components/map/MapView';
import { Button, Badge } from '../../components/common/UIComponents';
import { VEHICLE_TYPES } from '../../config/constants';

export function RideSelectPage() {
  const navigate = useNavigate();
  const {
    pickup,
    destination,
    selectedVehicleId,
    isSharingPreferred,
    fareOptions,
    setSelectedVehicle,
    toggleSharingPreference,
    startSearchingMatch,
    acceptMatchAndFindDriver
  } = useRideStore();

  const currentFareData = fareOptions[selectedVehicleId] || fareOptions.cab_share;

  const handleBookClick = () => {
    if (isSharingPreferred) {
      startSearchingMatch();
    } else {
      acceptMatchAndFindDriver();
    }
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 max-w-md mx-auto space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Select Your Ride</h1>
          <p className="text-xs text-slate-500">Compare vehicle options & route sharing discounts</p>
        </div>
        <Badge variant="emerald" icon={Sparkles}>
          Save up to 45%
        </Badge>
      </div>

      {/* Map Preview */}
      <MapView pickup={pickup} destination={destination} className="h-44 w-full rounded-3xl" />

      {/* Ride Preference Selector */}
      <RidePreferenceSelector
        isSharing={isSharingPreferred}
        onToggle={toggleSharingPreference}
        privateFare={currentFareData?.privateFare || 280}
        sharedFare={currentFareData?.sharedFarePerPerson || 155}
        potentialSavings={currentFareData?.savingsPerPerson || 125}
      />

      {/* Vehicle Cards List */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-slate-900 text-sm">Available Options ({fareOptions.cab_share?.distanceKm} km)</h3>
        {Object.keys(VEHICLE_TYPES).map((vKey) => (
          <VehicleCard
            key={vKey}
            vehicleId={vKey}
            fareData={fareOptions[vKey]}
            isSelected={selectedVehicleId === vKey}
            onSelect={setSelectedVehicle}
            isSharingActive={isSharingPreferred}
          />
        ))}
      </div>

      {/* Book Action Button */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        icon={Sparkles}
        onClick={handleBookClick}
        className="text-base font-bold shadow-lg shadow-emerald-600/20 py-4"
      >
        {isSharingPreferred ? 'Find Shared Ride (Save ₹' + (currentFareData?.savingsPerPerson || 125) + ')' : 'Confirm Booking (₹' + (currentFareData?.privateFare || 280) + ')'}
      </Button>
    </div>
  );
}
