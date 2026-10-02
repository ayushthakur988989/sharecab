import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All ride routes require authentication
router.use(authenticateToken);

// Estimate Fares Endpoint
router.post('/estimate-fare', (req, res) => {
  const { distanceKm, durationMins } = req.body;
  if (!distanceKm || !durationMins) {
    return res.status(400).json({ success: false, message: 'distanceKm and durationMins are required.' });
  }
  const privateCabFare = Math.round(80 + distanceKm * 18 + durationMins * 2.5);
  const shareCabFare = Math.round(privateCabFare * 0.55);

  res.status(200).json({
    success: true,
    privateCabFare,
    shareCabFare,
    savings: privateCabFare - shareCabFare,
    distanceKm,
    durationMins
  });
});

// Initiate Ride Booking Endpoint
router.post('/book', (req, res) => {
  const { pickup, destination, vehicleType, isShared } = req.body;
  if (!pickup || !destination || !vehicleType) {
    return res.status(400).json({ success: false, message: 'pickup, destination, and vehicleType are required.' });
  }

  const rideId = 'SR_' + Math.floor(100000 + Math.random() * 900000);
  res.status(200).json({
    success: true,
    rideId,
    passengerId: req.user.id,
    status: 'SEARCHING_MATCH',
    message: 'Ride initiated, searching for optimal route matches'
  });
});

// Get Ride Status
router.get('/:rideId/status', (req, res) => {
  res.status(200).json({
    success: true,
    rideId: req.params.rideId,
    status: 'SEARCHING_DRIVER',
    message: 'Searching for available drivers'
  });
});

// Cancel Ride
router.post('/:rideId/cancel', (req, res) => {
  res.status(200).json({
    success: true,
    rideId: req.params.rideId,
    status: 'CANCELLED',
    message: 'Ride cancelled successfully'
  });
});

export default router;
