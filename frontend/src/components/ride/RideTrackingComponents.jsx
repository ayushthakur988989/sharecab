import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, Shield, Share2, AlertTriangle, Users, Navigation, CheckCircle2, ChevronRight, X, Sparkles, MapPin, KeyRound, Lock, Clock, Copy, RefreshCw, AlertCircle, Car, ArrowRight } from 'lucide-react';
import { Button, Badge, Modal } from '../common/UIComponents';

/**
 * Intelligent Route Matching Card ("Looking for people going your way...")
 */
export function RouteMatchingCard({
  match,
  allCandidates = [],
  onAcceptMatch,
  onCancelSearch
}) {
  if (!match) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-center space-y-4">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
            <Users className="w-10 h-10 animate-bounce" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Looking for people going your way...</h3>
          <p className="text-xs text-slate-500 mt-1">Analyzing spatial overlap & pickup proximity in real-time</p>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-2/3 animate-pulse" />
        </div>
        <Button variant="ghost" size="sm" onClick={onCancelSearch}>
          Cancel Search
        </Button>
      </div>
    );
  }

  const additionalCount = allCandidates.length > 1 ? allCandidates.length - 1 : 0;

  const [showSavingsInfo, setShowSavingsInfo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 text-left"
    >
      <div className="flex items-center justify-between">
        <Badge variant="emerald" icon={CheckCircle2}>
          High Alignment Match Found
        </Badge>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
          {match.routeOverlapPercent}% Route Overlap
        </span>
      </div>

      {/* Primary Co-Passenger Match */}
      <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <img
          src={match.avatar}
          alt={match.passengerName}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 text-sm">{match.passengerName}</h4>
            <span className="text-2xs font-bold text-amber-600">★ {match.rating}</span>
          </div>
          <p className="text-xs text-slate-500 truncate">Pickup: {match.pickupAddress}</p>
          <div className="flex items-center gap-3 mt-1 text-2xs font-medium text-slate-600">
            <span>+{match.detourKm} km pickup</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">+{match.etaImpactMins} min detour</span>
          </div>
        </div>
      </div>

      {/* Multi-Passenger Match Indicator */}
      {additionalCount > 0 && (
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>+{additionalCount} more passenger matched along route ({allCandidates[1]?.passengerName})</span>
          </div>
          <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">3/4 Seats</span>
        </div>
      )}

      {/* Recalculated Shared Fare with Clickable breakdown */}
      <div
        onClick={() => setShowSavingsInfo(!showSavingsInfo)}
        className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-all"
        title="Click to view why you save"
      >
        <div>
          <span className="text-2xs text-emerald-400 font-bold block uppercase tracking-wider">Recalculated Fare (Tap for Details)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">₹{match.fare || 155}</span>
            <span className="text-xs text-slate-400 line-through">₹280</span>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg block">
            Save ₹{match.savings || 125}
          </span>
          <span className="text-2xs text-slate-400 mt-1 block">45% Shared Discount ℹ️</span>
        </div>
      </div>

      {/* Savings & Eco Explanation Drawer */}
      {showSavingsInfo && (
        <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl text-xs text-slate-700 space-y-1.5 animate-in fade-in">
          <span className="font-bold text-emerald-900 block">💡 Why You Save ₹{match.savings || 125}:</span>
          <p className="text-2xs text-slate-600">• Common corridor shared with {match.passengerName} allows dynamic 50/50 cost-split.</p>
          <p className="text-2xs text-slate-600">• Pickup detour is only +{match.detourKm} km (~{match.etaImpactMins} mins extra travel time).</p>
          <p className="text-2xs font-semibold text-emerald-800">🌱 Estimated carbon offset: 1.4 kg CO2 saved on this trip.</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" fullWidth onClick={onCancelSearch}>
          Decline
        </Button>
        <Button variant="primary" fullWidth icon={Users} onClick={onAcceptMatch}>
          Confirm Shared Ride (₹{match.fare || 155})
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * 5-Minute Live Driver Search Card with Animated Radar & Timeout handling
 */
export function SearchingDriverCard({
  secondsRemaining = 300,
  pickup,
  destination,
  onDecrementTimer,
  onSimulateAccept,
  onSimulateTimeout,
  onCancelSearch
}) {
  // Live 1-second interval for 5-minute countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (onDecrementTimer) onDecrementTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [onDecrementTimer]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, ((300 - secondsRemaining) / 300) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 text-left space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            Searching for Nearby Driver
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Radar Animation Area */}
      <div className="relative py-6 text-center">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-emerald-400/30 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Car className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        <h3 className="font-extrabold text-slate-900 text-base mt-4">Connecting with Drivers...</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
          Broadcasting your ride request to active drivers within a 5 km corridor.
        </p>
      </div>

      {/* Route Brief */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="font-semibold text-slate-900">From:</span>
          <span className="truncate">{pickup?.name || pickup?.address || 'Pickup Point'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 truncate">
          <span className="w-2 h-2 rounded-full bg-slate-900 flex-shrink-0" />
          <span className="font-semibold text-slate-900">To:</span>
          <span className="truncate">{destination?.name || destination?.address || 'Destination Point'}</span>
        </div>
      </div>

      {/* Progress Bar for 5-minute search window */}
      <div className="space-y-1">
        <div className="flex justify-between text-2xs text-slate-400 font-medium">
          <span>Search Window (5 min max)</span>
          <span>{Math.round(progressPercent)}% elapsed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Demo helper shortcuts */}
      <div className="bg-slate-900/5 p-3 rounded-2xl space-y-2 border border-slate-200/60">
        <div className="text-2xs font-bold text-slate-500 uppercase tracking-wider">Demo / Testing Controls:</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSimulateAccept}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Driver Accepts
          </button>
          <button
            type="button"
            onClick={onSimulateTimeout}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" /> Simulate 5m Timeout
          </button>
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={onCancelSearch}>
        Cancel Ride Request
      </Button>
    </motion.div>
  );
}

/**
 * No Driver Available Card (Shown when 5 minutes search expires)
 */
export function NoDriverAvailableCard({
  onRetry,
  onCancel,
  onChangeVehicle
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-2xl border border-red-100 text-left space-y-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-extrabold text-slate-900">
          There is no driver available in this area
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          We searched for 5 minutes, but all drivers near your pickup location are currently occupied or unavailable.
        </p>
      </div>

      <div className="bg-amber-50/80 border border-amber-200/70 p-3.5 rounded-2xl text-xs text-amber-900 space-y-1">
        <p className="font-semibold">💡 What you can do:</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-2xs">
          <li>Try searching again (drivers may become available shortly).</li>
          <li>Switch between Share Cab, Private Auto, or Bike options.</li>
          <li>Adjust your pickup location closer to a main road or metro stop.</li>
        </ul>
      </div>

      <div className="space-y-2 pt-2">
        <Button variant="primary" fullWidth icon={RefreshCw} onClick={onRetry}>
          Try Again (Restart 5m Search)
        </Button>
        <Button variant="outline" fullWidth onClick={onCancel}>
          Cancel & Return to Home
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * Mobile Live Ride Tracking Bottom Sheet
 */
export function LiveRideBottomSheet({
  driver,
  rideStatus,
  passengers = [],
  fare = 155,
  rideOtp = '4829',
  onCompleteRide,
  onCancelRide
}) {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const passengerCount = Math.max(2, passengers.length);

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(rideOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleShareLiveLocation = () => {
    const shareText = `I am riding with ShareCab (Driver: ${driver?.name || 'Rajesh'}, Car: ${driver?.vehicleNumber || 'KA 01 MJ 4821'}). Track my live trip: https://sharecab.app/track/RIDE_${rideOtp}`;
    if (navigator.share) {
      navigator.share({ title: 'My ShareCab Live Ride', text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4 text-left">
      {/* Ride Status Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {rideStatus === 'DRIVER_ASSIGNED' ? 'Driver Assigned • On the way (ETA 3 min)' : 'Ride Active & In Progress'}
          </span>
          <h3 className="font-bold text-slate-900 text-base mt-1">SmartRide Multi-Passenger Shared Cab</h3>
        </div>
        <div className="text-right cursor-pointer" onClick={() => setShowFareBreakdown(!showFareBreakdown)}>
          <span className="text-2xs text-slate-400 block font-medium">Total Fare ℹ️</span>
          <div className="text-lg font-extrabold text-emerald-600">₹{fare}</div>
        </div>
      </div>

      {/* Fare Breakdown Drawer when tapped */}
      {showFareBreakdown && (
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
          <div className="flex justify-between text-2xs">
            <span>Standard Private Ride:</span>
            <span className="line-through text-slate-400">₹280</span>
          </div>
          <div className="flex justify-between font-semibold text-emerald-700">
            <span>Smart Share Discount (45% OFF):</span>
            <span>- ₹125</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 border-t border-emerald-200/60 pt-1">
            <span>You Pay (Split Fare):</span>
            <span className="text-emerald-700">₹{fare}</span>
          </div>
          <p className="text-2xs text-emerald-800 pt-1">🌱 You also saved ~1.8 kg CO2 emissions by sharing this route!</p>
        </div>
      )}

      {/* Unique Security OTP Verification PIN Badge */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex items-center justify-between border border-slate-700 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs text-emerald-400 font-bold block uppercase tracking-wider">
              Start Trip Security OTP
            </span>
            <p className="text-xs text-slate-300">
              Share with driver <strong className="text-white font-semibold">{driver?.name || 'Rajesh'}</strong> upon boarding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-white font-mono text-2xl font-black px-4 py-1.5 rounded-xl tracking-widest shadow-inner border border-emerald-400/40">
            {rideOtp}
          </div>
          <button
            type="button"
            onClick={handleCopyOtp}
            title="Copy OTP"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            {copiedOtp ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Assigned Driver Card */}
      {driver && (
        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <img
              src={driver.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={driver.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">{driver.name}</h4>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  ★ {driver.rating || '4.88'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{driver.vehicleName || 'White Maruti Swift Dzire'}</p>
              <span className="text-xs font-black text-slate-900 font-mono tracking-wide bg-slate-200/70 px-2 py-0.5 rounded mt-1 inline-block">
                {driver.vehicleNumber || 'KA 01 MJ 4821'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`tel:${driver.phone || '+919876543210'}`}
              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shadow-2xs"
              title="Call Driver"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => setShowChatModal(true)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shadow-2xs"
              title="Chat with Driver"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSafetyModal(true)}
              className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all shadow-2xs"
              title="Safety & Emergency Hub"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Multi-Passenger Stop Sequence */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Co-Passengers Capacity ({passengerCount}/4)</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Pool active
          </span>
        </div>

        <div className="space-y-2 text-xs border-t border-slate-800 pt-2.5">
          <div className="flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Stop 1: Pick up You (Alex)
            </span>
            <span className="text-2xs text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">
              Driver Arriving
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              Stop 2: Pick up Rohan Verma
            </span>
            <span className="text-2xs text-amber-300 font-semibold bg-amber-500/20 px-2 py-0.5 rounded">
              Next Stop (+2 min)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              Final Stop: Drop Off All Passengers
            </span>
            <span className="text-2xs text-slate-400">Destination</span>
          </div>
        </div>
      </div>

      {/* Ride Complete & Safety Actions */}
      <div className="flex gap-2">
        <Button variant="outline" fullWidth onClick={onCancelRide}>
          Cancel Ride
        </Button>
        <Button variant="primary" fullWidth onClick={onCompleteRide}>
          Complete & Pay (₹{fare})
        </Button>
      </div>

      {/* 24x7 Safety & SOS Emergency Hub Modal */}
      {showSafetyModal && (
        <Modal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} title="Safety & Emergency Center">
          <div className="space-y-4 text-left">
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Emergency Assistance (24x7)</h4>
                <p className="text-2xs text-rose-700">Immediate response team and police dispatch</p>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href="tel:112"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-md"
              >
                <Phone className="w-4 h-4" /> Call Police Emergency (112)
              </a>

              <button
                type="button"
                onClick={handleShareLiveLocation}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                {shareSuccess ? 'Live Trip Link Copied!' : 'Share Live Trip with Family (WhatsApp)'}
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-2xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">🔒 Verified Safety Protocols</span>
              <p>• Verified commercial driver background checked</p>
              <p>• Live GPS route deviation monitor active</p>
              <p>• 4-Digit Secure OTP mandatory before starting</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Chat modal */}
      {showChatModal && (
        <Modal isOpen={showChatModal} onClose={() => setShowChatModal(false)} title={`Chat with ${driver?.name || 'Driver'}`}>
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Driver Rajesh:</p>
              <p>I am on 100 Feet Road, arriving at your pickup spot in 3 minutes!</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2"
                defaultValue="I am waiting near the main gate."
              />
              <Button size="sm" variant="primary">Send</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
