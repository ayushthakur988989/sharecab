import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Power, DollarSign, Navigation, Clock, CheckCircle2, XCircle,
  AlertCircle, FileText, ShieldCheck, ChevronRight, Phone, Users,
  MapPin, Sparkles, ArrowRight, Moon, Sun, KeyRound, Compass,
  Volume2, VolumeX, Flame, Zap
} from 'lucide-react';
import { useDriverStore } from '../../store/useDriverStore';
import { Button, Badge, Modal } from '../../components/common/UIComponents';
import { MapView } from '../../components/map/MapView';
import { MOCK_LOCATIONS } from '../../config/constants';
import { soundManager } from '../../utils/audioUtils';

export function DriverHome() {
  const {
    isOnline,
    toggleOnline,
    todayEarnings,
    todayTrips,
    todayOnlineHours,
    incomingRequest,
    activeTrip,
    triggerDemoIncomingRequest,
    acceptIncomingRequest,
    rejectIncomingRequest,
    progressTripStep
  } = useDriverStore();

  const [countdown, setCountdown] = useState(15);
  const [completedModalTrip, setCompletedModalTrip] = useState(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // OTP entry state when verifying passenger
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Play incoming request chime and reset countdown
  useEffect(() => {
    if (incomingRequest) {
      setCountdown(15);
      if (soundEnabled) {
        soundManager.playRequestChime();
      }
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            rejectIncomingRequest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [incomingRequest, soundEnabled]);

  const handleAccept = () => {
    if (soundEnabled) soundManager.playSuccessTone();
    acceptIncomingRequest();
  };

  const handleVerifyOtpAndProceed = () => {
    // In demo, passenger OTP is 4829 or 4821 or matches activeTrip OTP
    const expectedOtp = activeTrip?.rideOtp || '4829';
    if (otpInput === expectedOtp || otpInput === '4829' || otpInput === '4821' || otpInput.length === 4) {
      setOtpError('');
      setOtpSuccess(true);
      if (soundEnabled) soundManager.playSuccessTone();
      setTimeout(() => {
        setOtpSuccess(false);
        setOtpInput('');
        progressTripStep();
      }, 600);
    } else {
      setOtpError('Invalid OTP. Please check with passenger.');
      if (soundEnabled) soundManager.playErrorTone();
    }
  };

  const handleStepProgress = () => {
    if (activeTrip && activeTrip.status === 'CO_PASSENGER_PICKED') {
      setCompletedModalTrip({ ...activeTrip, totalFare: activeTrip.fare + 45 });
      if (soundEnabled) soundManager.playSuccessTone();
    }
    progressTripStep();
  };

  const isOtpStep = activeTrip && (activeTrip.status === 'ARRIVING_PICKUP' || activeTrip.status === 'PICKUP_ARRIVED');

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-24 text-left ${isNightMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* 1. Driver Profile & Login Console Header */}
      <div className={`border-b p-4 shadow-2xs transition-colors ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Logged In Driver Partner</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="font-extrabold text-base sm:text-lg">Rajesh Kumar</h2>
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">★ 4.88</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-2xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> Top Rated Driver
              </span>
            </div>
            <p className="text-2xs text-slate-400 font-medium">Maruti Swift Dzire • KA 01 MJ 4821</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark / Light Night Mode Toggle */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              title={isNightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isNightMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {isNightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                soundEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Online / Offline Toggle */}
            <button
              onClick={toggleOnline}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isOnline ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Power className="w-4 h-4" />
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Layout: 2-Column Desktop View & 1-Column Mobile View */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Map Navigation View with Turn-by-Turn HUD */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-20">
            {/* Driver Flow Timeline Stepper */}
            <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between text-2xs font-semibold overflow-x-auto shadow-md">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1. Online
              </span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span className={incomingRequest ? 'text-emerald-400 font-bold' : 'text-slate-400'}>2. Request</span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span className={activeTrip ? 'text-emerald-400 font-bold' : 'text-slate-400'}>3. Accept</span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span className={activeTrip?.status === 'TRIP_IN_PROGRESS' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>4. Pickup & OTP</span>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span className={activeTrip?.status === 'CO_PASSENGER_PICKED' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>5. Shared Complete</span>
            </div>

            {/* Turn-by-Turn Navigation HUD Overlay when on Active Trip */}
            {activeTrip && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                    <Navigation className="w-5 h-5 -rotate-45" />
                  </div>
                  <div>
                    <span className="text-2xs text-emerald-400 font-bold uppercase tracking-wider block">Turn-by-Turn GPS Navigation</span>
                    <p className="text-xs font-bold text-white">In 250m, Turn Left onto 100ft Road</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xs text-slate-400">Speed</span>
                  <div className="text-sm font-extrabold text-emerald-400">38 km/h</div>
                </div>
              </div>
            )}

            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800">
              <MapView
                pickup={MOCK_LOCATIONS[0]}
                destination={MOCK_LOCATIONS[2]}
                className="h-72 sm:h-96 lg:h-[480px] w-full"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Controls, Earnings, & Active Waypoints */}
          <div className="lg:col-span-5 space-y-4">
            {/* Today's Earnings Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xl space-y-4 border border-slate-700/60">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-2xs text-slate-400 font-medium block">Today's Net Earnings</span>
                  <span className="text-3xl font-black text-emerald-400">₹{todayEarnings}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={triggerDemoIncomingRequest} className="text-emerald-400 text-xs border border-emerald-500/30 hover:bg-emerald-500/10">
                  + Trigger Demo Request
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block text-2xs">Trips Completed</span>
                  <span className="font-bold text-white text-sm">{todayTrips}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block text-2xs">Online Hours</span>
                  <span className="font-bold text-white text-sm">{todayOnlineHours}h</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block text-2xs">Shared Bonus</span>
                  <span className="font-bold text-emerald-400 text-sm">+25%</span>
                </div>
              </div>

              {/* Driver Milestone target */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-emerald-200 block text-2xs">Daily Milestone</span>
                    <span className="text-slate-300">Complete 3 more rides for ₹150 bonus</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400">9/12</span>
              </div>
            </div>

            {/* Active Navigation Trip Controls */}
            {activeTrip ? (
              <div className={`rounded-3xl p-5 shadow-xl border space-y-4 transition-colors ${
                isNightMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
              }`}>
                <div className="flex items-center justify-between">
                  <Badge variant="emerald" icon={Navigation}>
                    Status: {activeTrip.status}
                  </Badge>
                  <span className="text-base font-bold">Payout: ₹{activeTrip.fare + 45}</span>
                </div>

                {/* Interactive 4-Digit Passenger OTP Entry UI */}
                {isOtpStep && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4" /> Verify Passenger Start OTP
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpInput('4829')}
                        className="text-2xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-200"
                      >
                        Auto-Fill Demo OTP (4829)
                      </button>
                    </div>
                    
                    <p className="text-2xs text-slate-500 dark:text-slate-400">
                      Ask primary passenger Alex for the 4-digit OTP shown on their screen:
                    </p>

                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-digit OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-center text-lg font-bold tracking-widest px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-emerald-500"
                      />
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleVerifyOtpAndProceed}
                        disabled={otpInput.length < 4}
                      >
                        {otpSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : 'Verify & Start'}
                      </Button>
                    </div>

                    {otpError && (
                      <p className="text-2xs font-bold text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {otpError}
                      </p>
                    )}
                  </div>
                )}

                {/* Navigation Waypoints Checklist */}
                <div className={`space-y-2 p-3.5 rounded-2xl border text-xs ${
                  isNightMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="font-bold block">Multi-Stop Trip Sequence</span>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        1. Pick up Alex (Primary Rider)
                      </span>
                      <div className="flex items-center gap-2">
                        <a href="tel:+919876543210" className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" title="Call Passenger">
                          <Phone className="w-3 h-3" />
                        </a>
                        <span className="text-2xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded">
                          {['ARRIVING_PICKUP'].includes(activeTrip.status) ? 'Current Stop' : 'Boarded'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        2. Pick up Rohan Verma (Co-Passenger)
                      </span>
                      <div className="flex items-center gap-2">
                        <a href="tel:+919876543211" className="p-1 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" title="Call Co-Passenger">
                          <Phone className="w-3 h-3" />
                        </a>
                        <span className="text-2xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded">
                          {['ARRIVING_CO_PASSENGER', 'CO_PASSENGER_PICKED'].includes(activeTrip.status) ? 'Current Stop' : 'En Route'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-400" />
                        3. Drop off all Passengers (Embassy TechVillage)
                      </span>
                      <span className="text-2xs text-slate-400 font-semibold">Final Drop</span>
                    </div>
                  </div>
                </div>

                {/* Step Action Button */}
                {!isOtpStep && (
                  <Button variant="primary" fullWidth size="lg" icon={ArrowRight} onClick={handleStepProgress}>
                    {activeTrip.status === 'TRIP_IN_PROGRESS' && 'Arrive at Co-Passenger Stop'}
                    {activeTrip.status === 'ARRIVING_CO_PASSENGER' && 'Confirm Co-Passenger Boarded'}
                    {activeTrip.status === 'CO_PASSENGER_PICKED' && 'Complete Ride & Collect Fare (₹' + (activeTrip.fare + 45) + ')'}
                  </Button>
                )}
              </div>
            ) : (
              <div className={`p-5 rounded-3xl border shadow-xs space-y-2 text-xs ${
                isNightMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200/80 text-slate-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Ready for Smart Pooling Requests</span>
                </div>
                <p>Stay online to automatically receive high-earning ride share requests matching your current corridor.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Incoming Ride Request Overlay Modal */}
      <AnimatePresence>
        {incomingRequest && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 text-left border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <Badge variant="emerald" icon={Users}>
                  Shared Ride • {incomingRequest.coPassengers} Passengers
                </Badge>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg animate-pulse">
                  ⏱ {countdown}s remaining
                </span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block uppercase font-semibold">Estimated Net Driver Payout</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{incomingRequest.estimatedPayout}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    +₹{incomingRequest.sharedBonus} Shared Incentive
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-semibold">{incomingRequest.pickupAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-200 flex-shrink-0" />
                  <span className="font-semibold">{incomingRequest.destinationAddress}</span>
                </div>
                <div className="text-2xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                  <span>Detour: +{incomingRequest.detourKm} km</span>
                  <span>Dist: {incomingRequest.distanceKm} km (~22 min)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" fullWidth onClick={rejectIncomingRequest}>
                  Decline
                </Button>
                <Button variant="primary" fullWidth size="lg" onClick={handleAccept}>
                  Accept Ride (₹{incomingRequest.estimatedPayout})
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completed Trip & Earnings Summary Modal */}
      <Modal isOpen={!!completedModalTrip} onClose={() => setCompletedModalTrip(null)} title="Ride Completed Summary">
        {completedModalTrip && (
          <div className="space-y-4 text-left">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Trip Successfully Completed!</h3>
              <p className="text-xs text-emerald-800">Payment of ₹{completedModalTrip.totalFare} added to wallet</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Ride Fare:</span>
                <span className="font-semibold text-slate-900">₹{completedModalTrip.fare}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Shared Route Incentive Bonus:</span>
                <span>+ ₹45</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                <span>Total Net Payout:</span>
                <span className="text-emerald-600">₹{completedModalTrip.totalFare}</span>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={() => setCompletedModalTrip(null)}>
              Back to Driver Console
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function DriverOnboardingPage() {
  const { driverProfile } = useAuthStore();
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 max-w-2xl mx-auto space-y-4 text-left">
      <h1 className="text-xl font-bold text-slate-900">Driver Document Verification</h1>
      <p className="text-xs text-slate-500">Submit required credentials for partner ride authorization</p>

      <div className="space-y-3">
        {[
          { name: 'Driving License', status: 'VERIFIED' },
          { name: 'Vehicle Registration Certificate (RC)', status: 'VERIFIED' },
          { name: 'Commercial Vehicle Insurance', status: 'VERIFIED' },
          { name: 'Background Verification Report', status: 'APPROVED' }
        ].map((doc, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-slate-900">{doc.name}</span>
            </div>
            <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {doc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
