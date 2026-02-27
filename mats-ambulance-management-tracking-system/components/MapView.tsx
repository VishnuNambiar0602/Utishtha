import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Ambulance, AmbulanceStatus, Trip } from '../types';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined' && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface MapViewProps {
  ambulances: Ambulance[];
  activeTrips: Trip[];
  onSelectAmbulance?: (id: string) => void;
}

// Custom icon creator for ambulances
const createAmbulanceIcon = (status: AmbulanceStatus) => {
  const color = {
    [AmbulanceStatus.AVAILABLE]: '#10b981',
    [AmbulanceStatus.ENROUTE]: '#f59e0b',
    [AmbulanceStatus.HOSPITAL]: '#f43f5e',
    [AmbulanceStatus.OFFLINE]: '#94a3b8',
  }[status];

  return L.divIcon({
    html: `
      <div style="
        width: 36px; 
        height: 36px; 
        background: ${color}; 
        border: 3px solid white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.4);
      ">
        <i class="fa-solid fa-ambulance" style="color: white; font-size: 16px;"></i>
      </div>
    `,
    className: 'ambulance-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Custom icon for patient/pickup locations
const patientIcon = L.divIcon({
  html: `
    <div style="position: relative;">
      <div style="
        width: 36px; 
        height: 36px; 
        background: #f43f5e; 
        border: 3px solid white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.4);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      ">
        <i class="fa-solid fa-user-injured" style="color: white; font-size: 16px;"></i>
      </div>
    </div>
  `,
  className: 'patient-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Component to auto-fit bounds (only on initial load)
const MapBounds: React.FC<{ ambulances: Ambulance[]; activeTrips: Trip[] }> = ({ ambulances, activeTrips }) => {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Only run once when we first have data, don't interfere with user zoom
    if (hasInitialized) return;

    const bangaloreAmbulances = ambulances.filter(
      amb => amb.location.lat > 12 && amb.location.lat < 14 && amb.location.lng > 77 && amb.location.lng < 78
    );
    const bangaloreTrips = activeTrips.filter(
      trip => trip.pickup_location.lat > 12 && trip.pickup_location.lat < 14
    );

    if (bangaloreAmbulances.length === 0 && bangaloreTrips.length === 0) {
      return; // Wait for data
    }

    const bounds = L.latLngBounds([]);
    bangaloreAmbulances.forEach(amb => bounds.extend([amb.location.lat, amb.location.lng]));
    bangaloreTrips.forEach(trip => bounds.extend([trip.pickup_location.lat, trip.pickup_location.lng]));

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      setHasInitialized(true);
    }
  }, [ambulances, activeTrips, map, hasInitialized]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ ambulances, activeTrips, onSelectAmbulance }) => {
  const defaultCenter: [number, number] = [12.9716, 77.5946];



  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border-4 border-white shadow-lg" style={{ minHeight: '500px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '500px', zIndex: 1 }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />

        <MapBounds ambulances={ambulances} activeTrips={activeTrips} />

        {/* Ambulance Markers */}
        {ambulances.map(amb => (
          <Marker
            key={amb.id}
            position={[amb.location.lat, amb.location.lng]}
            icon={createAmbulanceIcon(amb.status)}
            eventHandlers={{
              click: () => onSelectAmbulance?.(amb.id),
            }}
          >
            <Popup>
              <div className="text-sm font-bold">
                <div className="text-blue-600 mb-1">{amb.id}</div>
                <div className="text-xs text-gray-600">Driver: {amb.driver_name}</div>
                <div className="text-xs text-gray-600">Phone: {amb.driver_phone}</div>
                <div className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                  amb.status === AmbulanceStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-700' :
                  amb.status === AmbulanceStatus.ENROUTE ? 'bg-amber-100 text-amber-700' :
                  amb.status === AmbulanceStatus.HOSPITAL ? 'bg-rose-100 text-rose-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {amb.status.toUpperCase()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Patient/Trip Markers */}
        {activeTrips.map(trip => (
          <Marker
            key={trip.id}
            position={[trip.pickup_location.lat, trip.pickup_location.lng]}
            icon={patientIcon}
          >
            <Popup>
              <div className="text-sm font-bold">
                <div className="text-rose-600 mb-1 text-base">🚨 Emergency</div>
                <div className="text-xs text-gray-600">Patient: {trip.patient_name}</div>
                <div className="text-xs text-gray-600">Phone: {trip.patient_phone}</div>
                {trip.pickup_address && (
                  <div className="text-xs bg-blue-50 p-2 rounded mt-2 border border-blue-200">
                    <strong>Address:</strong><br/>
                    {trip.pickup_address}
                  </div>
                )}
                {trip.incident_description && (
                  <div className="text-xs bg-rose-50 p-2 rounded mt-2 border border-rose-300">
                    <strong>Condition:</strong><br/>
                    {trip.incident_description}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">Destination: {trip.hospital_name}</div>
                {trip.ambulance_id && (
                  <div className="text-xs mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded inline-block">
                    Assigned: {trip.ambulance_id}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg z-[1000]">
        <h3 className="text-xs font-black uppercase text-slate-600 mb-3">Live Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>En Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span>At Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <span>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
