
import { GoogleGenAI, Type } from "@google/genai";
import { Ambulance, Hospital, Location, DispatchRecommendation } from "../types";

export const getDispatchRecommendation = async (
  patientLocation: Location,
  ambulances: Ambulance[],
  hospitals: Hospital[],
  incidentDescription: string
): Promise<DispatchRecommendation> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const prompt = `
    Emergency incident: ${incidentDescription}
    Patient Location: Lat ${patientLocation.lat}, Lng ${patientLocation.lng}
    
    Available Ambulances:
    ${ambulances.filter(a => a.status === 'available').map(a => `- ID: ${a.id}, Driver: ${a.driver_name}, Pos: ${a.location.lat}, ${a.location.lng}`).join('\n')}
    
    Hospitals:
    ${hospitals.map(h => `- ${h.name}, Pos: ${h.location.lat}, ${h.location.lng}`).join('\n')}
    
    Task: Suggest the nearest available ambulance ID and top 3 nearest hospitals. 
    Explain why based on estimated proximity (Haversine distance logic).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nearestAmbulanceId: { type: Type.STRING },
          hospitals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                location: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                },
                distance: { type: Type.STRING }
              }
            }
          },
          rationale: { type: Type.STRING }
        },
        required: ["nearestAmbulanceId", "hospitals", "rationale"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as DispatchRecommendation;
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    // Fallback logic
    const available = ambulances.filter(a => a.status === 'available');
    return {
      nearestAmbulanceId: available[0]?.id || '',
      hospitals: hospitals.slice(0, 3),
      rationale: "Automated selection based on availability."
    };
  }
};
