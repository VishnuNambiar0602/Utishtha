import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
    "Finding nearest ambulance...",
    "Checking availability...",
    "Driver Found!"
];

const SearchingStep = ({ onComplete }) => {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex(prev => {
                if (prev < steps.length - 1) return prev + 1;
                clearInterval(interval);
                setTimeout(onComplete, 1000); // Wait a bit after "Driver Found"
                return prev;
            });
        }, 1500);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="h-full flex flex-col items-center justify-center relative">
            {/* Radar Animation */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="w-64 h-64 border-2 border-primary/30 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="w-48 h-48 border-2 border-primary/40 rounded-full absolute animate-[spin_4s_linear_infinite_reverse]" />
                <div className="w-32 h-32 border-2 border-primary/50 rounded-full absolute animate-[pulse_2s_ease-in-out_infinite]" />
            </div>

            <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 mt-40"
            >
                <span className="text-primary font-mono tracking-wide">{steps[stepIndex]}</span>
            </motion.div>
        </div>
    );
};

export default SearchingStep;
