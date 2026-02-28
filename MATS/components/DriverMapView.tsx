import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const driverIcon = L.divIcon({
  className: 'driver-marker',
  html: '<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const pickupIcon = L.divIcon({
  className: 'pickup-marker',
  html: `<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 12px rgba(239,68,68,0.5); animation: pulse 2s infinite;">
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">!</div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const hospitalIcon = L.divIcon({
  className: 'hospital-marker',
  html: '<div style="background: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">H</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Component to fit map bounds (only on initial load)
const MapController = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    // Invalidate size to ensure proper rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Only fit bounds once initially, don't interfere with user zoom
    if (bounds && !hasInitialized) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      setHasInitialized(true);
    }
  }, [bounds, map, hasInitialized]);
  
  return null;
};

interface Location {
  lat: number;
  lng: number;
}

interface DriverMapViewProps {
  currentLocation: Location | null;
  pickupLocation: Location;
  hospitalLocation: Location;
  pickupAddress?: string;
  patientCondition?: string;
}

// Simple distance calculation (Haversine formula)
const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Simple ETA calculation (assuming 30 km/h average speed in city)
const calculateETA = (distance: number): string => {
  const avgSpeed = 30; // km/h
  const hours = distance / avgSpeed;
  const minutes = Math.round(hours * 60);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

const DriverMapView: React.FC<DriverMapViewProps> = ({
  currentLocation,
  pickupLocation,
  hospitalLocation,
  pickupAddress,
  patientCondition
}) => {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<string>("");

  // Calculate route (simple straight line for now)
  useEffect(() => {
    if (currentLocation) {
      const route: [number, number][] = [
        [currentLocation.lat, currentLocation.lng],
        [pickupLocation.lat, pickupLocation.lng],
        [hospitalLocation.lat, hospitalLocation.lng]
      ];
      setRoutePoints(route);
      
      // Calculate total distance
      const dist = calculateDistance(currentLocation, pickupLocation) + 
                   calculateDistance(pickupLocation, hospitalLocation);
      setDistance(dist);
      setEta(calculateETA(dist));
    }
  }, [currentLocation, pickupLocation, hospitalLocation]);

  // Calculate bounds for map
  const bounds: L.LatLngBoundsExpression | null = currentLocation ? [
    [currentLocation.lat, currentLocation.lng],
    [pickupLocation.lat, pickupLocation.lng],
    [hospitalLocation.lat, hospitalLocation.lng]
  ] : null;

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', minHeight: '400px' }}>
      <MapContainer
        center={currentLocation || pickupLocation}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        whenReady={(map) => {
          setTimeout(() => {
            map.target.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />
        
        <MapController bounds={bounds} />
        
        {/* Driver location */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={driverIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        
        {/* Pickup location */}
        <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
          <Popup>
            <strong>Pickup Location</strong><br />
            {pickupAddress || "Emergency Location"}
          </Popup>
        </Marker>
        
        {/* Hospital location */}
        <Marker position={[hospitalLocation.lat, hospitalLocation.lng]} icon={hospitalIcon}>
          <Popup>Hospital Destination</Popup>
        </Marker>
        
        {/* Route polyline */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
      
      {/* Patient Info Card */}
      {patientCondition && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Patient Details</h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Condition:</strong> {patientCondition}
          </p>
          {pickupAddress && (
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Location:</strong> {pickupAddress}
            </p>
          )}
        </div>
      )}
      
      {/* Distance and ETA overlay */}
      {distance > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>
            <strong>Distance:</strong> {distance.toFixed(1)} km
          </div>
          <div style={{ fontSize: '14px' }}>
            <strong>ETA:</strong> {eta}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMapView;
