import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bike,
  Car,
  ShieldCheck,
  Sparkles,
  MapPinned,
  Users,
  DollarSign,
  BriefcaseBusiness,
  CheckCircle,
  Star,
  Menu,
  ChevronRight,
  Route,
  LocateFixed,
  CircleDashed
} from 'lucide-react';
import { Button } from '../../components/common/UIComponents';

const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Share & Save', id: 'share-save' },
  { label: 'For Drivers', id: 'for-drivers' },
  { label: 'Safety', id: 'safety' },
  { label: 'About', id: 'about' },
];
const rideTypes = [
  { id: 'bike', label: 'Bike', icon: Bike, price: '₹105', eta: '4 min' },
  { id: 'auto', label: 'Auto', icon: Car, price: '₹150', eta: '6 min' },
  { id: 'share-auto', label: 'Share Auto', icon: CircleDashed, price: '₹92', eta: '8 min' },
  { id: 'cab', label: 'Cab', icon: Car, price: '₹280', eta: '5 min' },
  { id: 'share-cab', label: 'Share Cab', icon: Users, price: '₹155', eta: '9 min' },
];

const steps = [
  'Enter destination',
  'Choose vehicle',
  'Select private or shared',
  'Confirm booking',
  'Track ride'
];

const safetyFeatures = [
  'Identity verification',
  'Driver document review',
  'Emergency contact',
  'Trip sharing',
  'Transparent fare',
  'Support',
];

