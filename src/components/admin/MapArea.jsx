import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { mockDrivers } from '../../lib/mockData';

const MapArea = () => {
    return (
        <div className="flex-1 bg-slate-900/50 rounded-2xl relative overflow-hidden border border-white/10 group">
            {/* Dark Map Background Grid */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#3A8DFF 1px, transparent 1px), linear-gradient(90deg, #3A8DFF 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Map Content Container */}
            <div className="absolute inset-0 p-10">

                {/* Mock City Shapes (Simplified) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 800 600">
                    <path d="M100,500 L300,450 L400,200 L600,250 L750,550" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M50,150 L250,180 L500,100 L700,50" fill="none" stroke="white" strokeWidth="2" />
                </svg>

                {/* Drivers Markers */}
                {mockDrivers.map((driver) => (
                    <motion.div
                        key={driver.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: driver.id * 0.1 }}
                        className="absolute"
                        // Simple mock positioning based on mock lat/lng (normalized for demo)
                        style={{
                            top: `${(driver.lat - 12.9600) * 3000}%`, // Fake projection
                            left: `${(driver.lng - 77.5900) * 3000}%`
                        }}
                    >
                        <div className="relative group/marker">
                            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg 
                    ${driver.status === 'free' ? 'bg-success shadow-success/50' :
                                    driver.status === 'busy' ? 'bg-danger shadow-danger/50' : 'bg-yellow-500'}
                    `}
                            />

                            {/* Pulse Ring */}
                            {driver.status === 'busy' && (
                                <div className="absolute inset-[-8px] rounded-full border-2 border-danger/30 animate-ping" />
                            )}

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 rounded-lg border border-white/20 whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-10">
                                <p className="text-xs font-bold">{driver.vehicle}</p>
                                <p className="text-[10px] text-slate-400 capitalize">{driver.status}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Incident Marker Example */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-[40%] left-[60%]"
                >
                    <div className="relative">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <MapPin className="text-danger fill-current" size={20} />
                        </div>
                        <div className="absolute inset-[-10px] bg-red-500/10 rounded-full animate-ping" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-red-500/90 rounded text-[10px] font-bold">
                            CRITICAL
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button className="p-2 glass-btn rounded-lg text-white/80 hover:text-white">+</button>
                <button className="p-2 glass-btn rounded-lg text-white/80 hover:text-white">-</button>
            </div>
        </div>
    );
};

export default MapArea;
