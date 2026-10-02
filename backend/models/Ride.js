import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    rideId: { type: String, required: true, unique: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    pickup: {
      name: String,
      address: String,
      lat: Number,
      lng: Number
    },
    destination: {
      name: String,
      address: String,
      lat: Number,
      lng: Number
    },
    vehicleType: { type: String, required: true },
    isShared: { type: Boolean, default: true },
    routeOverlapPercent: { type: Number, default: 0 },
    detourKm: { type: Number, default: 0 },
    coPassengersCount: { type: Number, default: 1 },
    sharedPassengersList: [
      {
        passengerName: String,
        pickupAddress: String,
        destinationAddress: String,
        status: String
      }
    ],
    fareDetails: {
      soloFare: Number,
      sharedFare: Number,
      savings: Number,
      platformCommission: Number,
      driverNetEarning: Number
    },
    status: {
      type: String,
      enum: ['SEARCHING_MATCH', 'MATCH_FOUND', 'SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_TRIP', 'COMPLETED', 'CANCELLED'],
      default: 'SEARCHING_MATCH'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Ride', rideSchema);
