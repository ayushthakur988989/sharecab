import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, DollarSign, Sparkles, FileText, Download, ShieldCheck, Heart, ThumbsUp, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button, Badge, Modal } from '../common/UIComponents';
import { paymentService } from '../../services/paymentService';

/**
 * Interactive 5-Star Rating & Driver Feedback Modal
 */
export function RatingReviewModal({
  isOpen,
  onClose,
  driverName = 'Rajesh Kumar',
  driverAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  onSubmitRating
}) {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Clean Vehicle', 'Polite Driver']);
  const [tipAmount, setTipAmount] = useState(30);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const feedbackTags = ['Punctual Pickup', 'Polite Driver', 'Clean Vehicle', 'Safe Driving', 'Smooth Route', 'Great Music'];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    // Trigger celebration confetti animation
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback
    }

    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitRating) onSubmitRating({ rating, selectedTags, tipAmount, comment });
      onClose();
      setSubmitted(false);
    }, 1800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your SmartRide Experience">
      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Thank You for Your Feedback!</h3>
          <p className="text-xs text-slate-500">Your rating helps us maintain top safety & ride quality.</p>
        </motion.div>
      ) : (
        <div className="space-y-4 text-left">
          {/* Driver Avatar & Name */}
          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <img src={driverAvatar} alt={driverName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">How was your trip with {driverName}?</h4>
              <p className="text-2xs text-slate-500">Share Cab • KA 01 MJ 4821</p>
            </div>
          </div>

          {/* Interactive 5 Star Rating */}
          <div className="text-center py-2 space-y-1">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-all cursor-pointer"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600">
              {rating === 5 ? 'Excellent ⭐⭐⭐⭐⭐' : rating === 4 ? 'Very Good ⭐⭐⭐⭐' : 'Good ⭐⭐⭐'}
            </span>
          </div>

          {/* Quick Feedback Tags */}
          <div className="space-y-1.5">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">What made it great?</span>
            <div className="flex flex-wrap gap-1.5">
              {feedbackTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-xl text-2xs font-semibold transition-all border ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Add Driver Tip Options */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">Add a Tip for Driver (Optional)</span>
              <span className="text-2xs font-bold text-emerald-600">100% goes to driver</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 20, 30, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTipAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    tipAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {amt === 0 ? 'No Tip' : `+ ₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" fullWidth size="lg" onClick={handleSubmit}>
            Submit Rating & Tip (₹{tipAmount})
          </Button>
        </div>
      )}
    </Modal>
  );
}

/**
 * Itemized Invoice & Fare Split Modal
 */
export function ItemizedInvoiceModal({ isOpen, onClose, invoice }) {
  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice #${invoice.invoiceNumber}`}>
      <div className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Receipt Top Header */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-2xs text-emerald-400 font-bold uppercase tracking-wider block">SmartRide Invoice</span>
            <h4 className="text-lg font-black text-white">{invoice.vehicleName}</h4>
            <p className="text-2xs text-slate-400">{invoice.date}</p>
          </div>
          <div className="text-right">
            <span className="text-2xs text-slate-400 block">Total Charged</span>
            <span className="text-2xl font-black text-emerald-400">₹{invoice.passengerShareFare}</span>
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-900">{invoice.pickupName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span className="font-semibold text-slate-900">{invoice.destName}</span>
          </div>
          <div className="text-2xs text-slate-500 pt-1 border-t border-slate-200">
            Distance: {invoice.distanceKm} km • Duration: {invoice.durationMins} mins • Driver: {invoice.driverName} ({invoice.vehicleNumber})
          </div>
        </div>

        {/* Itemized Price Breakdown */}
        <div className="space-y-2 text-xs border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 block">Fare Computation</span>
          
          <div className="flex justify-between text-slate-600">
            <span>Base Fare:</span>
            <span>₹{invoice.baseFare}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Distance Charge ({invoice.distanceKm} km x ₹11/km):</span>
            <span>₹{invoice.distanceCost}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Duration Charge ({invoice.durationMins} mins x ₹1.8/min):</span>
            <span>₹{invoice.durationCost}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>GST Tax (5%):</span>
            <span>₹{invoice.gstTax}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-100 pt-1">
            <span>Solo Private Cab Equivalent:</span>
            <span>₹{invoice.totalSoloFare}</span>
          </div>
          {invoice.isShared && (
            <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg">
              <span>SmartRide Pooling Discount (-{invoice.discountPercent}%):</span>
              <span>- ₹{invoice.totalPassengerSavings}</span>
            </div>
          )}
        </div>

        {/* Split & Driver Earnings Transparency */}
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl space-y-2 text-xs">
          <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider block">Financial Transparency</span>
          <div className="flex justify-between text-slate-300">
            <span>Your Passenger Share Paid:</span>
            <span className="font-bold text-white">₹{invoice.passengerShareFare}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-2xs">
            <span>Platform Commission Fee (15%):</span>
            <span>₹{invoice.platformCommission}</span>
          </div>
          <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
            <span>Net Driver Payout (inc. Shared Bonus):</span>
            <span>₹{invoice.driverEarnings}</span>
          </div>
        </div>

        <Button
          variant="outline"
          fullWidth
          icon={Download}
          onClick={() => alert(`Invoice #${invoice.invoiceNumber} downloaded to device!`)}
        >
          Download PDF Receipt
        </Button>
      </div>
    </Modal>
  );
}
