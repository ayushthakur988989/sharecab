import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String, enum: ['bike', 'auto_private', 'auto_share', 'cab_private', 'cab_share'], default: 'cab_share' },
    vehicleName: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    rating: { type: Number, default: 4.88 },
    totalTrips: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    currentLocation: {
      lat: { type: Number, default: 12.9720 },
      lng: { type: Number, default: 77.6350 },
      heading: { type: Number, default: 0 }
    },
    isOnline: { type: Boolean, default: true },
    isAcceptingShared: { type: Boolean, default: true },
    verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' },
    documents: {
      licenseUrl: String,
      rcUrl: String,
      insuranceUrl: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Driver', driverSchema);
