import React, { useState } from 'react';
import Sidebar from './Sidebar';
import StatsRow from './StatsRow';
import MapArea from './MapArea';
import ActiveRequests from './ActiveRequests';
import ArchitectureModal from '../common/ArchitectureModal';

const DispatcherConsole = () => {
    const [isArchOpen, setIsArchOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen bg-slate-950 overflow-hidden relative">
            {/* Background ambient glow */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-40" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] mix-blend-screen opacity-30" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }}
                />
            </div>

            <div className="relative z-10 flex h-full w-full">
                <Sidebar onSettingsClick={() => setIsArchOpen(true)} />

                <main className="flex-1 p-6 flex flex-col h-full overflow-hidden">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-2 h-8 bg-primary rounded-full inline-block" />
                                Mission Control
                            </h2>
                            <p className="text-slate-400 text-sm pl-4 font-mono tracking-wide opacity-80">BLR-EAST-01 • ONLINE</p>
                        </div>
                        {/* User Profile or Time */}
                        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-sm font-mono text-slate-300">SYSTEM ONLINE</span>
                        </div>
                    </header>

                    <StatsRow />

                    <div className="flex-1 flex gap-6 min-h-0">
                        <MapArea />
                        <ActiveRequests />
                    </div>
                </main>
            </div>

            <ArchitectureModal isOpen={isArchOpen} onClose={() => setIsArchOpen(false)} />
        </div>
    );
};

export default DispatcherConsole;
