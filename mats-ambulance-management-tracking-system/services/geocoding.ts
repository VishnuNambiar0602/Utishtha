import { Location } from '../types';

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
    // Add "Bangalore, Karnataka, India" to improve accuracy if not already included
    const searchQuery = address.toLowerCase().includes('bangalore') || address.toLowerCase().includes('karnataka') 
      ? address 
      : `${address}, Bangalore, Karnataka, India`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MATS-Ambulance-System/1.0' // Required by Nominatim
      }
    });

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const results: GeocodingResult[] = await response.json();

    if (results.length === 0) {
      console.warn('No geocoding results found for:', address);
      return null;
    }

    const result = results[0];
    return {
      location: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      formattedAddress: result.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
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
