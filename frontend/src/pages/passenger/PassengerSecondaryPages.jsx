import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Wallet, User, ShieldCheck, Sparkles, Plus, CreditCard, ArrowUpRight, CheckCircle2, ChevronRight, MapPin, FileText, Download } from 'lucide-react';
import { useRideStore } from '../../store/useRideStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Badge, Modal } from '../../components/common/UIComponents';
import { ItemizedInvoiceModal, RatingReviewModal } from '../../components/ride/PaymentRatingComponents';
import { paymentService } from '../../services/paymentService';

export function PassengerHistoryPage() {
  const { rideHistory } = useRideStore();
  const { user } = useAuthStore();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleOpenInvoice = (ride) => {
    const inv = paymentService.generateInvoice({
      rideId: ride.id,
      date: ride.date,
      pickupName: ride.pickupName,
      destName: ride.destName,
      vehicleName: ride.vehicleName,
      distanceKm: 9.8,
      durationMins: 22,
      isShared: ride.wasShared,
      passengerCount: ride.coPassengersCount || 2,
      driverName: ride.driverName,
      driverRating: 4.88,
      vehicleNumber: 'KA 01 MJ 4821'
    });
    setSelectedInvoice(inv);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Your Ride History</h1>
          <p className="text-xs text-slate-500">Track past trips, invoices & total money saved</p>
        </div>
        <Badge variant="emerald" icon={Sparkles}>
          ₹{user?.moneySavedTotal} Saved Total
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rideHistory.map((ride) => (
          <div
            key={ride.id}
            onClick={() => handleOpenInvoice(ride)}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">{ride.date}</span>
                <span className={`font-bold px-2 py-0.5 rounded-md ${ride.wasShared ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {ride.vehicleName}
                </span>
              </div>

              <div className="space-y-1 py-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-medium text-slate-900 truncate">{ride.pickupName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-900 flex-shrink-0" />
                  <span className="font-medium text-slate-900 truncate">{ride.destName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> View Invoice
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 text-sm">₹{ride.fare}</span>
                {ride.saved > 0 && (
                  <span className="block text-2xs text-emerald-600 font-semibold">Saved ₹{ride.saved}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ItemizedInvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}

export function PassengerWalletPage() {
  const { user, updateWalletBalance } = useAuthStore();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('500');

  const handleTopUp = () => {
    paymentService.openRazorpayCheckout(
      { amount: Number(amount), rideId: 'TOPUP_' + Date.now() },
      (res) => {
        updateWalletBalance(Number(amount));
        setShowAddMoney(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-4 text-left">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Wallet & Razorpay Payments</h1>

      {/* Wallet Balance Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <span className="text-xs text-slate-400 font-medium block">SmartRide Money Balance</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-emerald-400">₹{user?.walletBalance}</span>
          <span className="text-xs text-slate-400">Available</span>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowAddMoney(true)} className="sm:w-auto">
          Top Up via Razorpay / UPI
        </Button>
      </div>

      {/* Payment Options */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Saved Payment Gateways</h3>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-900">Razorpay / Google Pay / Cards</p>
              <p className="text-2xs text-slate-500">alex@okaxis • Primary Gateway</p>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      </div>

      <Modal isOpen={showAddMoney} onClose={() => setShowAddMoney(false)} title="Top Up Wallet via Razorpay">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {['200', '500', '1000'].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-2 rounded-xl border text-xs font-bold ${
                  amount === amt ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                + ₹{amt}
              </button>
            ))}
          </div>
          <Button variant="primary" fullWidth onClick={handleTopUp}>
            Pay & Add ₹{amount} via Razorpay
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function PassengerProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-4 text-left">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Account & Settings</h1>

      {/* Profile Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
        <img src={user?.avatar} alt={user?.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500" />
        <div>
          <h2 className="font-bold text-slate-900 text-base">{user?.name}</h2>
          <p className="text-xs text-slate-500">{user?.phone}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-amber-600">★ {user?.rating}</span>
            <span className="text-2xs text-slate-400">• {user?.totalRidesTaken} Rides</span>
          </div>
        </div>
      </div>

      {/* Saved Places Manager */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
        <h3 className="font-bold text-slate-900 text-sm">Saved Places</h3>
        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="font-semibold text-slate-900 block">Home</span>
              <span className="text-2xs text-slate-500">HSR Layout Sector 6, Bengaluru</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
