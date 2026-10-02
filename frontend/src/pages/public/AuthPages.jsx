import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Mail,
  User,
  Users,
  CheckCircle2,
  CreditCard,
  IdCard,
  Car,
  FileText,
  MapPin,
  BadgeCheck,
  CalendarDays,
  Camera,
  Wallet
} from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { useAuthStore } from '../../store/useAuthStore';

const roleOptions = [
  { id: 'passenger', label: 'Passenger', description: 'Book rides' },
  { id: 'driver', label: 'Driver', description: 'Accept rides' },
  { id: 'admin', label: 'Admin', description: 'Manage system' },
];

function getRolePath(role, mode = 'login') {
  if (mode === 'register') {
    if (role === 'admin') return '/admin';
    if (role === 'driver') return '/onboarding/driver';
    return '/onboarding/passenger';
  }

  if (role === 'admin') return '/admin';
  if (role === 'driver') return '/driver';
  return '/app';
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, setRole, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  const initialRole = location.state?.role || 'passenger';
  const initialMode = location.state?.mode || (location.pathname === '/signup' ? 'register' : 'login');

  const [authMode, setAuthMode] = useState(initialMode);
  const [roleType, setRoleType] = useState(initialRole);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect already-logged-in users
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      if (from) return navigate(from, { replace: true });
      navigate(getRolePath(user.role || roleType, 'login'), { replace: true });
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (authMode === 'register' && formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (authMode === 'login') {
      const result = await login({
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: roleType,
      });
      if (result.success) {
        setRole(result.user.role || roleType);
        navigate(getRolePath(result.user.role || roleType, 'login'));
      } else {
        setFormError(result.message);
      }
    } else {
      const result = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: roleType,
      });
      if (result.success) {
        setRole(result.user.role || roleType);
        navigate(getRolePath(result.user.role || roleType, 'register'));
      } else {
        setFormError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border border-slate-200 rounded-[30px] shadow-[0_25px_60px_rgba(15,23,42,0.08)] p-6 sm:p-7"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-xl mx-auto">S</div>
          <h2 className="mt-4 text-2xl font-black text-slate-900">Welcome to SmartRide</h2>
          <p className="mt-1 text-xs text-slate-500">{authMode === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
        </div>

        {/* Role Selector */}
        <div className="mt-6 bg-slate-100 p-1 rounded-2xl flex text-xs font-semibold">
          {roleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRoleType(option.id)}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                roleType === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Selected access</div>
          <div className="mt-1 text-sm font-bold text-slate-900">{roleType.charAt(0).toUpperCase() + roleType.slice(1)} portal</div>
        </div>

        {/* Login / Register toggle */}
        <div className="mt-5 flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
          <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-xl ${authMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Login</button>
          <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-xl ${authMode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Register</button>
        </div>

        {/* Error display */}
        {(formError || error) && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {authMode === 'register' && (
            <Input label="Full Name" icon={User} name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
          )}
          <Input label="Email Address" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          <Input label="Mobile Number" icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter 10-digit number" required />
          <Input label="Password" icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder={authMode === 'login' ? 'Enter your password' : 'Create a password'} required />
          {authMode === 'register' && (
            <Input label="Confirm Password" icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" required />
          )}

          <Button type="submit" fullWidth variant="primary" icon={ArrowRight} size="lg" disabled={isLoading}>
            {isLoading ? 'Please wait...' : (authMode === 'login' ? `Login as ${roleType}` : `Create ${roleType} account`)}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Secure role-based verification
        </div>
      </motion.div>
    </div>
  );
}

// ─── OTPPage ──────────────────────────────────────────────────────────────────
export function OTPPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['4', '8', '2', '1']);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white border border-slate-200 rounded-[30px] p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="mt-4 text-center text-2xl font-black text-slate-900">Enter OTP</h3>
        <p className="mt-2 text-center text-xs text-slate-500">Demo OTP sent to +91 98765 43210</p>

        <div className="mt-6 flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input key={index} value={digit} readOnly className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-900" />
          ))}
        </div>

        <Button fullWidth variant="primary" className="mt-6" onClick={() => navigate('/app')}>Verify & Continue</Button>
      </motion.div>
    </div>
  );
}

