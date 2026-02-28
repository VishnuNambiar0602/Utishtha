
import { GoogleGenAI, Type } from "@google/genai";
import { Ambulance, Hospital, Location, DispatchRecommendation } from "../types";
import { calculateDistance, formatDistance } from "../utils/distance";

export const getDispatchRecommendation = async (
  patientLocation: Location,
  ambulances: Ambulance[],
  hospitals: Hospital[],
  incidentDescription: string
): Promise<DispatchRecommendation> => {
  // Calculate distances for all available ambulances
  const availableAmbulances = ambulances.filter(a => a.status === 'available');
  const ambulancesWithDistance = availableAmbulances.map(ambulance => ({
    ...ambulance,
    distance: calculateDistance(patientLocation, ambulance.location)
  }));
  
  // Sort by distance and get the nearest
  ambulancesWithDistance.sort((a, b) => a.distance - b.distance);
  const nearestAmbulance = ambulancesWithDistance[0];
  
  // Calculate distances for all hospitals
  const hospitalsWithDistance = hospitals.map(hospital => ({
    ...hospital,
    distance: calculateDistance(patientLocation, hospital.location),
    distanceKm: calculateDistance(patientLocation, hospital.location)
  }));
  
  // Sort by distance and get top 3 nearest
  hospitalsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  const nearestHospitals = hospitalsWithDistance.slice(0, 3).map(h => ({
    name: h.name,
    location: h.location,
    distance: formatDistance(h.distanceKm)
  }));
  
  // Generate AI rationale for the recommendations
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const prompt = `
    Emergency incident: ${incidentDescription}
    Patient Location: Lat ${patientLocation.lat}, Lng ${patientLocation.lng}
    
    Nearest Ambulance: ${nearestAmbulance.id} (${nearestAmbulance.driver_name}) - ${formatDistance(nearestAmbulance.distance)} away
    
    Top 3 Nearest Hospitals:
    ${nearestHospitals.map((h, i) => `${i + 1}. ${h.name} - ${h.distance} away`).join('\n')}
    
    Task: Provide a brief rationale (2-3 sentences) explaining why this ambulance and these hospitals are recommended based on proximity and the nature of the emergency.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rationale: { type: Type.STRING }
          },
          required: ["rationale"]
        }
      }
    });
    
    const aiResponse = JSON.parse(response.text);
    
    return {
      nearestAmbulanceId: nearestAmbulance.id,
      hospitals: nearestHospitals,
      rationale: aiResponse.rationale
    };
  } catch (e) {
    console.error("Failed to get AI rationale:", e);
    
    // Return recommendations with fallback rationale
    return {
      nearestAmbulanceId: nearestAmbulance.id,
      hospitals: nearestHospitals,
      rationale: `Ambulance ${nearestAmbulance.id} is the nearest available unit at ${formatDistance(nearestAmbulance.distance)}. The recommended hospitals are the three closest facilities to the patient's location.`
    };
  }
};
