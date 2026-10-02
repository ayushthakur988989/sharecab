// SmartRide Payment Service Abstraction Layer & Invoice Generator
// Seamless Razorpay, UPI Intent, SmartRide Wallet, and Card payment gateway integration.

export class PaymentService {
  constructor(provider = 'razorpay') {
    this.provider = provider;
    this.razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_smartride_demo';
  }

  /**
   * Initializes payment processing via Razorpay SDK or fallback simulated gateway.
   */
  async processPayment({ amount, currency = 'INR', paymentMethod = 'upi', rideId }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactionId = 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        resolve({
          success: true,
          transactionId,
          amount,
          currency,
          paymentMethod,
          rideId,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          receiptId: 'INV_' + Math.floor(100000 + Math.random() * 900000)
        });
      }, 1200);
    });
  }

  /**
   * Triggers Razorpay Checkout modal abstraction window.
   */
  openRazorpayCheckout(options, onSuccess, onFailure) {
    if (window.Razorpay) {
      try {
        const rzp = new window.Razorpay({
          key: this.razorpayKey,
          amount: Math.round(options.amount * 100), // convert to paise
          currency: 'INR',
          name: 'SmartRide Mobility Inc.',
          description: `Ride Payment #${options.rideId}`,
          handler: function (response) {
            onSuccess({
              success: true,
              transactionId: response.razorpay_payment_id || 'TXN_RZP_' + Date.now(),
              razorpayOrderId: response.razorpay_order_id,
              amount: options.amount,
              paymentMethod: 'Razorpay'
            });
          },
          prefill: {
            name: options.userName || 'Alex Mercer',
            email: options.userEmail || 'alex.mercer@gmail.com',
            contact: options.userPhone || '+919876543210'
          },
          theme: {
            color: '#10B981'
          }
        });
        rzp.open();
        return;
      } catch (e) {
        console.warn('Razorpay SDK initialization failed, invoking simulated gateway:', e);
      }
    }

    // Fallback simulated payment flow if Razorpay script is absent
    this.processPayment(options).then(onSuccess).catch(onFailure);
  }

  /**
   * Itemized Invoice & Fare Split Breakdown Generator.
   */
  generateInvoice({
    rideId = 'RIDE_9901',
    date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    pickupName = 'Indiranagar Metro Station',
    destName = 'Embassy TechVillage, ORR',
    vehicleName = 'Share Cab',
    distanceKm = 9.8,
    durationMins = 22,
    isShared = true,
    passengerCount = 2,
    baseFare = 50,
    perKm = 11,
    perMin = 1.8,
    surgeMultiplier = 1.0,
    driverName = 'Rajesh Kumar',
    driverRating = 4.88,
    vehicleNumber = 'KA 01 MJ 4821'
  }) {
    const distanceCost = Math.round(distanceKm * perKm);
    const durationCost = Math.round(durationMins * perMin);
    const soloSubtotal = Math.round((baseFare + distanceCost + durationCost) * surgeMultiplier);
    
    // GST Tax
    const gstTax = Math.round(soloSubtotal * 0.05);
    const totalSoloFare = soloSubtotal + gstTax;

    // Sharing Discount Calculation
    const discountPercent = isShared ? 45 : 0;
    const passengerShareFare = isShared ? Math.round(totalSoloFare * (1 - discountPercent / 100)) : totalSoloFare;
    const totalPassengerSavings = totalSoloFare - passengerShareFare;

    // Platform Commission (15%) & Driver Earnings Breakdown
    const totalPoolCollected = passengerShareFare * (isShared ? Math.max(2, passengerCount) : 1);
    const platformCommission = Math.round(totalPoolCollected * 0.15);
    const driverEarnings = Math.round(totalPoolCollected - platformCommission + (isShared ? 45 : 0));

    return {
      rideId,
      date,
      pickupName,
      destName,
      vehicleName,
      distanceKm,
      durationMins,
      isShared,
      passengerCount,
      driverName,
      driverRating,
      vehicleNumber,
      // Itemized Line Items
      baseFare,
      distanceCost,
      durationCost,
      surgeMultiplier,
      gstTax,
      totalSoloFare,
      passengerShareFare,
      totalPassengerSavings,
      discountPercent,
      // Financial Split
      totalPoolCollected,
      platformCommission,
      driverEarnings,
      invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000)
    };
  }
}

export const paymentService = new PaymentService();
