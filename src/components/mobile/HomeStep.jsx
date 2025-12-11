import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

const HomeStep = ({ onActivate }) => {
    return (
        <div className="flex flex-col items-center justify-between h-full pt-10 pb-6 relative z-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Emergency</h2>
                <p className="text-gray-500 dark:text-gray-400">Press the button for immediate help</p>
            </div>

            <div className="relative flex items-center justify-center">
                {/* Complex Pulse Animations */}
                <div className="absolute w-[400px] h-[400px] bg-red-500/5 rounded-full animate-pulse-glow blur-3xl delay-0" />
                <div className="absolute w-[300px] h-[300px] bg-red-500/10 rounded-full animate-pulse-glow blur-2xl delay-100" />
                <div className="absolute w-[250px] h-[250px] bg-red-500/20 rounded-full animate-pulse-glow blur-xl delay-300" />

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onActivate}
                    className="relative w-64 h-64 rounded-full bg-gradient-to-br from-[#E74C3C] to-[#C0392B] flex flex-col items-center justify-center z-20 group transition-all duration-300"
                    style={{
                        boxShadow: '0 0 0 10px rgba(231, 76, 60, 0.1), 0 0 0 20px rgba(231, 76, 60, 0.05), inset 0 2px 20px rgba(255,255,255,0.4), 0 20px 50px rgba(0,0,0,0.4)'
                    }}
                >
                    <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    <span className="text-6xl font-black text-white tracking-widest drop-shadow-md">SOS</span>
                    <span className="text-white/90 text-sm font-bold mt-2 uppercase tracking-widest opacity-80">Tap for Help</span>
                </motion.button>
            </div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl p-5 shadow-lg border border-white/20"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-primary">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Your Location</p>
                        <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-800 dark:text-white">Indiranagar, Bangalore</span>
                            <Navigation size={12} className="text-primary fill-current" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HomeStep;
