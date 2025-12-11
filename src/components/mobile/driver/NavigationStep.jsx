import React from 'react';
import { motion } from 'framer-motion';
import { Navigation2, Phone, Shield, MoreVertical, MapPin } from 'lucide-react';

const NavigationStep = () => {
    return (
        <div className="h-full flex flex-col relative bg-slate-900">
            {/* Header / Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <Navigation2 size={32} className="text-white fill-white" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Turn Right</h2>
                            <p className="text-slate-400 text-sm">onto 100ft Road in 200m</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="flex-1 bg-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.5946,12.9716,14,0,0/400x800?access_token=pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xhbzR5Z2Z0MDB3NzNvbzhzZ2Z0MDB3NyJ9.Ys-7qF4_6j8_6j8_6j8')] bg-cover bg-center grayscale opacity-60" />

                {/* Route Line Simulation (Simple visual) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M180,600 C180,500 220,400 220,300" stroke="#3b82f6" strokeWidth="6" fill="none" strokeDasharray="10 5" />
                </svg>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg relative">
                        <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Bottom Sheet - Patient Details */}
            <div className="bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 pb-8 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl">
                            JD
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">John Doe</h3>
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                                <Shield size={12} className="text-emerald-500" />
                                Verified User • <span className="text-red-400">Cardiac History</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 border border-white/5">
                            <Phone size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 border border-white/5">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20">
                        Arrived
                    </button>
                    <button className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl border border-white/5">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavigationStep;
