import React from 'react';
import { mockRequests } from '../../lib/mockData';
import { Siren, Clock, ChevronRight } from 'lucide-react';

const ActiveRequests = () => {
    return (
        <div className="w-96 glass-panel rounded-2xl p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Siren className="text-danger" size={20} />
                    Active Alerts
                </h3>
                <span className="bg-danger/20 text-danger text-xs font-bold px-2 py-1 rounded-full">
                    {mockRequests.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {mockRequests.map((req) => (
                    <div
                        key={req.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group
                            ${req.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' :
                                req.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20' :
                                    'bg-white/5 border-white/10 hover:bg-white/10'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm">{req.type}</span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border
                                ${req.severity === 'critical' ? 'text-red-400 border-red-400/30' :
                                    req.severity === 'high' ? 'text-orange-400 border-orange-400/30' : 'text-blue-400 border-blue-400/30'}
                            `}>
                                {req.severity}
                            </span>
                        </div>

                        <p className="text-xs text-slate-300 mb-3">{req.location}</p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={12} />
                                <span>{req.time}</span>
                            </div>
                            <button className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                Assign <ChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveRequests;
