import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initializeSocketEvents } from './sockets/socketHandler.js';
import { connectDB, getIsConnected } from './config/db.js';
import { seedDatabase } from './seedData.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS — support Vercel frontend, mobile browsers, and dev tools seamlessly
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.options('*', cors());


// Socket.IO Server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ShareCab Backend Operational',
    timestamp: new Date(),
    env: process.env.NODE_ENV || 'development',
    dbConnected: getIsConnected()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'ShareCab Backend API is running. Base endpoint is /api/v1' });
});

// Manual Seeding Endpoint for Testing / Atlas Population
app.get('/api/v1/admin/seed-now', async (req, res) => {
  try {
    await seedDatabase();
    res.status(200).json({ success: true, message: 'Database seeded with demo Users, Drivers & Rides in Atlas!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── REST API Routes ───────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ── Socket.IO Events ──────────────────────────────────────────────────────────
initializeSocketEvents(io);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  if (getIsConnected()) {
    await seedDatabase();
  }
  httpServer.listen(PORT, () => {
    console.log(`🚀 ShareCab Backend & Socket.IO Server running on http://localhost:${PORT}`);
    console.log(`📡 API base: http://localhost:${PORT}/api/v1`);
  });
}

startServer();
