import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import DriverIdleStep from './driver/DriverIdleStep';
import JobOfferModal from './driver/JobOfferModal';
import NavigationStep from './driver/NavigationStep';

const DRIVER_STATES = {
    IDLE: 'IDLE',
    JOB_OFFER: 'JOB_OFFER',
    NAVIGATING: 'NAVIGATING',
};

const DriverApp = () => {
    const [status, setStatus] = useState(DRIVER_STATES.IDLE);

    // Simulation simulation: Automatically trigger a job offer after 3 seconds of idle
    useEffect(() => {
        let timeout;
        if (status === DRIVER_STATES.IDLE) {
            timeout = setTimeout(() => {
                setStatus(DRIVER_STATES.JOB_OFFER);
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [status]);

    const handleAcceptJob = () => {
        setStatus(DRIVER_STATES.NAVIGATING);
    };

    const handleDeclineJob = () => {
        setStatus(DRIVER_STATES.IDLE);
    };

    return (
        <div className="h-full w-full bg-slate-950 text-white font-sans relative">
            <AnimatePresence mode="wait">
                {status === DRIVER_STATES.IDLE && (
                    <DriverIdleStep key="idle" />
                )}

                {status === DRIVER_STATES.NAVIGATING && (
                    <NavigationStep key="nav" />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {status === DRIVER_STATES.JOB_OFFER && (
                    <JobOfferModal
                        key="modal"
                        onAccept={handleAcceptJob}
                        onDecline={handleDeclineJob}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverApp;
