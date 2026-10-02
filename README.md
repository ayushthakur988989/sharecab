# ShareCab 🚕

A shared cab booking platform with passenger, driver, and admin portals.

## 📁 Project Structure

```
sharecab/
├── frontend/          ← All React frontend code (Vite + TailwindCSS v4)
│   ├── src/
│   │   ├── App.jsx              ← Routes with ProtectedRoute guards
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── NavigationBar.jsx    ← App header + bottom nav
│   │   │   │   ├── ProtectedRoute.jsx   ← Auth guard component
│   │   │   │   └── UIComponents.jsx     ← Buttons, Inputs etc.
│   │   │   ├── map/             ← MapView
│   │   │   ├── ride/            ← Ride tracking & payment components
│   │   │   └── booking/         ← Vehicle selection
│   │   ├── pages/
│   │   │   ├── public/          ← LandingPage, AuthPages (Login/Register)
│   │   │   ├── passenger/       ← Passenger home, history, wallet, profile
│   │   │   ├── driver/          ← Driver dashboard, requests, earnings
│   │   │   └── admin/           ← Admin dashboard
│   │   ├── store/
│   │   │   ├── useAuthStore.js  ← JWT auth + localStorage persistence
│   │   │   ├── useRideStore.js  ← Ride lifecycle state
│   │   │   ├── useDriverStore.js
│   │   │   └── useAdminStore.js
│   │   ├── services/
│   │   │   ├── socketService.js ← Real-time event bus
│   │   │   ├── fareEngine.js    ← Fare calculation
│   │   │   └── matchingEngine.js ← Passenger route matching
│   │   └── config/
│   │       └── constants.js     ← Vehicle types, mock locations
│   └── package.json
│
├── backend/           ← Node.js + Express + MongoDB + Socket.IO
│   ├── config/
│   │   └── db.js               ← MongoDB connection (graceful demo fallback)
│   ├── middleware/
│   │   └── authMiddleware.js   ← JWT verify + role-based guards
│   ├── models/
│   │   ├── User.js             ← User schema (passwordHash, role)
│   │   ├── Driver.js           ← Driver schema
│   │   └── Ride.js             ← Ride schema
│   ├── routes/
│   │   ├── authRoutes.js       ← POST /register, POST /login, GET /me
│   │   ├── rideRoutes.js       ← Protected ride endpoints
│   │   ├── driverRoutes.js     ← Driver-only endpoints
│   │   └── adminRoutes.js      ← Admin-only endpoints
│   ├── sockets/
│   │   └── socketHandler.js    ← Socket.IO real-time events
│   ├── server.js               ← Express app + startup
│   ├── .env                    ← Environment variables
│   └── package.json
│
└── package.json       ← Root scripts for running frontend & backend
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure environment

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/sharecab
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
```

> **Note:** If MongoDB is not installed, the backend runs in **DEMO mode** with mock data automatically.

### 3. Run the servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open: http://localhost:5173

## 🔐 Authentication Flow

| Feature | Details |
|---------|---------|
| Register | POST `/api/v1/auth/register` → bcrypt hash + JWT |
| Login | POST `/api/v1/auth/login` → JWT token |
| Token storage | `localStorage` via Zustand persist |
| Protected routes | `<ProtectedRoute>` component checks `isAuthenticated` |
| Role-based access | `/admin` requires `role: admin`, `/driver` requires `role: driver` |
| Logout | Clears JWT + state, redirects to `/login` |

## 🎭 Demo Mode (No MongoDB)

If MongoDB is not running, all auth endpoints return **demo tokens** with pre-filled user data:

| Role | Demo User |
|------|-----------|
| Passenger | Alex Mercer (passenger) |
| Driver | Rajesh Kumar (driver) |
| Admin | Admin User (admin) |

Just log in with any email/password combination and select the role.

## 🛣️ Key Routes

| Path | Access | Component |
|------|--------|-----------|
| `/` | Public | Landing Page |
| `/login` | Public | Login / Register |
| `/app` | Passenger | Home / Book Ride |
| `/driver` | Driver only | Driver Dashboard |
| `/admin` | Admin only | Admin Dashboard |
