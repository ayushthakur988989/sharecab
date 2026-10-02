import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Home as HomeIcon, Briefcase, Dumbbell, Sparkles, ArrowRight, Bell, Wallet, ShieldCheck, ChevronRight, Search, X, RefreshCw, KeyRound, Plane } from 'lucide-react';
import { useRideStore, RIDE_STATUS } from '../../store/useRideStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Badge, Modal } from '../../components/common/UIComponents';
import { VehicleCard, RidePreferenceSelector } from '../../components/booking/VehicleComponents';
import { MapView } from '../../components/map/MapView';
import { RouteMatchingCard, SearchingDriverCard, NoDriverAvailableCard, LiveRideBottomSheet } from '../../components/ride/RideTrackingComponents';
import { RatingReviewModal } from '../../components/ride/PaymentRatingComponents';
import { MOCK_LOCATIONS, VEHICLE_TYPES } from '../../config/constants';
import { soundManager } from '../../utils/audioUtils';

export function PassengerHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    pickup,
    destination,
    selectedVehicleId,
    isSharingPreferred,
    fareOptions,
    rideStatus,
    potentialMatch,
    allMatchedCandidates,
    activeDriver,
    sharedPassengers,
    rideOtp,
    searchSecondsRemaining,
    setPickup,
    setDestination,
    setSelectedVehicle,
    toggleSharingPreference,
    startSearchingMatch,
    acceptMatchAndFindDriver,
    directBookRide,
    decrementSearchTimer,
    simulateDriverAccept,
    triggerNoDriverAvailable,
    retryDriverSearch,
    setRideStatus,
    resetRide,
    savedPlaces
  } = useRideStore();

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('destination');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const currentFareData = fareOptions[selectedVehicleId] || fareOptions.cab_share;

  // Play audio cue when match is found or driver arrives
  useEffect(() => {
    if (rideStatus === RIDE_STATUS.MATCH_FOUND || rideStatus === RIDE_STATUS.DRIVER_ASSIGNED) {
      soundManager.playSuccessTone();
    }
  }, [rideStatus]);

  const handleBookClick = () => {
    soundManager.playSuccessTone();
    if (isSharingPreferred) {
      startSearchingMatch();
    } else {
      directBookRide();
    }
  };

  const handleEndRide = () => {
    setShowRatingModal(true);
  };

  const handleFinishRating = () => {
    setShowRatingModal(false);
    resetRide();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-left">
      {/* Top Greeting & Stats */}
      <div className="bg-white border-b border-slate-100 p-4 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
            />
            <div>
              <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Welcome back</span>
              <h2 className="text-sm font-extrabold text-slate-900">{user?.name || 'Alex Mercer'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              onClick={() => navigate('/app/wallet')}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-all"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" /> ₹{user?.walletBalance || 500}
            </div>
            <button
              onClick={() => setShowNotificationModal(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Container: 2-Column Desktop View & 1-Column Mobile View */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (Map View & Live Tracking overlay) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-20">
            <div className="relative">
              <MapView
                pickup={pickup}
                destination={destination}
                driverCoords={activeDriver ? { lat: activeDriver.currentLat, lng: activeDriver.currentLng } : null}
                sharedStops={potentialMatch ? [{ lat: potentialMatch.pickupCoords?.lat || 12.9352, lng: potentialMatch.pickupCoords?.lng || 77.6245, name: potentialMatch.passengerName }] : []}
                onSelectLocation={(loc) => {
                  if (pickerTarget === 'pickup') setPickup(loc);
                  else setDestination(loc);
                }}
                className="h-80 sm:h-96 lg:h-[520px] w-full rounded-3xl"
              />

              {/* Tap to set point hint banner */}
              <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-2xs font-semibold">
                💡 Click map to set {pickerTarget === 'pickup' ? 'Pickup' : 'Destination'}
              </div>
            </div>

            {/* 1. Searching for shared match card */}
            {(rideStatus === RIDE_STATUS.SEARCHING_MATCH || rideStatus === RIDE_STATUS.MATCH_FOUND) && (
              <RouteMatchingCard
                match={potentialMatch}
                allCandidates={allMatchedCandidates}
                onAcceptMatch={acceptMatchAndFindDriver}
                onCancelSearch={resetRide}
              />
            )}

            {/* 2. 5-Minute Searching for Driver Card with Live Radar & Timer */}
            {rideStatus === RIDE_STATUS.SEARCHING_DRIVER && (
              <SearchingDriverCard
                secondsRemaining={searchSecondsRemaining}
                pickup={pickup}
                destination={destination}
                onDecrementTimer={decrementSearchTimer}
                onSimulateAccept={simulateDriverAccept}
                onSimulateTimeout={triggerNoDriverAvailable}
                onCancelSearch={resetRide}
              />
            )}

            {/* 3. No Driver Available Card (Timeout state) */}
            {rideStatus === RIDE_STATUS.NO_DRIVER_AVAILABLE && (
              <NoDriverAvailableCard
                onRetry={retryDriverSearch}
                onCancel={resetRide}
                onChangeVehicle={() => {
                  resetRide();
                  setSelectedVehicle('cab_private');
                }}
              />
            )}

            {/* 4. Active Driver Assigned & Live Tracking with Security OTP */}
            {(rideStatus === RIDE_STATUS.DRIVER_ASSIGNED || rideStatus === RIDE_STATUS.IN_TRIP) && (
              <LiveRideBottomSheet
                driver={activeDriver}
                rideStatus={rideStatus}
                passengers={sharedPassengers}
                fare={currentFareData?.sharedFarePerPerson || 155}
                rideOtp={rideOtp}
                onCompleteRide={handleEndRide}
                onCancelRide={resetRide}
              />
            )}
          </div>

          {/* RIGHT COLUMN (Booking Form, Fleet Selector, and Ride Preference) */}
          <div className="lg:col-span-5 space-y-4">
            {rideStatus === RIDE_STATUS.IDLE ? (
              <>
                {/* Main Booking Card: "Where are you going?" */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">Where are you going?</span>

                  {/* Pickup location field */}
                  <div
                    onClick={() => {
                      setPickerTarget('pickup');
                      setShowLocationPicker(true);
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 cursor-pointer hover:bg-slate-100/80 transition-all"
                  >
                    <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <span className="text-2xs text-slate-400 block font-medium">Pickup Point</span>
                      <p className="text-xs font-semibold text-slate-800 truncate">{pickup?.name || pickup?.address}</p>
                    </div>
                  </div>

                  {/* Destination location field */}
                  <div
                    onClick={() => {
                      setPickerTarget('destination');
                      setShowLocationPicker(true);
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 cursor-pointer hover:bg-slate-100/80 transition-all"
                  >
                    <div className="w-3 h-3 rounded-full bg-slate-900 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <span className="text-2xs text-slate-400 block font-medium">Destination</span>
                      <p className="text-xs font-semibold text-slate-800 truncate">{destination?.name || destination?.address}</p>
                    </div>
                  </div>

                  {/* Saved places quick select chips */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                    {savedPlaces.map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setDestination(sp.loc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-2xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                      >
                        <span>📍</span> {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ride Preference: Private vs Shared */}
                <RidePreferenceSelector
                  isSharingPreferred={isSharingPreferred}
                  onToggleSharing={toggleSharingPreference}
                />

                {/* Vehicle Selection Carousel / List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-900">Available Vehicles</span>
                    <span className="text-2xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Smart Dynamic Pricing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {Object.values(VEHICLE_TYPES).map((vConfig) => {
                      const fareData = fareOptions[vConfig.id] || {
                        privateCabFare: 280,
                        sharedFarePerPerson: 155,
                        savings: 125,
                        estimatedEtaMins: 22
                      };

                      return (
                        <VehicleCard
                          key={vConfig.id}
                          vehicleConfig={vConfig}
                          fareData={fareData}
                          isSelected={selectedVehicleId === vConfig.id}
                          onSelect={setSelectedVehicle}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Booking CTA */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={ArrowRight}
                    onClick={handleBookClick}
                  >
                    {isSharingPreferred ? 'Find Route Matches & Book' : 'Book Private Ride Now'}
                  </Button>
                </div>
              </>
            ) : (
              /* Ongoing Trip Companion Card */
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Ride in progress</span>
                  <Badge variant="emerald">Live Tracking</Badge>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Selected Option:</span>
                    <span className="font-bold text-slate-900 capitalize">{selectedVehicleId.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pickup:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{pickup?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{destination?.name}</span>
                  </div>
                </div>

                {/* Driver & OTP reminder during active ride */}
                {(rideStatus === RIDE_STATUS.DRIVER_ASSIGNED || rideStatus === RIDE_STATUS.IN_TRIP) && (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-2xs text-emerald-800 font-bold block uppercase">Boarding OTP</span>
                      <span className="text-lg font-mono font-black text-emerald-700">{rideOtp}</span>
                    </div>
                    <Badge variant="emerald" icon={ShieldCheck}>Verified Driver</Badge>
                  </div>
                )}

                <Button variant="ghost" fullWidth onClick={resetRide}>
                  Cancel / Return to Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <Modal
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          title={`Select ${pickerTarget === 'pickup' ? 'Pickup Location' : 'Destination'}`}
        >
          <div className="space-y-3">
            <div className="space-y-2">
              {MOCK_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    if (pickerTarget === 'pickup') setPickup(loc);
                    else setDestination(loc);
                    setShowLocationPicker(false);
                  }}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl border border-slate-100 hover:border-emerald-200 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                      📍
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{loc.name}</h4>
                      <p className="text-2xs text-slate-500 truncate max-w-[240px]">{loc.address}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Rating & Review Modal after ride finish */}
      {showRatingModal && (
        <RatingReviewModal
          isOpen={showRatingModal}
          onClose={handleFinishRating}
          fare={currentFareData?.sharedFarePerPerson || 155}
          driver={activeDriver || { name: 'Rajesh Kumar', vehicleNumber: 'KA 01 MJ 4821', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }}
          coPassengers={sharedPassengers}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <Modal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          title="Recent Ride Alerts"
        >
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900">Shared Route Bonus Active</h4>
                <p className="text-2xs text-emerald-700">You saved ₹125 on your last trip by sharing with commuters.</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
