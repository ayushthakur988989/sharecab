import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: {
      type: String,
      default: function () {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || 'User')}&background=10b981&color=fff`;
      }
    },
    role: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    walletBalance: { type: Number, default: 0 },
    savedPlaces: [
      {
        label: { type: String },
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number }
      }
    ],
    emergencyContacts: [{ name: String, phone: String }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
