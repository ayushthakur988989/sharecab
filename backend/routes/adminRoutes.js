import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// Get Admin Overview Metrics
router.get('/metrics', (req, res) => {
  res.status(200).json({
    success: true,
    stats: {
      totalActiveRides: 48,
      sharedRidesActive: 31,
      matchSuccessRate: 84.5,
      todayRevenue: 42800,
      platformCommissionTotal: 6420,
      co2SavedKg: 420,
      totalRegisteredUsers: 14200,
      totalDriversOnline: 310,
      averageSharedSavings: 125
    }
  });
});

// Update Platform Pricing Configurations
router.post('/config', (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ success: false, message: 'config object is required.' });
  }
  res.status(200).json({ success: true, message: 'Platform config updated', config });
});

// Get all users (admin only)
router.get('/users', (req, res) => {
  res.status(200).json({
    success: true,
    users: [
      { id: 'USR_101', name: 'Alex Mercer', phone: '+91 98765 43210', ridesCount: 24, wallet: 450, rating: 4.92, status: 'Active' },
      { id: 'USR_102', name: 'Ananya Roy', phone: '+91 98123 45678', ridesCount: 18, wallet: 820, rating: 4.90, status: 'Active' },
    ]
  });
});

// Get all drivers (admin only)
router.get('/drivers', (req, res) => {
  res.status(200).json({
    success: true,
    drivers: [
      { id: 'DRV_101', name: 'Rajesh Kumar', vehicle: 'Swift Dzire (KA 01 MJ 4821)', rating: 4.88, rides: 1420, status: 'Online' },
    ]
  });
});

// Approve driver
router.post('/drivers/:driverId/approve', (req, res) => {
  res.status(200).json({
    success: true,
    driverId: req.params.driverId,
    verificationStatus: 'APPROVED',
    message: 'Driver approved successfully'
  });
});

// Resolve complaint
router.post('/complaints/:complaintId/resolve', (req, res) => {
  res.status(200).json({
    success: true,
    complaintId: req.params.complaintId,
    status: 'RESOLVED',
    message: 'Complaint resolved'
  });
});

export default router;
