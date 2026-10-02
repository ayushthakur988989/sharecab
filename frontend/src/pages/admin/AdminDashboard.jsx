import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, Car, DollarSign, Sliders, CheckCircle, AlertTriangle, Sparkles, Filter, Search, FileText, Lock, MessageSquare, CreditCard, ChevronRight, Activity, Zap } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import { Button, Badge, Modal } from '../../components/common/UIComponents';

export function AdminDashboard() {
  const {
    stats,
    config,
    usersList,
    driversList,
    activeRidesList,
    driversPendingVerification,
    paymentsList,
    complaintsList,
    updateConfig,
    approveDriver,
    resolveComplaint
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'drivers' | 'active_rides' | 'shared_rides' | 'payments' | 'complaints' | 'revenue' | 'pricing'
  const [searchTerm, setSearchTerm] = useState('');

  const adminTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'active_rides', label: 'Active Rides' },
    { id: 'shared_rides', label: 'Shared Rides' },
    { id: 'payments', label: 'Payments' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'pricing', label: 'Pricing' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 text-left space-y-6">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <span className="text-2xs font-extrabold text-emerald-600 uppercase tracking-wider block">Admin Scalable Control Center</span>
          <h1 className="text-2xl font-black text-slate-900">SmartRide Platform Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage users, drivers, route matching, pricing & real-time revenue</p>
        </div>

        {/* Scalable Tab Navigation */}
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl text-xs font-bold gap-1 max-w-full overflow-x-auto">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl capitalize transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-emerald-400 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-2xs text-slate-400 font-semibold block">Total Revenue</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">₹{stats.todayRevenue.toLocaleString()}</span>
          <span className="text-2xs text-emerald-600 font-semibold block">+18.4% today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-2xs text-slate-400 font-semibold block">Match Success Rate</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">{stats.matchSuccessRate}%</span>
          <span className="text-2xs text-slate-500 block">Spatial overlap &gt; 65%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-2xs text-slate-400 font-semibold block">Active Rides</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalActiveRides}</span>
          <span className="text-2xs font-semibold text-emerald-700 block">{stats.sharedRidesActive} Pooled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-2xs text-slate-400 font-semibold block">Commission (15%)</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">₹{stats.platformCommissionTotal.toLocaleString()}</span>
          <span className="text-2xs text-slate-400 block">Platform earnings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-2xs text-slate-400 font-semibold block">CO2 Offset</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.co2SavedKg} kg</span>
          <span className="text-2xs text-emerald-600 font-semibold block">Eco-ride impact</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-2xs text-slate-400 font-semibold block">Active Drivers</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalDriversOnline}</span>
          <span className="text-2xs text-slate-500 block">Online & accepting</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Live Active Rides Monitor</h3>
              <Badge variant="emerald">Live Socket Refresh</Badge>
            </div>

            <div className="space-y-3">
              {activeRidesList.map((ride) => (
                <div key={ride.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{ride.id} • {ride.vehicle}</span>
                    <span className="text-slate-500">{ride.pickup} → {ride.destination}</span>
                    <span className="block text-2xs text-slate-400 mt-0.5">Driver: {ride.driver} ({ride.passengerCount} passengers)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg block">
                      {ride.status}
                    </span>
                    {ride.overlapPercent > 0 && (
                      <span className="text-2xs text-slate-500 font-semibold mt-1 block">Overlap {ride.overlapPercent}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base">Quick Surge & Commission Controls</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Platform Commission Rate: {config.platformCommissionPercent}%</label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={config.platformCommissionPercent}
                  onChange={(e) => updateConfig('platformCommissionPercent', e.target.value)}
                  className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Surge Multiplier: {config.surgeMultiplier}x</label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={config.surgeMultiplier}
                  onChange={(e) => updateConfig('surgeMultiplier', e.target.value)}
                  className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Max Detour Threshold: {config.maxDetourKm} km</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={config.maxDetourKm}
                  onChange={(e) => updateConfig('maxDetourKm', e.target.value)}
                  className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Registered Users Management</h3>
            <span className="text-xs font-semibold text-slate-500">Total: {stats.totalRegisteredUsers} users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3">User ID & Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Total Rides</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Wallet Balance</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3 font-bold text-slate-900">{u.name} <span className="text-2xs text-slate-400 block font-normal">{u.id}</span></td>
                    <td className="p-3 text-slate-600">{u.phone}</td>
                    <td className="p-3 font-semibold text-slate-800">{u.ridesCount} rides</td>
                    <td className="p-3 font-bold text-amber-600">★ {u.rating}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{u.wallet}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-2xs font-bold ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DRIVERS */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          {/* Driver Verification Pipeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Driver Verification Pipeline</h3>
            {driversPendingVerification.length === 0 ? (
              <p className="text-xs text-slate-400">All driver onboarding documents are approved.</p>
            ) : (
              <div className="space-y-3">
                {driversPendingVerification.map((driver) => (
                  <div key={driver.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{driver.name}</h4>
                      <p className="text-slate-500">{driver.vehicleName} ({driver.vehicleNumber}) • Phone: {driver.phone}</p>
                      <span className="text-2xs text-slate-400">Submitted {driver.submittedDate}</span>
                    </div>
                    <Button size="sm" variant="primary" onClick={() => approveDriver(driver.id)}>
                      Approve Partner Authorization
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Drivers Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Driver Fleet Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3">Driver Name</th>
                    <th className="p-3">Vehicle Details</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Completed Trips</th>
                    <th className="p-3">Today Earnings</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {driversList.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">{d.name} <span className="text-2xs text-slate-400 block font-normal">{d.id}</span></td>
                      <td className="p-3 text-slate-600">{d.vehicle}</td>
                      <td className="p-3 font-bold text-amber-600">★ {d.rating}</td>
                      <td className="p-3 font-semibold text-slate-800">{d.rides} trips</td>
                      <td className="p-3 font-bold text-emerald-700">₹{d.earnings}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-2xs font-bold ${d.status === 'Online' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE RIDES */}
      {activeTab === 'active_rides' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Live Active Rides Monitor</h3>
          <div className="space-y-3">
            {activeRidesList.map((ride) => (
              <div key={ride.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ride.id} • {ride.vehicle}</h4>
                  <p className="text-slate-500">{ride.pickup} → {ride.destination}</p>
                  <p className="text-2xs text-slate-400 mt-0.5">Driver: {ride.driver} • Seating Capacity: {ride.passengerCount}/4</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-slate-900 block">₹{ride.fare}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-2xs">
                    {ride.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SHARED RIDES ANALYTICS */}
      {activeTab === 'shared_rides' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Intelligent Shared Ride Analytics</h3>
              <p className="text-xs text-slate-500">Route overlap distribution & passenger pooling efficiency</p>
            </div>
            <Badge variant="emerald" icon={Sparkles}>
              84.5% Match Success Rate
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-2xs text-slate-400 font-semibold block">Avg Route Overlap</span>
              <span className="text-2xl font-black text-slate-900">82.4%</span>
              <span className="text-2xs text-emerald-600 font-semibold">Min threshold 65%</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-2xs text-slate-400 font-semibold block">Avg Savings / Passenger</span>
              <span className="text-2xl font-black text-emerald-600">₹{stats.averageSharedSavings}</span>
              <span className="text-2xs text-slate-500">45% cheaper than solo cab</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-2xs text-slate-400 font-semibold block">Avg Detour Added</span>
              <span className="text-2xl font-black text-slate-900">1.4 km</span>
              <span className="text-2xs text-slate-500">+3.2 min ETA impact</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Real-Time Transactions Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3">Txn ID & Date</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Gross Amount</th>
                  <th className="p-3">Platform Fee (15%)</th>
                  <th className="p-3">Driver Net Payout</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentsList.map((p) => (
                  <tr key={p.txnId} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{p.txnId} <span className="text-2xs text-slate-400 block font-normal">{p.date}</span></td>
                    <td className="p-3 text-slate-700 font-semibold">{p.user}</td>
                    <td className="p-3 text-slate-600">{p.method}</td>
                    <td className="p-3 font-bold text-slate-900">₹{p.amount}</td>
                    <td className="p-3 font-semibold text-emerald-700">₹{p.commission}</td>
                    <td className="p-3 font-bold text-slate-800">₹{p.driverPayout}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-2xs font-bold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Safety & Complaints Resolution Hub</h3>
          <div className="space-y-3">
            {complaintsList.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.id} • {c.category}</span>
                    <span className={`px-2 py-0.5 rounded text-2xs font-bold ${c.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'}`}>
                      {c.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{c.details}</p>
                  <p className="text-2xs text-slate-400 mt-0.5">User: {c.user} • Driver: {c.driver} ({c.date})</p>
                </div>
                <div>
                  {c.status === 'PENDING' ? (
                    <Button size="sm" variant="primary" onClick={() => resolveComplaint(c.id)}>
                      Mark Resolved
                    </Button>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: REVENUE */}
      {activeTab === 'revenue' && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">Financial Revenue Breakdown</h3>
              <p className="text-xs text-slate-400">Net platform margins & driver incentive payouts</p>
            </div>
            <span className="text-xl font-black text-emerald-400">₹{stats.todayRevenue.toLocaleString()} Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
              <span className="text-xs text-slate-400 block">Platform Net Earnings (15%)</span>
              <span className="text-2xl font-bold text-emerald-400">₹{stats.platformCommissionTotal.toLocaleString()}</span>
              <span className="text-2xs text-slate-400 block">After driver payouts</span>
            </div>

            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
              <span className="text-xs text-slate-400 block">Driver Net Payouts (85%)</span>
              <span className="text-2xl font-bold text-white">₹{(stats.todayRevenue - stats.platformCommissionTotal).toLocaleString()}</span>
              <span className="text-2xs text-slate-400 block">Disbursed to partners</span>
            </div>

            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
              <span className="text-xs text-slate-400 block">Passenger Total Savings</span>
              <span className="text-2xl font-bold text-emerald-400">₹{(stats.sharedRidesActive * stats.averageSharedSavings).toLocaleString()}</span>
              <span className="text-2xs text-emerald-400 font-semibold block">Via route sharing</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: PRICING CONFIGURATION */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Dynamic Pricing & Matching Threshold Configurator</h3>
            <p className="text-xs text-slate-500">Fine-tune base fares, surge multipliers, and spatial detour caps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Base Fares & Per KM Rates</h4>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Base Cab Fare: ₹{config.baseFareCab}</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={config.baseFareCab}
                  onChange={(e) => updateConfig('baseFareCab', e.target.value)}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Per KM Rate (Cab): ₹{config.perKmCab}/km</label>
                <input
                  type="range"
                  min="8"
                  max="25"
                  value={config.perKmCab}
                  onChange={(e) => updateConfig('perKmCab', e.target.value)}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Surge & Sharing Discounts</h4>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Surge Multiplier: {config.surgeMultiplier}x</label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={config.surgeMultiplier}
                  onChange={(e) => updateConfig('surgeMultiplier', e.target.value)}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cab Sharing Discount: {config.cabShareDiscountPercent}%</label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={config.cabShareDiscountPercent}
                  onChange={(e) => updateConfig('cabShareDiscountPercent', e.target.value)}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
