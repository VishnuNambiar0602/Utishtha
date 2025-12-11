import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Ambulance } from 'lucide-react';

const LandingPage = ({ onSelect }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-white bg-clip-text text-transparent mb-4">
                        UTISHTA
                    </h1>
                    <p className="text-slate-400 text-lg tracking-wide uppercase">Emergency Response Platform</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Ambulance Driver App Option */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect('patient')}
                        className="group relative h-80 rounded-3xl glass-card flex flex-col items-center justify-center p-8 transition-all hover:border-primary/50 hover:bg-white/10"
                    >
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-primary/25 group-hover:shadow-primary/50 transition-all">
                            <Ambulance size={48} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2 text-white group-hover:text-primary transition-colors">
                            Ambulance Driver
                        </h3>
                        <p className="text-slate-400 text-sm">Driver Application Simulation</p>
                    </motion.button>

                    {/* Admin Console Option */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect('admin')}
                        className="group relative h-80 rounded-3xl glass-card flex flex-col items-center justify-center p-8 transition-all hover:border-accent/50 hover:bg-white/10"
                    >
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-accent flex items-center justify-center mb-6 shadow-lg shadow-accent/25 group-hover:shadow-accent/50 transition-all">
                            <Monitor size={48} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2 text-white group-hover:text-accent transition-colors">
                            Dispatch Console
                        </h3>
                        <p className="text-slate-400 text-sm">Admin Dashboard Interface</p>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
