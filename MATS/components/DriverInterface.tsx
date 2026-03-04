
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { downloadMedicalReport } from '../services/medicalReportService';
import { Ambulance, Trip, TripStatus, AmbulanceStatus } from '../types';
import DriverMapView from './DriverMapView';

const VendorPortal: React.FC = () => {
  const [currentAmbulanceId, setCurrentAmbulanceId] = useState<string>('AMB-001');
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState<boolean>(false);

  useEffect(() => {
    api.refresh?.();
    const sync = () => {
      const all = api.getTrips();
      // Only set allTrips if we're debugging/admin, but we need it for context
      // setAllTrips(all); 
      const amb = api.getAmbulances().find(a => a.id === currentAmbulanceId) || null;
      setAmbulance(amb);
      
      const trip = all.find(t => t.ambulance_id === currentAmbulanceId && t.status !== TripStatus.COMPLETED) || null;
      console.log('🚑 VENDOR SYNC:', { currentAmbulanceId, allTripsCount: all.length, foundTrip: trip?.id, status: trip?.status });
      
      // Crucial: Only update if the object reference or properties actually changed
      setActiveTrip(prev => {
        if (!trip) return null;
        if (!prev || prev.id !== trip.id || prev.status !== trip.status) {
          return trip;
        }
        return prev;
      });
    };

    sync();
    const unsub = api.subscribe((event) => {
      if (event.type === 'AMBULANCE_UPDATES' || event.type === 'TRIP_UPDATED' || event.type === 'TRIP_CREATED') sync();
    });

    const refreshId = window.setInterval(() => {
      api.refresh?.();
      sync();
    }, 5000);
    
    // Enhanced GPS tracking with battery monitoring
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        setGpsActive(true);
        
        // Get battery level if available
        if ('getBattery' in navigator) {
          try {
            const battery = await (navigator as any).getBattery();
            setBatteryLevel(Math.round(battery.level * 100));
          } catch (e) {
            // Battery API not available
          }
        }
        
        // Save GPS location with full details
        await api.saveGPSLocation(currentAmbulanceId, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed || undefined,
          heading: pos.coords.heading || undefined,
          battery_level: batteryLevel
        });
      },
      (err) => {
        console.warn("GPS Access Denied:", err);
        setGpsActive(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      unsub();
      navigator.geolocation.clearWatch(watchId);
      window.clearInterval(refreshId);
    };
  }, [currentAmbulanceId, batteryLevel]);

  const updateStatus = async (status: TripStatus) => {
    if (activeTrip) {
      console.log('Button clicked: updating status to', status);
      try {
        await api.updateTripStatus(activeTrip.id, status);
        console.log('Status updated successfully');
        
        // Immediate local UI feedback to prevent button "stickiness"
        setActiveTrip(prev => prev ? { ...prev, status } : null);
        
        // Refresh API state to ensure everything is synced
        await api.refresh?.();
      } catch (err) {
        console.error('Status update failed:', err);
        alert('Failed to update status. Please check connection.');
      }
    } else {
      console.warn('No active trip to update');
    }
  };

  const handleDownloadReport = async () => {
    if (!activeTrip) return;
    
    setIsDownloadingReport(true);
    try {
      console.log('Vendor downloading report for trip:', activeTrip.id);
      const pdfBlob = await downloadMedicalReport(activeTrip.id, activeTrip);
      
      // Create blob URL and trigger download
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `report-${activeTrip.patient_name}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(`Failed to download report:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingReport(false);
    }
  };

  if (!ambulance) return <div className="p-10 text-center text-white bg-slate-900 min-h-screen">Identifying Unit...</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Header */}
      <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black text-blue-500 tracking-tighter italic">VENDOR UNIT</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Duty: {ambulance.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
          ambulance.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {ambulance.status}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Login as Unit:</label>
          <select 
            value={currentAmbulanceId}
            onChange={(e) => setCurrentAmbulanceId(e.target.value)}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1 text-xs"
          >
            {api.getAmbulances().map(a => (
              <option key={a.id} value={a.id}>{a.id} - {a.driver_name}</option>
            ))}
          </select>
        </div>

        {activeTrip ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Map View - Show after clicking MARK ENROUTE */}
            {showMap && ambulance && activeTrip && (
              <div style={{ height: '400px', width: '100%' }} className="rounded-xl overflow-hidden border-2 border-slate-700">
                <DriverMapView 
                  currentLocation={ambulance.location}
                  pickupLocation={activeTrip.pickup_location}
                  hospitalLocation={activeTrip.hospital_location}
                  pickupAddress={activeTrip.pickup_address}
                  patientCondition={activeTrip.incident_description}
                />
              </div>
            )}

            <div className="bg-slate-800 rounded-2xl p-6 border-l-4 border-rose-500 shadow-2xl">\n              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">New Mission</h2>
                <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-1 rounded uppercase font-black tracking-widest">CRITICAL</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Pickup Location</p>
                    <p className="text-lg font-bold">Patient: {activeTrip.patient_name}</p>
                    <p className="text-sm text-slate-400 font-mono mt-0.5">{activeTrip.pickup_location.lat.toFixed(4)}, {activeTrip.pickup_location.lng.toFixed(4)}</p>
                  </div>
                </div>

                <div className="border-l border-dashed border-slate-600 h-6 ml-1 opacity-50"></div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Destination Facility</p>
                    <p className="text-lg font-bold">{activeTrip.hospital_name}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3">
                {activeTrip.status === TripStatus.ASSIGNED && (
                  <>
                    <button 
                      onClick={() => {
                        setShowMap(true);
                        updateStatus(TripStatus.ENROUTE_TO_PICKUP);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-lg"
                    >
                      🗺️ MARK ENROUTE TO PICKUP
                    </button>
                    {!showMap && (
                      <button 
                        onClick={() => setShowMap(true)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
                      >
                        📍 VIEW DIRECTIONS
                      </button>
                    )}
                  </>
                )}
                {activeTrip.status === TripStatus.ENROUTE_TO_PICKUP && (
                  <>
                    {!showMap && (
                      <button 
                        onClick={() => setShowMap(true)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-95 text-sm mb-3"
                      >
                        📍 SHOW MAP & DIRECTIONS
                      </button>
                    )}
                    <button 
                      onClick={() => updateStatus(TripStatus.ARRIVED_AT_PICKUP)}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-lg"
                    >
                      ARRIVED AT PICKUP
                    </button>
                  </>
                )}
                {activeTrip.status === TripStatus.ARRIVED_AT_PICKUP && (
                  <>
                    <button 
                      onClick={() => updateStatus(TripStatus.COMPLETED)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-lg"
                    >
                      PATIENT PICKED UP & COMPLETE MISSION
                    </button>
                  </>
                )}
                {/* Statuses after PICKED_UP are now skipped to allow 2-click completion: Arrived -> Picked Up/Complete */}
                {(activeTrip.status === TripStatus.PICKED_UP || 
                  activeTrip.status === TripStatus.ENROUTE_TO_HOSPITAL || 
                  activeTrip.status === TripStatus.ARRIVED_AT_HOSPITAL) && (
                  <>
                    <button 
                      onClick={() => updateStatus(TripStatus.COMPLETED)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-lg"
                    >
                      MISSION COMPLETED
                    </button>
                  </>
                )}
              </div>

              {/* Download Report Button - Always available during active trip */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloadingReport}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  {isDownloadingReport ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>DOWNLOADING REPORT...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-download"></i>
                      <span>DOWNLOAD MEDICAL REPORT</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Protocol Instructions</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Maintain constant contact with Dispatch Control.</li>
                <li>• Enable priority lights for transit to destination.</li>
                <li>• Confirm patient vitals upon arrival at facility.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin mb-6"></div>
            <h2 className="text-xl font-bold uppercase italic">Scanning for Dispatch</h2>
            <p className="text-sm text-slate-500 mt-2 px-10">Unit {ambulance.id} is currently online and ready for emergency tasking.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/80 border-t border-slate-700 backdrop-blur-md">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            {gpsActive ? (
              <>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                GPS Active
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                GPS Inactive
              </>
            )}
          </span>
          <span>Battery: {batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
};

export default VendorPortal;
