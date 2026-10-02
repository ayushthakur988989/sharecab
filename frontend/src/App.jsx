import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader, NavigationBar } from './components/common/NavigationBar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage, OTPPage, StaticPublicPages, PassengerOnboardingFlow, DriverOnboardingFlow } from './pages/public/AuthPages';
import { PassengerHome } from './pages/passenger/PassengerHome';
import { RideSelectPage } from './pages/passenger/RideSelectPage';
import { PassengerHistoryPage, PassengerWalletPage, PassengerProfilePage } from './pages/passenger/PassengerSecondaryPages';
import { DriverHome, DriverOnboardingPage } from './pages/driver/DriverComponents';
import { DriverRequestsPage, DriverEarningsPage, DriverTripsPage, DriverProfilePage } from './pages/driver/DriverSecondaryPages';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
        <Routes>
          {/* ── PUBLIC ROUTES ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/about" element={<StaticPublicPages page="About Us" />} />
          <Route path="/help" element={<StaticPublicPages page="Help & Support" />} />
          <Route path="/terms" element={<StaticPublicPages page="Terms of Service" />} />
          <Route path="/privacy" element={<StaticPublicPages page="Privacy Policy" />} />

          {/* ── ONBOARDING (auth required after login step) ── */}
          <Route path="/onboarding/passenger" element={<PassengerOnboardingFlow />} />
          <Route path="/onboarding/driver" element={<DriverOnboardingFlow />} />

          {/* ── PROTECTED APP ROUTES ── */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

function AppLayout() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Routes>
          {/* PASSENGER ROUTES */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <PassengerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/select-ride"
            element={
              <ProtectedRoute>
                <RideSelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/history"
            element={
              <ProtectedRoute>
                <PassengerHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/wallet"
            element={
              <ProtectedRoute>
                <PassengerWalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/profile"
            element={
              <ProtectedRoute>
                <PassengerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* DRIVER ROUTES */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/requests"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/earnings"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverEarningsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/trips"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverTripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/profile"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/onboarding"
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverOnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NavigationBar />
    </>
  );
}
