import { Location } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

/**
 * Geocode an address to coordinates using Nominatim (OpenStreetMap)
 * Free service, no API key required
 */
export async function geocodeAddress(address: string): Promise<{ location: Location; formattedAddress: string } | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    // Try multiple search strategies for better results
    const searchStrategies = [
      address, // Try exact address first
      address.toLowerCase().includes('bangalore') || address.toLowerCase().includes('karnataka') 
        ? address 
        : `${address}, Bangalore, Karnataka, India`, // Add location context
      address.toLowerCase().includes('bangalore') || address.toLowerCase().includes('karnataka')
        ? address
        : `${address}, Bangalore, India`, // Simpler context
      address.toLowerCase().includes('bangalore') || address.toLowerCase().includes('karnataka')
        ? address
        : `${address}, Karnataka, India` // Even simpler - just Karnataka
    ];

    let results: GeocodingResult[] = [];
    
    console.log('Starting geocoding for:', address);
    
    // Try each strategy until we get results
    for (const searchQuery of searchStrategies) {
      console.log('Trying search strategy:', searchQuery);
      
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MATS-Ambulance-System/1.0' // Required by Nominatim
        }
      });

      if (!response.ok) {
        console.error('Geocoding API error:', response.statusText);
        continue; // Try next strategy
      }

      results = await response.json();
      
      if (results.length > 0) {
        console.log('Found results with strategy:', searchQuery);
        break; // Found results, stop trying
      }
      
      // Add small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (results.length === 0) {
      console.warn('Nominatim geocoding failed for all strategies, trying Gemini AI fallback...');
      return await geocodeWithGemini(address);
    }

    const result = results[0];
    console.log('Nominatim geocoding successful:', result);
    
    return {
      location: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      formattedAddress: result.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    // Try Gemini AI as fallback
    return await geocodeWithGemini(address);
  }
}

/**
 * Geocode using Gemini AI as fallback when Nominatim fails
 */
async function geocodeWithGemini(address: string): Promise<{ location: Location; formattedAddress: string } | null> {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    
    if (!apiKey) {
      console.error('VITE_API_KEY is not configured');
      return null;
    }
    
    console.log('Attempting Gemini AI geocoding for:', address);
    
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
You are a geocoding assistant for Bangalore, Karnataka, India.

Address to geocode: "${address}"

Task: Provide the latitude and longitude coordinates for this location in Bangalore.
If the address is not specific enough, use the most well-known location with that name in Bangalore.
If the location is outside Bangalore but in Karnataka, provide coordinates for that location.

Return ONLY the coordinates and formatted address in JSON format.
    `.trim();
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER },
            formatted_address: { type: Type.STRING }
          },
          required: ["latitude", "longitude", "formatted_address"]
        }
      }
    });
    
    const result = JSON.parse(response.text);
    
    console.log('Gemini AI geocoding successful:', result);
    
    // Validate coordinates are reasonable for Bangalore area
    if (result.latitude < 12.0 || result.latitude > 13.5 || 
        result.longitude < 77.0 || result.longitude > 78.0) {
      console.warn('Coordinates outside expected Bangalore range:', result);
    }
    
    return {
      location: {
        lat: result.latitude,
        lng: result.longitude
      },
      formattedAddress: result.formatted_address
    };
  } catch (error) {
    console.error('Gemini AI geocoding failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(location: Location): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MATS-Ambulance-System/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const result: GeocodingResult = await response.json();
    return result.display_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
