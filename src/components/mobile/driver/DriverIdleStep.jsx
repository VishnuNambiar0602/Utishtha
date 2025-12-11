import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Radio } from 'lucide-react';

const DriverIdleStep = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
                {/* Placeholder Map Background */}
                <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.5946,12.9716,13,0,60/400x800?access_token=pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xhbzR5Z2Z0MDB3NzNvbzhzZ2Z0MDB3NyJ9.Ys-7qF4_6j8_6j8_6j8')] bg-cover bg-center grayscale" />
            </div>

            <div className="z-10 flex flex-col items-center">
                <div className="relative mb-8">
                    <motion.div
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/30 rounded-full"
                    />
                    <div className="w-24 h-24 bg-slate-900/80 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-primary/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <Radio size={40} className="text-primary animate-pulse" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">You are Online</h2>
                <p className="text-slate-400 text-sm bg-slate-900/50 px-4 py-1 rounded-full border border-slate-700">
                    Waiting for requests...
                </p>
            </div>
        </div>
    );
};

export default DriverIdleStep;