export function LandingPage() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('Powai');
  const [destination, setDestination] = useState('Andheri');
  const [selectedRide, setSelectedRide] = useState('share-cab');
  const [menuOpen, setMenuOpen] = useState(false);

  const selectedRideMeta = rideTypes.find((item) => item.id === selectedRide) || rideTypes[0];

  const handleFindRide = () => {
    if (!pickup || !destination) return;
    navigate('/onboarding/passenger');
  };

  const handleNavClick = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-slate-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/75 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 text-lg font-black flex items-center justify-center">S</div>
            <div>
              <div className="text-xl font-black leading-none">
                Smart<span className="text-emerald-600">Ride</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Move Together. Pay Less.</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm text-slate-600 font-medium">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => handleNavClick(item.id)} className="hover:text-slate-900 transition-colors">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <button type="button" onClick={() => navigate('/login')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Login</button>
            <button type="button" onClick={() => navigate('/onboarding/driver')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">Become a Driver</button>
            <button type="button" onClick={() => navigate('/onboarding/passenger')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors">Book a Ride</button>
          </div>

          <button type="button" className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white" onClick={() => setMenuOpen((prev) => !prev)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => handleNavClick(item.id)} className="block w-full text-left text-sm text-slate-600 py-2 hover:text-slate-900">{item.label}</button>
            ))}
          </div>
        )}
      </header>

      <main id="home" className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20">
        <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] items-center gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full px-4 py-2 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Next-Gen Mobility Tech • Smart Route Matching
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black tracking-[-0.06em] leading-[0.92] text-slate-900">
                Your City. Your Ride. Your Way.
              </h1>
              <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
                Book a bike, auto or cab — or share your route with people heading in the same direction. Travel smarter, spend less.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => navigate('/onboarding/passenger')}>Book a Ride</Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/onboarding/driver')}>Become a Driver</Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="bg-white rounded-[30px] border border-slate-200 shadow-[0_30px_60px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="relative h-[420px] bg-[radial-gradient(circle_at_top_left,_#f0fdf4,_#ffffff_35%,_#f5f7f9_100%)] p-5">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="relative h-full">
                  <div className="absolute left-10 top-12 h-24 w-24 rounded-full border border-emerald-200 bg-white/70 flex items-center justify-center shadow-sm">
                    <MapPinned className="w-7 h-7 text-emerald-600" />
                  </div>

                  <div className="absolute right-12 top-14 h-24 w-24 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center shadow-sm">
                    <LocateFixed className="w-7 h-7 text-slate-700" />
                  </div>

                  <div className="absolute inset-x-16 top-1/2 h-px bg-gradient-to-r from-emerald-300 via-slate-300 to-slate-300" />
                  <div className="absolute left-1/2 top-1/2 h-24 w-px bg-gradient-to-b from-emerald-300 to-slate-300 -translate-x-1/2 -translate-y-1/2" />

                  <div className="absolute left-[36%] top-[52%] flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700">Passenger A</span>
                  </div>

                  <div className="absolute right-[24%] top-[40%] flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-slate-800" />
                    <span className="text-xs font-semibold text-slate-700">Passenger B</span>
                  </div>

                  <div className="absolute left-1/2 top-[56%] -translate-x-1/2">
                    <div className="rounded-full border border-emerald-300 bg-emerald-600/10 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
                      Shared Route • 2 riders
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 left-6 right-6 bg-white rounded-[28px] border border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.12)] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Where are you going?</span>
                <span className="text-xs font-semibold text-emerald-600">Demo estimate</span>
              </div>
              <div className="space-y-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  <input value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {rideTypes.map((ride) => {
                  const Icon = ride.icon;
                  const isActive = selectedRide === ride.id;
                  return (
                    <button
                      key={ride.id}
                      type="button"
                      onClick={() => setSelectedRide(ride.id)}
                      className={`rounded-2xl border px-2 py-2 text-left transition-all ${
                        isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Icon className="w-3.5 h-3.5" />
                        {ride.label}
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500">{ride.price}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Estimated fare</div>
                  <div className="text-xl font-black text-emerald-400">{selectedRideMeta.price}</div>
                </div>
                <button type="button" onClick={handleFindRide} className="px-4 py-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
                  Find My Ride
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="share-save" className="mt-20">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Smart sharing</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.05em] text-slate-900 mt-3">Same Direction. Shared Journey.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center bg-white rounded-[30px] border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl border border-slate-200 p-4">
                <div>
                  <div className="text-xs text-slate-500">Passenger A</div>
                  <div className="font-bold text-slate-900">Powai → Andheri</div>
                </div>
                <Route className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs text-slate-500">Passenger B</div>
                  <div className="font-bold text-slate-900">Saki Naka → Andheri</div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-[radial-gradient(circle_at_center,_#ecfdf5,_#ffffff_65%)] p-5">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-medium">Common route</span>
                  <span className="font-semibold text-emerald-700">Shared ride</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white border border-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-500">Ride Alone</div>
                    <div className="mt-2 text-3xl font-black text-slate-900">₹280</div>
                    <div className="text-xs text-slate-500">demo fare</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                    <div className="text-xs font-semibold text-emerald-700">Share Your Ride</div>
                    <div className="mt-2 text-3xl font-black text-emerald-600">₹155</div>
                    <div className="text-xs text-emerald-700">per passenger</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] bg-slate-900 p-5 text-white">
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Potential saving</div>
                <div className="mt-4 text-4xl font-black text-emerald-400">₹125</div>
                <p className="mt-3 text-sm text-slate-300">Per rider from sharing a route with a common destination.</p>
              </div>

              <Button variant="primary" size="lg" fullWidth icon={ArrowRight} onClick={() => navigate('/onboarding/passenger')}>Explore Shared Rides</Button>
            </div>
          </div>
        </section>

        <section id="for-drivers" className="mt-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center rounded-[30px] bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Driver hub</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-[-0.05em] text-slate-900">Drive with us. Earn on your terms.</h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-lg">
              Join a mobility network that helps you find passengers, including people travelling along your route.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
              {['Flexible working hours', 'Ride requests', 'Shared ride opportunities', 'Transparent earning breakdown', 'Digital onboarding', 'Ride history'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] bg-slate-900 p-6 text-white">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Driver onboarding</div>
            <div className="mt-5 space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-3"><BriefcaseBusiness className="w-4 h-4 text-emerald-400" /> Register in minutes</div>
              <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure document review</div>
              <div className="flex items-center gap-3"><DollarSign className="w-4 h-4 text-emerald-400" /> Transparent payouts</div>
            </div>
            <div className="mt-6">
              <Button variant="primary" size="lg" fullWidth icon={ArrowRight} onClick={() => navigate('/onboarding/driver')}>Register as Driver</Button>
            </div>
          </div>
        </section>

        <section id="safety" className="mt-20">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Trust & safety</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-[-0.05em] text-slate-900">Every journey deserves trust.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {safetyFeatures.map((feature, index) => (
              <div key={feature} className="bg-white border border-slate-200 rounded-[22px] p-5 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">0{index + 1}</div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{feature}</h3>
                <p className="mt-2 text-sm text-slate-600">Clear product capability and a transparent ride experience designed to build confidence from the first trip.</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-20 rounded-[30px] bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">How it works</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-[-0.05em] text-slate-900">Simple steps. Smarter travel.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">{index + 1}</div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{step}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="about" className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-slate-600">
          <div>
            <div className="text-2xl font-black text-slate-900">
              Smart<span className="text-emerald-600">Ride</span>
            </div>
            <p className="mt-3 max-w-xs text-slate-600 text-xs leading-relaxed">
              Move Together. Pay Less. India's smartest ride-sharing platform with high-alignment dynamic matching.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Quick Navigation</div>
            <div className="flex flex-col space-y-2 text-xs">
              <button type="button" onClick={() => navigate('/app')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">Passenger App</button>
              <button type="button" onClick={() => navigate('/onboarding/driver')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">Register as Driver</button>
              <button type="button" onClick={() => navigate('/driver')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">Driver Console</button>
              <button type="button" onClick={() => navigate('/admin')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">Admin Dashboard</button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Support & Legal</div>
            <div className="flex flex-col space-y-2 text-xs">
              <button type="button" onClick={() => navigate('/about')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">About Us</button>
              <button type="button" onClick={() => navigate('/help')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">Help & FAQ</button>
              <button type="button" onClick={() => navigate('/terms')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">Terms of Service</button>
              <button type="button" onClick={() => navigate('/privacy')} className="text-left hover:text-emerald-600 transition-colors cursor-pointer">Privacy Policy</button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Connect With Us</div>
            <p className="text-2xs text-slate-500 mb-3">24/7 dedicated rider and driver partner assistance.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigate('/help')} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 cursor-pointer">Help Center</button>
              <button type="button" onClick={() => navigate('/login')} className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs hover:bg-slate-800 cursor-pointer">Sign In</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
