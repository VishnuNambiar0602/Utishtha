import React from 'react';
import { motion } from 'framer-motion';
import { Phone, CheckCircle } from 'lucide-react';

const TrackingStep = () => {
    // Mock Driver: Ramesh K.
    return (
        <div className="h-full relative overflow-hidden flex flex-col justify-end">
            {/* Map Placeholder BG */}
            <div className="absolute inset-0 bg-slate-800 z-0 opacity-80">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle, #3A8DFF 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>
                {/* Route Line Mockup */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M180,200 Q220,400 300,600" fill="none" stroke="#2ECC71" strokeWidth="4" strokeDasharray="10,10" className="animate-[dash_1s_linear_infinite]" />
                </svg>
            </div>

            {/* Driver Card */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="relative z-10 glass-card mx-4 mb-6 rounded-3xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-success flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh" alt="Driver" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Ramesh K.</h3>
                            <p className="text-slate-400 text-sm">Validating ID: #8821</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-mono font-bold text-success">4</span>
                        <span className="text-xs text-slate-400 uppercase">Mins Away</span>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 mb-4">
                    <span className="text-slate-300 font-mono">KA-01-AB-1234</span>
                    <span className="px-2 py-1 rounded bg-success/20 text-success text-xs font-bold uppercase tracking-wider">On The Way</span>
                </div>

                <button className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 text-white font-bold text-lg transition-all">
                    <Phone size={20} />
                    <span>Call Driver</span>
                </button>
            </motion.div>
        </div>
    );
};

export default TrackingStep;
