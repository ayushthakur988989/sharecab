import React from 'react';
import { motion } from 'framer-motion';
import { Car, Users, Bike, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { VEHICLE_TYPES } from '../../config/constants';
import { Badge } from '../common/UIComponents';

export function VehicleCard({
  vehicleId,
  vehicleConfig,
  fareData,
  isSelected,
  onSelect,
  isSharingActive
}) {
  const vehicle = vehicleConfig || Object.values(VEHICLE_TYPES).find(v => v.id === vehicleId) || VEHICLE_TYPES.CAB_SHARE;
  const vId = vehicle.id || vehicleId;

  const isSharedOption = vehicle.allowSharing;
  const displayFare = isSharedOption ? fareData?.sharedFarePerPerson : fareData?.privateFare;
  const savingsAmount = fareData?.savingsPerPerson || 0;

  const vehicleIcons = {
    bike: <Bike className="w-6 h-6 text-slate-700" />,
    auto: <Car className="w-6 h-6 text-amber-600" />,
    cab: <Car className="w-6 h-6 text-emerald-600" />
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect && onSelect(vId)}
      className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      {/* Top Tagline / Savings Badge */}
      {isSharedOption && savingsAmount > 0 && (
        <div className="absolute -top-2.5 right-3">
          <Badge variant="emerald" icon={Sparkles}>
            Save up to ₹{savingsAmount}
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isSharedOption ? 'bg-emerald-100/60' : 'bg-slate-100'}`}>
            {isSharedOption ? <Users className="w-6 h-6 text-emerald-700" /> : (vehicleIcons[vehicle.type] || <Car className="w-6 h-6 text-slate-700" />)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-slate-900 text-sm">{vehicle.name}</h4>
              <span className="text-xs text-slate-400 font-normal">({vehicle.capacity} seats)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{vehicle.description}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Clock className="w-3 h-3 text-slate-400" /> 4 min away
              </span>
            </div>
          </div>
        </div>

        {/* Right: Fare */}
        <div className="text-right">
          <div className="text-base font-bold text-slate-900">
            ₹{displayFare}
            {isSharedOption && <span className="text-xs font-normal text-slate-500">/person</span>}
          </div>
          {isSharedOption && (
            <span className="text-2xs font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
              Shared Fare
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Solo vs Share My Ride Preference Card
 */
export function RidePreferenceSelector({
  isSharing,
  onToggle,
  privateFare = 280,
  sharedFare = 155,
  potentialSavings = 125,
  maxDetourMins = 3
}) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-sm flex items-center gap-1.5 text-white">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Ride Preference
          </h4>
          <p className="text-xs text-slate-400">Choose how you want to travel today</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isSharing ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ride Alone
          </button>
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              isSharing ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            Share Ride
          </button>
        </div>
      </div>

      {isSharing ? (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-medium">Shared Cab Fare:</span>
            <span className="text-base font-bold text-emerald-400">₹{sharedFare} / person</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>You Save:</span>
            <span className="font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
              ₹{potentialSavings} ({Math.round((potentialSavings / privateFare) * 100)}% lower)
            </span>
          </div>
          <div className="flex items-center justify-between text-2xs text-slate-400 pt-1 border-t border-emerald-500/20">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              Max Detour: +{maxDetourMins} mins
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Verified Co-passengers
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-slate-300 px-1 pt-1">
          <span>Private Ride Fare:</span>
          <span className="text-sm font-bold text-white">₹{privateFare}</span>
        </div>
      )}
    </div>
  );
}