// ─── PassengerOnboardingFlow ──────────────────────────────────────────────────
export function PassengerOnboardingFlow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', dob: '', city: 'Mumbai', language: 'English' });
  const [otpSent, setOtpSent] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const progress = `${(step / 7) * 100}%`;

  if (done) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[30px] px-6 py-10 text-center shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><CheckCircle2 className="w-9 h-9" /></div>
          <h2 className="mt-5 text-3xl font-black text-slate-900">Welcome to SmartRide!</h2>
          <p className="mt-3 text-slate-600">Your account has been created successfully and is ready for booking.</p>
          <Button variant="primary" size="lg" icon={ArrowRight} className="mt-6" onClick={() => navigate('/app')}>Start Booking</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto rounded-[30px] bg-white border border-slate-200 shadow-[0_25px_60px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Passenger onboarding</div>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Create your account</h2>
            </div>
            <div className="text-sm font-semibold text-slate-500">Step {step}/7</div>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: progress }} />
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-lg font-bold text-slate-900">Account Type</div>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-left">
                  <User className="w-5 h-5 text-emerald-700" />
                  <div className="mt-3 text-lg font-bold text-slate-900">Passenger</div>
                  <div className="text-sm text-slate-600">Book rides</div>
                </button>
                <button type="button" onClick={() => navigate('/onboarding/driver')} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left">
                  <Car className="w-5 h-5 text-slate-700" />
                  <div className="mt-3 text-lg font-bold text-slate-900">Driver</div>
                  <div className="text-sm text-slate-600">Register as driver</div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-lg font-bold text-slate-900">Basic Information</div>
              <Input label="Full legal name" icon={User} value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter full legal name" />
              <Input label="Mobile number" icon={Phone} value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="9876543210" />
              <Input label="Email" icon={Mail} type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="you@example.com" />
              <Input label="Password" icon={Lock} type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Create a password" />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-lg font-bold text-slate-900">Mobile Verification</div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-600">Demo OTP mode only — no real SMS provider is connected.</div>
                <div className="mt-4 flex justify-center gap-3">
                  {['4', '8', '2', '1'].map((value, index) => (
                    <div key={index} className="w-12 h-12 rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-900 flex items-center justify-center">{value}</div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Resend in 00:30</span>
                  <button type="button" onClick={() => setOtpSent(true)} className="text-emerald-600 font-semibold">Resend OTP</button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-lg font-bold text-slate-900">Personal Profile</div>
              <Input label="Date of birth" icon={CalendarDays} type="date" value={formData.dob} onChange={(e) => handleInputChange('dob', e.target.value)} />
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><Camera className="w-5 h-5 text-slate-500" /><span className="text-sm text-slate-600">Upload profile photo</span></div>
                <button type="button" className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold">Select</button>
              </div>
              <Input label="City" icon={MapPin} value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
              <Input label="Preferred language" icon={BadgeCheck} value={formData.language} onChange={(e) => handleInputChange('language', e.target.value)} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="text-lg font-bold text-slate-900">Identity Verification</div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-900 font-bold"><IdCard className="w-5 h-5 text-emerald-600" /> Why verification is requested</div>
                <p className="mt-3 text-sm text-slate-600">We ask for identity verification to keep riders and drivers safe, support trust, and comply with platform safety requirements.</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button type="button" className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Authorized DigiLocker flow</button>
                  <button type="button" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Alternative verification</button>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="text-lg font-bold text-slate-900">Emergency Contact</div>
              <Input label="Contact name" icon={User} placeholder="Enter full name" />
              <Input label="Relationship" icon={Users} placeholder="Brother / Spouse / Friend" />
              <Input label="Mobile number" icon={Phone} placeholder="Emergency contact number" />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="text-lg font-bold text-slate-900">Review & Submit</div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between"><span>Name</span><span className="font-semibold text-slate-900">{formData.name || 'Not added'}</span></div>
                <div className="flex justify-between"><span>Email</span><span className="font-semibold text-slate-900">{formData.email || 'Not added'}</span></div>
                <div className="flex justify-between"><span>City</span><span className="font-semibold text-slate-900">{formData.city}</span></div>
                <div className="flex justify-between"><span>Verification</span><span className="font-semibold text-slate-900">Consent-based</span></div>
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" className="mt-1 accent-emerald-600" />
                <span>I confirm the information submitted is accurate and I agree to the privacy notice and terms.</span>
              </label>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <Button variant="outline" onClick={prevStep} disabled={step === 1}>Back</Button>
            {step < 7 ? (
              <Button variant="primary" onClick={nextStep}>Continue</Button>
            ) : (
              <Button variant="primary" onClick={() => setDone(true)}>Submit</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DriverOnboardingFlow ─────────────────────────────────────────────────────
export function DriverOnboardingFlow() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const steps = [
    'Personal Details',
    'Identity Verification',
    'Driving Licence',
    'Vehicle Details',
    'Driver Documents',
    'Bank Details',
    'Review & Submit',
  ];

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const progress = `${(step / steps.length) * 100}%`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[30px] px-6 py-10 text-center shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><CheckCircle2 className="w-9 h-9" /></div>
          <h2 className="mt-5 text-3xl font-black text-slate-900">Your application has been submitted!</h2>
          <p className="mt-3 text-slate-600">Your driver account is pending verification. We will review your documents and notify you once approved.</p>
          <Button variant="primary" size="lg" icon={ArrowRight} className="mt-6" onClick={() => navigate('/driver')}>Go to Driver Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto rounded-[30px] bg-white border border-slate-200 shadow-[0_25px_60px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Driver onboarding</div>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Register and verify your profile</h2>
            </div>
            <div className="text-sm font-semibold text-slate-500">{step}/{steps.length}</div>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: progress }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b lg:border-b-0 lg:border-r border-slate-200 p-5 bg-slate-50">
            <div className="space-y-3">
              {steps.map((title, index) => (
                <div key={title} className={`rounded-2xl px-3 py-3 border text-sm font-semibold ${index + 1 === step ? 'bg-white border-emerald-200 text-slate-900' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                  {String(index + 1).padStart(2, '0')} {title}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-lg font-bold text-slate-900">Personal Details</div>
                <Input label="Full legal name" icon={User} placeholder="Enter full name" />
                <Input label="Mobile number" icon={Phone} placeholder="Enter mobile number" />
                <Input label="Email" icon={Mail} placeholder="you@example.com" />
                <Input label="Date of birth" icon={CalendarDays} type="date" />
                <Input label="Residential address" icon={MapPin} placeholder="Enter address" />
                <Input label="City" icon={MapPin} placeholder="Enter city" />
                <Input label="PIN code" icon={FileText} placeholder="Enter pincode" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-lg font-bold text-slate-900">Identity Verification</div>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3 text-slate-900 font-bold"><BadgeCheck className="w-5 h-5 text-emerald-600" /> Verify your identity securely</div>
                  <p className="mt-3 text-sm text-slate-600">Connect your DigiLocker account to share eligible documents securely. Demo mode is available when credentials are not configured.</p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button type="button" className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Continue with DigiLocker</button>
                    <button type="button" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Simulated verification</button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-lg font-bold text-slate-900">Driving Licence</div>
                <Input label="Licence number" icon={IdCard} placeholder="Enter licence number" />
                <Input label="Issuing state" icon={MapPin} placeholder="e.g. Maharashtra" />
                <Input label="Validity date" icon={CalendarDays} type="date" />
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Upload or fetch from DigiLocker</div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="text-lg font-bold text-slate-900">Vehicle Details</div>
                <Input label="Registration number" icon={Car} placeholder="e.g. MH 12 AB 1234" />
                <Input label="Vehicle make" icon={Car} placeholder="e.g. Maruti" />
                <Input label="Model" icon={Car} placeholder="e.g. Swift Dzire" />
                <Input label="Manufacturing year" icon={CalendarDays} placeholder="2019" />
                <Input label="Fuel type" icon={Car} placeholder="Petrol / CNG / EV" />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="text-lg font-bold text-slate-900">Driver Documents</div>
                {['Identity proof', 'Driving Licence', 'Vehicle RC', 'Insurance', 'Profile photo'].map((doc) => (
                  <div key={doc} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-slate-500" /><span className="text-sm font-medium text-slate-700">{doc}</span></div>
                    <button type="button" className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold">Upload</button>
                  </div>
                ))}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="text-lg font-bold text-slate-900">Bank Details</div>
                <Input label="Account holder name" icon={Wallet} placeholder="Full account name" />
                <Input label="Account number" icon={CreditCard} placeholder="Enter account number" />
                <Input label="IFSC code" icon={Wallet} placeholder="Enter IFSC" />
                <Input label="UPI ID (optional)" icon={Wallet} placeholder="example@upi" />
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <div className="text-lg font-bold text-slate-900">Review & Submit</div>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Name</span><span className="font-semibold text-slate-900">Rajesh Kumar</span></div>
                  <div className="flex justify-between mt-2"><span>Verification</span><span className="font-semibold text-slate-900">Pending</span></div>
                  <div className="flex justify-between mt-2"><span>Vehicle</span><span className="font-semibold text-slate-900">Swift Dzire</span></div>
                </div>
                <label className="flex items-start gap-3 text-sm text-slate-600">
                  <input type="checkbox" className="mt-1 accent-emerald-600" />
                  <span>I confirm that the information submitted is accurate and I agree to the terms and privacy notice.</span>
                </label>
              </div>
            )}

            <div className="mt-8 flex justify-between gap-3">
              <Button variant="outline" onClick={prevStep} disabled={step === 1}>Back</Button>
              {step < steps.length ? (
                <Button variant="primary" onClick={nextStep}>Continue</Button>
              ) : (
                <Button variant="primary" onClick={() => setSubmitted(true)}>Submit for Verification</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StaticPublicPages ────────────────────────────────────────────────────────
export function StaticPublicPages({ page }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-xs font-semibold text-emerald-600">← Back</button>
      <div className="bg-white p-8 rounded-3xl shadow-[0_10px_25px_rgba(15,23,42,0.04)] border border-slate-200/80 space-y-4 text-left">
        <h1 className="text-2xl font-bold text-slate-900 capitalize">{page} - SmartRide</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          SmartRide is committed to delivering efficient, safe, and affordable mobility services powered by transparent route matching and verified community-based travel.
        </p>
      </div>
    </div>
  );
}
