import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All driver routes require authentication + driver role
router.use(authenticateToken);
router.use(requireRole('driver', 'admin'));

// Toggle Driver Online Status
router.post('/toggle-status', (req, res) => {
  const { isOnline } = req.body;
  if (typeof isOnline !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isOnline (boolean) is required.' });
  }
  res.status(200).json({
    success: true,
    driverId: req.user.id,
    isOnline,
    message: `Driver status set to ${isOnline ? 'ONLINE' : 'OFFLINE'}`
  });
});

// Update Driver Location
router.post('/location', (req, res) => {
  const { lat, lng, heading } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'lat and lng are required.' });
  }
  res.status(200).json({
    success: true,
    driverId: req.user.id,
    location: { lat, lng, heading: heading || 0 },
    message: 'Location updated successfully'
  });
});

// Accept/Reject Ride Request
router.post('/rides/:rideId/accept', (req, res) => {
  res.status(200).json({
    success: true,
    driverId: req.user.id,
    rideId: req.params.rideId,
    status: 'DRIVER_ASSIGNED',
    message: 'Ride accepted'
  });
});

router.post('/rides/:rideId/reject', (req, res) => {
  res.status(200).json({
    success: true,
    driverId: req.user.id,
    rideId: req.params.rideId,
    status: 'REJECTED',
    message: 'Ride rejected'
  });
});

export default router;
