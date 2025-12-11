import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Database, Smartphone, Globe } from 'lucide-react';

const ArchitectureModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-white/20 p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            System Architecture
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 relative py-10">
                            {/* Horizontal connection line for desktop */}
                            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-purple-500/30 -z-10 transform -translate-y-1/2" />

                            {/* Frontend */}
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                    <Smartphone size={40} className="text-blue-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">Client Apps</h3>
                                    <p className="text-xs text-slate-400">React + Vite</p>
                                    <p className="text-xs text-slate-400">Tailwind CSS</p>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-mono uppercase">Socket.io</span>
                                <div className="w-16 h-0.5 bg-slate-600 md:hidden" /> {/* Vertical spacer for mobile */}
                                <div className="hidden md:flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-[bounce_1s_infinite]" />
                                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-[bounce_1s_infinite_0.2s]" />
                                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-[bounce_1s_infinite_0.4s]" />
                                </div>
                            </div>

                            {/* Backend */}
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="w-24 h-24 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                    <Server size={40} className="text-green-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">Backend API</h3>
                                    <p className="text-xs text-slate-400">FastAPI (Python)</p>
                                    <p className="text-xs text-slate-400">Uvicorn Server</p>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-mono uppercase">Async</span>
                                <div className="w-16 h-0.5 bg-slate-600 md:hidden" />
                                <div className="hidden md:flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-[bounce_1s_infinite]" />
                                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-[bounce_1s_infinite_0.2s]" />
                                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-[bounce_1s_infinite_0.4s]" />
                                </div>
                            </div>

                            {/* DB */}
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="w-24 h-24 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                    <Database size={40} className="text-purple-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">Database</h3>
                                    <p className="text-xs text-slate-400">PostgreSQL</p>
                                    <p className="text-xs text-slate-400">Redis Cache</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                            <p className="text-sm text-slate-400">
                                <span className="text-primary font-bold">Real-time bi-directional communication</span> enabled via WebSockets interactions between Patient App clients and the Dispatcher Console, orchestrated by the FastAPI backend.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ArchitectureModal;
