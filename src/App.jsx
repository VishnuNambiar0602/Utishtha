import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/layout/LandingPage';
import DriverApp from './components/mobile/DriverApp';
import DispatcherConsole from './components/admin/DispatcherConsole';

function App() {
  const [view, setView] = useState('landing'); // landing, patient, admin

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0"
          >
            <LandingPage onSelect={setView} />
          </motion.div>
        )}

        {view === 'patient' && (
          <motion.div
            key="patient"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute inset-0 overflow-auto"
          >
            <DriverApp />
            <button
              onClick={() => setView('landing')}
              className="fixed top-4 left-4 z-50 text-xs text-slate-500 hover:text-white bg-black/50 px-2 py-1 rounded"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0"
          >
            <DispatcherConsole />
            <button
              onClick={() => setView('landing')}
              className="fixed bottom-4 left-4 z-50 text-xs text-slate-500 hover:text-white bg-black/50 px-2 py-1 rounded"
            >
              ← Exit Console
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
