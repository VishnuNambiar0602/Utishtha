import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HomeStep from './HomeStep';
import SearchingStep from './SearchingStep';
import TrackingStep from './TrackingStep';

const PatientApp = () => {
    const [step, setStep] = useState('home'); // home | searching | tracking

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            {/* Mobile Device Frame */}
            <motion.div
                layout
                className="w-full max-w-[380px] h-[800px] bg-slate-100 dark:bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden border-8 border-slate-800 dark:border-slate-800"
            >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-50"></div>

                {/* Status Bar Mock */}
                <div className="absolute top-2 w-full px-6 flex justify-between text-[10px] font-bold text-gray-400 z-40">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <span>5G</span>
                        <span>100%</span>
                    </div>
                </div>

                <div className="w-full h-full relative font-sans text-gray-800 dark:text-white">
                    <AnimatePresence mode='wait'>
                        {step === 'home' && (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
                            >
                                <HomeStep onActivate={() => setStep('searching')} />
                            </motion.div>
                        )}
                        {step === 'searching' && (
                            <motion.div
                                key="searching"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full bg-slate-900 flex items-center justify-center"
                            >
                                <SearchingStep onComplete={() => setStep('tracking')} />
                            </motion.div>
                        )}
                        {step === 'tracking' && (
                            <motion.div
                                key="tracking"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full h-full"
                            >
                                <TrackingStep />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>


                {/* Home Bar */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full z-50" />
            </motion.div>
        </div>
    );
};

export default PatientApp;
