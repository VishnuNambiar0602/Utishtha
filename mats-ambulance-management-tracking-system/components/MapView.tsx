
import React from 'react';
import { Ambulance, AmbulanceStatus, Location, Trip } from '../types';

interface MapViewProps {
  ambulances: Ambulance[];
  activeTrips: Trip[];
  onSelectAmbulance?: (id: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ ambulances, activeTrips, onSelectAmbulance }) => {
  // In a production app, we would use window.google.maps
  // For this MVP, we simulate a map canvas with icons positioned by lat/lng relative to a box
  
  const getStatusColor = (status: AmbulanceStatus) => {
    switch (status) {
      case AmbulanceStatus.AVAILABLE: return 'bg-emerald-500';
      case AmbulanceStatus.ENROUTE: return 'bg-amber-500';
      case AmbulanceStatus.HOSPITAL: return 'bg-rose-500';
      case AmbulanceStatus.OFFLINE: return 'bg-slate-400';
    }
  };

  // Simple coordinate projection for mock display
  const project = (loc: Location) => {
    // Basic projection logic mapping LA coords to 0-100%
    const latMin = 34.0, latMax = 34.15;
    const lngMin = -118.5, lngMax = -118.2;
    const x = ((loc.lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = 100 - ((loc.lat - latMin) / (latMax - latMin)) * 100;
    return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) };
  };

  return (
    <div className="relative w-full h-full bg-slate-200 overflow-hidden rounded-xl border-4 border-white shadow-inner">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* City Landmarks Placeholder */}
      <div className="absolute top-1/4 left-1/4 text-slate-400 font-bold uppercase tracking-widest text-xs">Downtown Core</div>
      <div className="absolute bottom-1/4 right-1/4 text-slate-400 font-bold uppercase tracking-widest text-xs">Medical District</div>

      {/* Ambulances */}
      {ambulances.map(amb => {
        const { x, y } = project(amb.location);
        return (
          <div 
            key={amb.id}
            onClick={() => onSelectAmbulance?.(amb.id)}
            className="absolute transition-all duration-1000 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${getStatusColor(amb.status)} hover:scale-125 transition-transform`}>
              <i className="fa-solid fa-ambulance text-white text-[10px]"></i>
            </div>
            <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {amb.id}
            </div>
          </div>
        );
      })}

      {/* Patients/Active Trips */}
      {activeTrips.map(trip => {
        const { x, y } = project(trip.pickup_location);
        return (
          <div 
            key={trip.id}
            className="absolute transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="animate-ping absolute inset-0 w-8 h-8 bg-rose-400 rounded-full opacity-75"></div>
            <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center bg-rose-600">
              <i className="fa-solid fa-user-injured text-white text-[10px]"></i>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-4 right-4 bg-white/80 p-3 rounded-lg shadow-md text-[10px] space-y-1">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Available</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Enroute</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Hospital</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Offline</div>
      </div>
    </div>
  );
};

export default MapView;
