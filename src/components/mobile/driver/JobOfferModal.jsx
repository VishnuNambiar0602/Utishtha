import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Navigation, Clock } from 'lucide-react';

const JobOfferModal = ({ onAccept, onDecline }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onDecline(); // Auto-decline
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onDecline]);

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        >
            <motion.div
                className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden"
            >
                {/* Progress bar background */}
                <div
                    className="absolute top-0 left-0 h-1 bg-red-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                />

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <AlertTriangle size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Emergency Request</h3>
                        <p className="text-red-400 text-xs font-bold tracking-wider uppercase">High Priority • Cardiac</p>
                    </div>
                    <div className="ml-auto text-2xl font-mono font-bold text-slate-500">
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <MapPin className="text-slate-400 mt-1" size={18} />
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Pickup Location</p>
                            <p className="text-sm font-semibold text-white">123, 4th Cross, Indiranagar</p>
                            <p className="text-xs text-slate-500">Near Metro Station</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <Navigation size={18} className="text-primary mb-1" />
                            <span className="text-lg font-bold text-white">2.4 km</span>
                            <span className="text-[10px] text-slate-400">Distance</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <Clock size={18} className="text-primary mb-1" />
                            <span className="text-lg font-bold text-white">8 min</span>
                            <span className="text-[10px] text-slate-400">ETA</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onDecline}
                        className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                    >
                        Decline
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition active:scale-95"
                    >
                        Accept Job
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default JobOfferModal;
