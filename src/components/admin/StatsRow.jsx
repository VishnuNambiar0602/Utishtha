import React from 'react';
import { Activity, Clock, Car, AlertTriangle } from 'lucide-react';
import { mockStats } from '../../lib/mockData';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-t border-white/10">
        <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${color} opacity-5 group-hover:opacity-20 transition-opacity blur-2xl`} />

        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white border border-white/5`}>
                <Icon size={24} className="opacity-90" />
            </div>
            {/* Mock Sparkline */}
            <div className="flex gap-1 items-end h-8 opacity-30">
                {[40, 70, 45, 90, 60, 75, 50].map((h, i) => (
                    <div key={i} className={`w-1 rounded-t-sm ${color}`} style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>

        <h3 className="text-4xl font-bold text-white mb-1 font-mono tracking-tighter">{value}</h3>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider opacity-70">{title}</p>
    </div>
);

const StatsRow = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
                title="Active Trips"
                value={mockStats.activeTrips}
                icon={Activity}
                color="bg-primary"
            />
            <StatCard
                title="Avg Response Time"
                value={mockStats.avgResponse}
                icon={Clock}
                color="bg-accent"
            />
            <StatCard
                title="Fleet Availability"
                value={`${mockStats.available}/${mockStats.totalFleet}`}
                icon={Car}
                color="bg-success"
            />
            <StatCard
                title="Critical Alerts"
                value={mockStats.criticalAlerts}
                icon={AlertTriangle}
                color="bg-danger"
            />
        </div>
    );
};

export default StatsRow;
