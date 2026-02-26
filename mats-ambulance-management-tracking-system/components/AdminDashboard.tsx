
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getDispatchRecommendation } from '../services/geminiService';
import { Ambulance, Trip, TripStatus, Hospital, DispatchRecommendation, AmbulanceStatus, EmergencyCallAnalysis } from '../types';
import { HOSPITALS } from '../constants';
import MapView from './MapView';
import EmergencyCallIntake from './EmergencyCallIntake';

type ViewMode = 'dispatch' | 'call-analyzer';

const AdminDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dispatch');
  const [ambulances, setAmbulances] = useState<Ambulance[]>(api.getAmbulances());
  const [trips, setTrips] = useState<Trip[]>(api.getTrips());
  const [isDispatching, setIsDispatching] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [manualAmbulanceId, setManualAmbulanceId] = useState<string | null>(null);
  
  // New Trip Form State
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    incident_desc: '',
    lat: 34.05,
    lng: -118.25
  });

  const [aiRec, setAiRec] = useState<DispatchRecommendation | null>(null);

  useEffect(() => {
    api.refresh?.();
    const unsub = api.subscribe((event) => {
      if (event.type === 'AMBULANCE_UPDATES') setAmbulances([...event.data]);
      if (event.type === 'TRIP_UPDATED' || event.type === 'TRIP_CREATED') setTrips(api.getTrips());
    });
    const refreshId = window.setInterval(() => {
      api.refresh?.();
      setAmbulances(api.getAmbulances());
      setTrips(api.getTrips());
    }, 5000);
    return () => {
      unsub();
      window.clearInterval(refreshId);
    };
  }, []);

  const handleRequestDispatch = async () => {
    setLoadingAI(true);
    setManualAmbulanceId(null);
    try {
      const rec = await getDispatchRecommendation(
        { lat: formData.lat, lng: formData.lng },
        ambulances,
        HOSPITALS,
        formData.incident_desc
      );
      setAiRec(rec);
    } catch (err) {
      alert("AI Service unavailable. Using distance-based fallback.");
    } finally {
      setLoadingAI(false);
    }
  };

  const confirmDispatch = async (hospital: Hospital) => {
    const ambulanceId = aiRec?.nearestAmbulanceId || manualAmbulanceId;
    if (!ambulanceId) return;

    try {
      const trip = await api.requestTrip({
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone,
        pickup_location: { lat: formData.lat, lng: formData.lng },
        hospital_name: hospital.name,
        hospital_location: hospital.location,
        priority: 'high'
      });
      
      await api.assignAmbulance(trip.id, ambulanceId);
    } catch (err) {
      console.error(err);
      alert('Failed to dispatch ambulance. Check your database connection.');
      return;
    }

    // Reset state
    setIsDispatching(false);
    setAiRec(null);
    setManualAmbulanceId(null);
    setFormData({ patient_name: '', patient_phone: '', incident_desc: '', lat: 34.05, lng: -118.25 });
  };

  const availableAmbulances = ambulances.filter(a => a.status === AmbulanceStatus.AVAILABLE);

  const handleCallAnalysisComplete = (analysis: EmergencyCallAnalysis) => {
    // Auto-populate form from AI analysis
    setFormData({
      patient_name: analysis.patient.name || '',
      patient_phone: '', // Phone number can be added to UI if needed
      incident_desc: analysis.emergency.description || '',
      lat: formData.lat, // Keep current location (could be geocoded from address in future)
      lng: formData.lng
    });
    
    // Switch to dispatch view and open the dispatch modal
    setViewMode('dispatch');
    setIsDispatching(true);
    
    // Auto-trigger AI recommendation for HIGH priority cases
    // Autonomous dispatch authorization is indicated in the analysis but still requires human confirmation in UI
    if (analysis.triage.priority === 'HIGH' || analysis.automation_decision.auto_dispatch_allowed) {
      setTimeout(() => handleRequestDispatch(), 500);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-tower-broadcast text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 uppercase">MATS OS</h1>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Admin Portal</p>
              </div>
            </div>
            
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('dispatch')}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                  viewMode === 'dispatch'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className="fa-solid fa-map-location-dot mr-2"></i>
                Dispatch Center
              </button>
              <button
                onClick={() => setViewMode('call-analyzer')}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                  viewMode === 'call-analyzer'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className="fa-solid fa-phone-volume mr-2"></i>
                AI Call Analyzer
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'call-analyzer' ? (
        <div className="w-full mt-16 overflow-y-auto">
          <EmergencyCallIntake onAnalysisComplete={handleCallAnalysisComplete} />
        </div>
      ) : (
        <>
      {/* Sidebar - Requests and Active Trips */}
      <div className="w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-xl mt-16">
        <div className="p-6 border-b bg-rose-600 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">MATS Dispatch</h1>
            <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">HQ Operational Command</p>
          </div>
          <button 
            onClick={() => setIsDispatching(true)}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-bold border border-white/40 transition-colors"
          >
            NEW CALL
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase">Live Active Trips</h2>
          {trips.filter(t => t.status !== TripStatus.COMPLETED).length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <i className="fa-solid fa-tower-broadcast text-3xl mb-2 opacity-20"></i>
              <p className="text-sm">No active dispatches</p>
            </div>
          )}
          {trips.filter(t => t.status !== TripStatus.COMPLETED).map(trip => (
            <div key={trip.id} className="border border-slate-100 rounded-lg p-3 shadow-sm bg-slate-50 hover:border-rose-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono bg-slate-200 px-1.5 py-0.5 rounded">{trip.id}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  trip.status === TripStatus.REQUESTED ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {trip.status}
                </span>
              </div>
              <p className="font-bold text-sm">{trip.patient_name}</p>
              <p className="text-xs text-slate-500 mb-2">Dest: {trip.hospital_name}</p>
              {trip.ambulance_id && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold border-t pt-2 border-slate-200 mt-2">
                  <i className="fa-solid fa-truck-medical"></i>
                  <span>Assigned: {trip.ambulance_id}</span>
                </div>
              )}
            </div>
          ))}

          <h2 className="text-xs font-bold text-slate-400 uppercase pt-4">Fleet Status</h2>
          <div className="grid grid-cols-2 gap-2">
            {ambulances.map(amb => (
              <div key={amb.id} className="p-2 border rounded bg-slate-50 text-[10px] flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  amb.status === 'available' ? 'bg-emerald-500' : amb.status === 'offline' ? 'bg-slate-400' : 'bg-amber-500'
                }`} />
                <span className="font-bold">{amb.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 p-4">
          <MapView 
            ambulances={ambulances} 
            activeTrips={trips.filter(t => t.status !== TripStatus.COMPLETED)} 
          />
        </div>
        
        {/* Bottom Trip Log Table */}
        <div className="h-64 bg-white border-t p-4 overflow-y-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase mb-3">Trip History</h2>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-slate-400">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Patient</th>
                <th className="pb-2 font-medium">Ambulance</th>
                <th className="pb-2 font-medium">Hospital</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id} className="border-b hover:bg-slate-50">
                  <td className="py-2 font-mono">{trip.id}</td>
                  <td className="py-2">{trip.patient_name}</td>
                  <td className="py-2">{trip.ambulance_id || 'N/A'}</td>
                  <td className="py-2">{trip.hospital_name}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      trip.status === TripStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500">{new Date(trip.start_time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal Overlay */}
      {isDispatching && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-rose-50 rounded-t-2xl">
              <h2 className="text-xl font-black text-rose-700">EMERGENCY DISPATCH PANEL</h2>
              <button onClick={() => { setIsDispatching(false); setAiRec(null); setManualAmbulanceId(null); }} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Patient Name</label>
                  <input 
                    className="w-full border rounded-lg px-3 py-2 outline-rose-500"
                    placeholder="John Doe"
                    value={formData.patient_name}
                    onChange={e => setFormData({...formData, patient_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                  <input 
                    className="w-full border rounded-lg px-3 py-2 outline-rose-500"
                    placeholder="+1 (555) 000-0000"
                    value={formData.patient_phone}
                    onChange={e => setFormData({...formData, patient_phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Incident Details</label>
                <textarea 
                  className="w-full border rounded-lg px-3 py-2 outline-rose-500 min-h-[80px]"
                  placeholder="Describe the medical situation..."
                  value={formData.incident_desc}
                  onChange={e => setFormData({...formData, incident_desc: e.target.value})}
                />
              </div>

              {!aiRec && !manualAmbulanceId && (
                <div className="space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <span className="relative bg-white px-4 text-[10px] font-bold text-slate-400 uppercase">Dispatch Options</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={handleRequestDispatch}
                      disabled={loadingAI || !formData.patient_name || !formData.incident_desc}
                      className="bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                      {loadingAI ? (
                        <><i className="fa-solid fa-spinner animate-spin text-xl"></i><span className="text-[10px]">ANALYZING...</span></>
                      ) : (
                        <><i className="fa-solid fa-robot text-xl"></i><span>AI ASSISTED DISPATCH</span></>
                      )}
                    </button>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 text-center">Manual Unit Select</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {availableAmbulances.length > 0 ? (
                          availableAmbulances.map(amb => (
                            <button
                              key={amb.id}
                              onClick={() => setManualAmbulanceId(amb.id)}
                              className="bg-white border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm"
                            >
                              {amb.id}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-2 text-[10px] text-slate-400 text-center py-2">No units available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(aiRec || manualAmbulanceId) && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className={`${aiRec ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
                    <div className={`flex items-center gap-2 font-bold mb-2 ${aiRec ? 'text-emerald-700' : 'text-blue-700'}`}>
                      <i className={`fa-solid ${aiRec ? 'fa-check-circle' : 'fa-hand-pointer'}`}></i>
                      <span>{aiRec ? 'AI RECOMMENDATION' : 'MANUAL SELECTION'}</span>
                    </div>
                    <p className="text-sm text-slate-900 mb-1"><b>Assigned Unit:</b> {aiRec?.nearestAmbulanceId || manualAmbulanceId}</p>
                    {aiRec && <p className="text-xs text-emerald-800 leading-relaxed italic">"{aiRec.rationale}"</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                      <i className="fa-solid fa-hospital"></i> Select Destination Hospital
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {(aiRec?.hospitals || HOSPITALS.slice(0, 3)).map((h, idx) => (
                        <button 
                          key={idx}
                          onClick={() => confirmDispatch(h)}
                          className="flex items-center justify-between p-4 border-2 border-slate-100 bg-slate-50/50 rounded-xl hover:border-rose-400 hover:bg-rose-50 transition-all text-left shadow-sm group"
                        >
                          <div>
                            <p className="font-bold text-sm text-slate-800">{h.name}</p>
                            <p className="text-[10px] text-slate-500">Route Availability: {h.distance || 'Normal Traffic'}</p>
                          </div>
                          <i className="fa-solid fa-ambulance text-slate-200 group-hover:text-rose-400 transition-colors"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-center">
                    <button 
                      onClick={() => { setAiRec(null); setManualAmbulanceId(null); }} 
                      className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-rose-600 transition-colors"
                    >
                      ← Back to unit selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
