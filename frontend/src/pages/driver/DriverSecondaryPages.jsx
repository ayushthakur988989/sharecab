import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Users, ArrowUpRight, CheckCircle2, ShieldCheck, FileText, ChevronRight, Navigation, MapPin, Power, Phone, Star, Wallet, ArrowDownRight, Award, Car, Check, IdCard, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { useDriverStore } from '../../store/useDriverStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Badge, Modal } from '../../components/common/UIComponents';

/**
 * Driver Incoming Requests Queue Page (/driver/requests)
 */
export function DriverRequestsPage() {
  const { isOnline, requestsList, acceptRequestById, rejectRequestById, triggerDemoIncomingRequest } = useDriverStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Incoming Ride Requests</h1>
          <p className="text-xs text-slate-500">Live requests matching your current vehicle route</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerDemoIncomingRequest}
            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            + Test Ride
          </button>
          <Badge variant={isOnline ? 'emerald' : 'neutral'}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>
        </div>
      </div>

      {requestsList.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Pending Ride Requests</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            When a passenger books a ride nearby, their request will appear here in real-time.
          </p>
          <Button variant="outline" size="sm" onClick={triggerDemoIncomingRequest}>
            Generate Demo Request
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requestsList.map((req) => (
            <div
              key={req.id}
              className={`bg-white p-4 sm:p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between ${
                req.status === 'ACCEPTED' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={req.isShared ? 'emerald' : 'neutral'} icon={Users}>
                      {req.isShared ? `Shared (${req.coPassengers || 2} Pass)` : 'Private Ride'}
                    </Badge>
                    <span className="text-2xs text-slate-400 font-medium">{req.timeAgo || 'Just now'}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">₹{req.estimatedPayout}</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <img
                    src={req.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={req.passengerName}
                    className="w-10 h-10 rounded-full object-cover border border-white"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-slate-900 text-xs">{req.passengerName}</h4>
                    <span className="text-2xs text-amber-600 font-bold">★ {req.rating || '4.9'}</span>
                  </div>
                  {req.rideOtp && (
                    <div className="bg-slate-900 text-white px-2 py-1 rounded-lg text-2xs font-mono font-bold">
                      OTP: {req.rideOtp}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="font-medium text-slate-900 truncate">{req.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900 flex-shrink-0" />
                    <span className="font-medium text-slate-900 truncate">{req.destinationAddress}</span>
                  </div>
                  {req.isShared && (
                    <div className="text-2xs text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                      +₹{req.sharedBonus || 45} Shared Route Incentive • +{req.detourKm || 0.8} km detour
                    </div>
                  )}
                </div>
              </div>

              {req.status === 'ACCEPTED' ? (
                <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Accepted • En Route to Pickup
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => rejectRequestById(req.id)}>
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => {
                      acceptRequestById(req.id);
                      navigate('/driver');
                    }}
                  >
                    Accept Ride
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Driver Earnings Analytics Page (/driver/earnings)
 */
export function DriverEarningsPage() {
  const { todayEarnings, todayTrips, todayOnlineHours } = useDriverStore();

  const payoutHistory = [
    { id: 'PAY_101', date: 'Yesterday, 28 Sep', trips: 11, amount: 2450, status: 'Credited to Bank' },
    { id: 'PAY_102', date: '27 Sep 2026', trips: 14, amount: 3120, status: 'Credited to Bank' },
    { id: 'PAY_103', date: '26 Sep 2026', trips: 9, amount: 1980, status: 'Credited to Bank' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-4 text-left">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Earnings & Payouts</h1>

      {/* Today summary card */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
        <span className="text-2xs text-emerald-400 font-bold uppercase tracking-wider block">Today's Earnings</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-emerald-400">₹{todayEarnings}</span>
          <span className="text-xs text-slate-400">({todayTrips} trips completed)</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-2xs block">Online Hours</span>
            <span className="font-bold text-white text-sm">{todayOnlineHours} hrs</span>
          </div>
          <div>
            <span className="text-slate-400 text-2xs block">Shared Bonus</span>
            <span className="font-bold text-emerald-400 text-sm">₹450</span>
          </div>
          <div>
            <span className="text-slate-400 text-2xs block">Avg / Hour</span>
            <span className="font-bold text-white text-sm">₹{Math.round(todayEarnings / todayOnlineHours)}</span>
          </div>
        </div>
      </div>

      {/* Payout history */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Recent Daily Settlements</h3>
        <div className="space-y-2">
          {payoutHistory.map((pay) => (
            <div key={pay.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{pay.date}</span>
                <span className="text-2xs text-slate-500">{pay.trips} Trips • {pay.status}</span>
              </div>
              <span className="font-black text-slate-900 text-sm">₹{pay.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Driver Trip History Page (/driver/trips)
 */
export function DriverTripsPage() {
  const tripLogs = [
    {
      id: 'TRIP_481',
      date: 'Today, 4:15 PM',
      pickup: 'Indiranagar 100ft Rd',
      destination: 'Embassy TechVillage',
      isShared: true,
      passengers: 'Ananya Roy, Rohan Verma',
      payout: 245,
      rating: 5.0
    },
    {
      id: 'TRIP_480',
      date: 'Today, 2:30 PM',
      pickup: 'Koramangala 5th Block',
      destination: 'MG Road Metro Gate 1',
      isShared: false,
      passengers: 'Kavya Sharma',
      payout: 135,
      rating: 4.9
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-4 text-left">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Completed Trip Logs</h1>

      <div className="space-y-3">
        {tripLogs.map((trip) => (
          <div key={trip.id} className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={trip.isShared ? 'emerald' : 'neutral'}>
                  {trip.isShared ? 'Shared Ride' : 'Private Ride'}
                </Badge>
                <span className="text-xs font-semibold text-slate-500">{trip.date}</span>
              </div>
              <span className="font-black text-slate-900 text-base">₹{trip.payout}</span>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-900 font-medium truncate">{trip.pickup}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                <span className="text-slate-900 font-medium truncate">{trip.destination}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
              <span>Passenger(s): {trip.passengers}</span>
              <span className="font-bold text-amber-600">★ {trip.rating} Rated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Driver Profile Page (/driver/profile) — 100% VISIBLE & ROBUST
 */
export function DriverProfilePage() {
  const { driverProfile, isOnline, toggleOnline, todayTrips, todayEarnings } = useDriverStore();
  const { user } = useAuthStore();

  const profile = {
    name: user?.name || driverProfile?.name || 'Rajesh Kumar',
    phone: user?.phone || driverProfile?.phone || '+91 98765 43210',
    avatar: user?.avatar || driverProfile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: driverProfile?.rating || 4.88,
    totalTrips: driverProfile?.totalTrips || 1420,
    vehicleName: driverProfile?.vehicleName || 'White Maruti Swift Dzire',
    vehicleNumber: driverProfile?.vehicleNumber || 'KA 01 MJ 4821',
    vehicleType: driverProfile?.vehicleType || 'cab_share',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-5 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Driver Partner Profile</h1>
          <p className="text-xs text-slate-500">Manage your driver profile, vehicle specs, and verification status</p>
        </div>
        <Badge variant={isOnline ? 'emerald' : 'neutral'}>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </Badge>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-lg">{profile.name}</h2>
              <span className="bg-emerald-100 text-emerald-800 text-2xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{profile.phone}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                ★ {profile.rating} Rating
              </span>
              <span className="text-xs font-semibold text-slate-600">
                • {profile.totalTrips} Lifetime Trips
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleOnline}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Power className="w-4 h-4" />
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Performance & Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-2xs text-slate-400 font-bold uppercase block">Today Trips</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{todayTrips}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-2xs text-slate-400 font-bold uppercase block">Today Earnings</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">₹{todayEarnings}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-2xs text-slate-400 font-bold uppercase block">Acceptance Rate</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">96%</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-2xs text-slate-400 font-bold uppercase block">Customer Rating</span>
          <span className="text-xl font-black text-amber-500 mt-1 block">4.88 ★</span>
        </div>
      </div>

      {/* Vehicle Specifications & Document Verifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600" /> Vehicle Specifications
            </h3>
            <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Commercial Authorized
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900 text-sm block">{profile.vehicleName}</span>
              <span className="text-xs font-mono font-bold text-slate-600 tracking-wider mt-0.5 block">
                {profile.vehicleNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xs text-slate-400 block">Class</span>
              <span className="font-bold text-slate-800">Sedan / 4-Seater</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Fuel Type:</span>
              <span className="font-semibold text-slate-900">CNG + Petrol (Low Emission)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>AC Available:</span>
              <span className="font-semibold text-emerald-600">Yes (All Seasons)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Ride Sharing Mode:</span>
              <span className="font-semibold text-emerald-600">Enabled (Earn +20% extra)</span>
            </div>
          </div>
        </div>

        {/* Verification Credentials */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verification Credentials
            </h3>
            <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              All Verified
            </span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Commercial Driving License (DL)', id: 'DL-KA01-202100482', status: 'VERIFIED' },
              { name: 'Vehicle Registration Certificate (RC)', id: 'KA 01 MJ 4821', status: 'VERIFIED' },
              { name: 'Commercial Vehicle Insurance', id: 'Active till Dec 2026', status: 'VERIFIED' },
              { name: 'Police Verification Background Check', id: 'Cleared & Approved', status: 'VERIFIED' }
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 block">{doc.name}</span>
                  <span className="text-2xs text-slate-500">{doc.id}</span>
                </div>
                <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl text-2xs">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
