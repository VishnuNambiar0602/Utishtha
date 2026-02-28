
import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import VendorPortal from './components/DriverInterface';
import Login from './components/Login';
import { AuthRole, User } from './types';

type PortalType = 'none' | 'admin' | 'vendor';

const App: React.FC = () => {
  const [portalSelection, setPortalSelection] = useState<PortalType>('none');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mats_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mats_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mats_user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setPortalSelection('none');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  // If user is logged in, show their portal
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <button 
          onClick={handleLogout}
          className="fixed bottom-6 left-6 z-[9999] px-5 py-2.5 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-rose-600 transition-all flex items-center gap-2 hover:scale-105"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Secure Sign Out
        </button>

        {user.role === 'admin' ? <AdminDashboard /> : <VendorPortal />}
      </div>
    );
  }

  // If role is selected but not logged in, show Login form
  if (portalSelection !== 'none') {
    return (
      <Login 
        role={portalSelection as AuthRole} 
        onLogin={handleLogin} 
        onBack={() => setPortalSelection('none')} 
      />
    );
  }

  // Initial Portal Selection Landing
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <i className="fa-solid fa-truck-medical text-rose-500"></i>
            <span className="text-xs font-black tracking-widest text-rose-400 uppercase">Emergency Response System</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter italic uppercase">
            MATS <span className="text-rose-600">OS</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto">
            Management of Ambulance and Tracking System. Centralized command for life-critical logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Admin Portal Card */}
          <button 
            onClick={() => setPortalSelection('admin')}
            className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 p-8 rounded-3xl transition-all duration-300 text-left space-y-4 shadow-2xl hover:scale-105"
          >
            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <i className="fa-solid fa-tower-broadcast text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white uppercase italic">Admin Portal</h3>
              <p className="text-sm text-slate-400 mt-2">Dispatcher HQ, fleet monitoring, AI routing, and mission logs.</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-rose-500 font-bold text-sm">
              <span>Access Command Center</span>
              <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
            </div>
          </button>

          {/* Vendor Portal Card */}
          <button 
            onClick={() => setPortalSelection('vendor')}
            className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 p-8 rounded-3xl transition-all duration-300 text-left space-y-4 shadow-2xl hover:scale-105"
          >
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <i className="fa-solid fa-ambulance text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white uppercase italic">Vendor Portal</h3>
              <p className="text-sm text-slate-400 mt-2">Driver-focused mission tracking, real-time GPS, and status updates.</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-blue-500 font-bold text-sm">
              <span>Access Driver Unit</span>
              <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
            </div>
          </button>
        </div>

        <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
          Authorized Access Only • System Version 2.0.4-MVP
        </p>
      </div>
    </div>
  );
};

export default App;
