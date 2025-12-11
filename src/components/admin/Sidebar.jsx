import React from 'react';
import { LayoutDashboard, Radio, Car, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ onSettingsClick }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
        { icon: Radio, label: 'Dispatch', active: false },
        { icon: Car, label: 'Fleet', active: false },
        { icon: Users, label: 'Drivers', active: false },
        { icon: Settings, label: 'Settings', active: false, action: onSettingsClick },
    ];

    return (
        <div className="w-20 lg:w-64 h-full glass-panel border-r border-white/10 flex flex-col justify-between py-6">
            <div className="px-4 mb-8 text-center lg:text-left">
                <h1 className="hidden lg:block text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">UER</h1>
                <h1 className="lg:hidden text-xl font-bold text-primary">UER</h1>
            </div>

            <nav className="flex-1 space-y-2 px-2">
                {navItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={item.action}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active
                                ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(58,141,255,0.3)]'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={22} />
                        <span className="hidden lg:block font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="px-2">
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-colors">
                    <LogOut size={22} />
                    <span className="hidden lg:block font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
