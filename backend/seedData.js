import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Driver from './models/Driver.js';
import Ride from './models/Ride.js';

dotenv.config();

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI found. Cannot seed database.');
    return;
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    }

    console.log('🌱 Checking MongoDB Atlas database data...');

    // 1. Check & Seed Users
    const userCount = await User.countDocuments();
    let seededUsers = [];
    if (userCount === 0) {
      console.log('📦 Seeding initial Users collection into Atlas...');
      const defaultPasswordHash = await bcrypt.hash('password123', 10);
      
      seededUsers = await User.insertMany([
        {
          name: 'Alex Mercer',
          email: 'alex@sharecab.app',
          phone: '+91 98765 43210',
          passwordHash: defaultPasswordHash,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'passenger',
          rating: 4.95,
          walletBalance: 1250,
          savedPlaces: [
            { label: 'Home', address: 'HSR Layout Sector 6, Bengaluru', lat: 12.9121, lng: 77.6446 },
            { label: 'Work', address: 'Embassy TechVillage, Bellandur', lat: 12.9279, lng: 77.6830 },
            { label: 'Gym', address: '100ft Rd, Indiranagar', lat: 12.9716, lng: 77.6412 }
          ],
          emergencyContacts: [{ name: 'Dad', phone: '+91 98111 22334' }],
          isVerified: true
        },
        {
          name: 'Ananya Roy',
          email: 'ananya@sharecab.app',
          phone: '+91 98123 45678',
          passwordHash: defaultPasswordHash,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          role: 'passenger',
          rating: 4.90,
          walletBalance: 820,
          isVerified: true
        },
        {
          name: 'Rohan Verma',
          email: 'rohan@sharecab.app',
          phone: '+91 98765 11223',
          passwordHash: defaultPasswordHash,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          role: 'passenger',
          rating: 4.85,
          walletBalance: 640,
          isVerified: true
        },
        {
          name: 'Rajesh Kumar',
          email: 'driver.rajesh@sharecab.app',
          phone: '+91 98888 77777',
          passwordHash: defaultPasswordHash,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          role: 'driver',
          rating: 4.88,
          walletBalance: 2450,
          isVerified: true
        },
        {
          name: 'Platform Administrator',
          email: 'admin@sharecab.app',
          phone: '+91 99999 00000',
          passwordHash: defaultPasswordHash,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          role: 'admin',
          rating: 5.0,
          walletBalance: 50000,
          isVerified: true
        }
      ]);
      console.log(`✅ Seeded ${seededUsers.length} Users into Atlas!`);
    } else {
      seededUsers = await User.find();
      console.log(`ℹ️ Atlas already has ${userCount} Users.`);
    }

    // 2. Check & Seed Drivers
    const driverCount = await Driver.countDocuments();
    let seededDrivers = [];
    if (driverCount === 0) {
      console.log('📦 Seeding initial Drivers collection into Atlas...');
      const driverUser = seededUsers.find((u) => u.role === 'driver') || seededUsers[0];

      seededDrivers = await Driver.insertMany([
        {
          userId: driverUser._id,
          name: 'Rajesh Kumar',
          phone: '+91 98888 77777',
          vehicleType: 'cab_share',
          vehicleName: 'White Maruti Swift Dzire',
          vehicleNumber: 'KA 01 MJ 4821',
          rating: 4.88,
          totalTrips: 1420,
          walletBalance: 2450,
          currentLocation: { lat: 12.9720, lng: 77.6350, heading: 45 },
          isOnline: true,
          isAcceptingShared: true,
          verificationStatus: 'APPROVED'
        },
        {
          name: 'Suresh Reddy',
          phone: '+91 98777 66554',
          vehicleType: 'cab_share',
          vehicleName: 'Silver Honda Amaze',
          vehicleNumber: 'KA 05 AA 9912',
          rating: 4.91,
          totalTrips: 2150,
          walletBalance: 4120,
          currentLocation: { lat: 12.9352, lng: 77.6245, heading: 90 },
          isOnline: true,
          isAcceptingShared: true,
          verificationStatus: 'APPROVED'
        },
        {
          name: 'Vikram Singh',
          phone: '+91 97665 44332',
          vehicleType: 'auto_share',
          vehicleName: 'Bajaj RE Auto Green',
          vehicleNumber: 'KA 51 MB 3321',
          rating: 4.82,
          totalTrips: 980,
          walletBalance: 1280,
          currentLocation: { lat: 12.9279, lng: 77.6830, heading: 180 },
          isOnline: true,
          isAcceptingShared: true,
          verificationStatus: 'APPROVED'
        }
      ]);
      console.log(`✅ Seeded ${seededDrivers.length} Drivers into Atlas!`);
    } else {
      seededDrivers = await Driver.find();
      console.log(`ℹ️ Atlas already has ${driverCount} Drivers.`);
    }

    // 3. Check & Seed Rides
    const rideCount = await Ride.countDocuments();
    if (rideCount === 0) {
      console.log('📦 Seeding initial Rides collection into Atlas...');
      const passenger = seededUsers.find((u) => u.role === 'passenger') || seededUsers[0];
      const driver = seededDrivers[0];

      await Ride.insertMany([
        {
          rideId: 'RIDE_8812',
          passengerId: passenger._id,
          driverId: driver?._id,
          pickup: {
            name: 'Indiranagar Metro Station',
            address: 'CMH Rd, Indiranagar, Bengaluru',
            lat: 12.9784,
            lng: 77.6408
          },
          destination: {
            name: 'Embassy TechVillage',
            address: 'Outer Ring Rd, Bellandur, Bengaluru',
            lat: 12.9279,
            lng: 77.6830
          },
          vehicleType: 'cab_share',
          isShared: true,
          routeOverlapPercent: 78,
          detourKm: 0.8,
          coPassengersCount: 2,
          sharedPassengersList: [
            {
              passengerName: 'Alex Mercer',
              pickupAddress: 'Indiranagar Metro Station',
              destinationAddress: 'Embassy TechVillage',
              status: 'Completed'
            },
            {
              passengerName: 'Ananya Roy',
              pickupAddress: 'Koramangala 80ft Rd',
              destinationAddress: 'Embassy TechVillage',
              status: 'Completed'
            }
          ],
          fareDetails: {
            soloFare: 280,
            sharedFare: 155,
            savings: 125,
            platformCommission: 30,
            driverNetEarning: 280
          },
          status: 'COMPLETED'
        },
        {
          rideId: 'RIDE_8813',
          passengerId: passenger._id,
          driverId: driver?._id,
          pickup: {
            name: 'HSR Layout Sector 6',
            address: '14th Main, HSR Layout, Bengaluru',
            lat: 12.9121,
            lng: 77.6446
          },
          destination: {
            name: 'Indiranagar 100ft Rd',
            address: '100 Feet Rd, Indiranagar, Bengaluru',
            lat: 12.9716,
            lng: 77.6412
          },
          vehicleType: 'cab_share',
          isShared: true,
          routeOverlapPercent: 85,
          detourKm: 0.5,
          coPassengersCount: 2,
          sharedPassengersList: [
            {
              passengerName: 'Alex Mercer',
              pickupAddress: 'HSR Layout Sector 6',
              destinationAddress: 'Indiranagar 100ft Rd',
              status: 'Completed'
            },
            {
              passengerName: 'Rohan Verma',
              pickupAddress: 'Sony World Junction',
              destinationAddress: 'Indiranagar 100ft Rd',
              status: 'Completed'
            }
          ],
          fareDetails: {
            soloFare: 240,
            sharedFare: 135,
            savings: 105,
            platformCommission: 25,
            driverNetEarning: 245
          },
          status: 'COMPLETED'
        }
      ]);
      console.log('✅ Seeded initial Rides into Atlas!');
    } else {
      console.log(`ℹ️ Atlas already has ${rideCount} Rides.`);
    }

    console.log('🎉 MongoDB Atlas Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Database seed error:', error);
  }
}

// Auto-run if executed directly via node backend/seedData.js
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase().then(() => {
    console.log('Done.');
    process.exit(0);
  });
}
