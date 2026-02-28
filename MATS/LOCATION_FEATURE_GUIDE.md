# Location & Incident Details Feature

## Overview
This feature allows admins to specify exact patient locations using addresses and displays detailed incident information to drivers with precise map directions.

## Features Added

### 1. **Address Geocoding** 
- Admin can type patient location (address, landmark, or coordinates)
- Click **"Find Location on Map"** button to convert address to GPS coordinates
- Uses OpenStreetMap's free Nominatim geocoding service
- Automatically adds "Bangalore, Karnataka, India" to improve accuracy

### 2. **Incident Details Tracking**
- Admin enters emergency condition/patient status in "Incident Details" field
- Information is stored and displayed to drivers
- Helps drivers prepare appropriate medical equipment

### 3. **Driver Map View Enhancements**
- **Patient Info Card** (top-right): Shows patient name, pinpoint address, and emergency condition
- **Patient Marker Popup**: Click red pulsing marker to see full details
- **Distance & ETA** (top-left): Shows distance to patient and estimated arrival time

## Setup Instructions

### Step 1: Update Database Schema
Run the SQL migration in your Supabase SQL Editor:

```bash
File: supabase/add-location-fields.sql
```

This adds two new columns to the `trips` table:
- `pickup_address` (TEXT): Stores the address entered by admin
- `incident_description` (TEXT): Stores emergency details

### Step 2: Test the Feature

#### As Admin:
1. Open Admin Dashboard: http://localhost:3001/
2. Click **"NEW CALL"** button
3. Fill in patient details:
   - Patient Name: "John Doe"
   - Phone: "+91 98765 43210"
   - **Location Address**: "MG Road, Bangalore" or "Indiranagar, Bangalore"
   - **Incident Details**: "Chest pain, difficulty breathing, conscious"
4. Click **"🔍 Find Location on Map"** 
5. Verify coordinates are updated (shown below the button)
6. Click **"AI ASSISTED DISPATCH"** or select ambulance manually
7. Choose destination hospital
8. Ambulance is dispatched!

#### As Driver:
1. Open Vendor Portal: http://localhost:3001/ (login with vendor credentials)
2. See assigned trip in "ACTIVE MISSION" section
3. Click **"🗺️ MARK ENROUTE & SHOW MAP"**
4. Map displays with:
   - **Your position** (blue ambulance icon)
   - **Patient location** (red pulsing marker)
   - **Hospital destination** (green marker - shown after pickup)
   - **Patient Details Card** showing:
     - Patient name
     - Exact address
     - Emergency condition
   - **Distance & ETA overlay**
5. Click patient marker to see popup with full details
6. Navigate to patient using displayed route

## How Geocoding Works

### Address Examples:
- ✅ "MG Road, Bangalore"
- ✅ "Indiranagar"
- ✅ "Koramangala 5th Block"
- ✅ "Manipal Hospital, Whitefield"
- ✅ "12.9716, 77.5946" (direct coordinates)

### Geocoding Process:
1. User enters address in "Address / Landmark" field
2. System appends "Bangalore, Karnataka, India" if not already included
3. Sends request to Nominatim API: `https://nominatim.openstreetmap.org/search`
4. Receives GPS coordinates (latitude, longitude)
5. Updates form with coordinates
6. Shows confirmation alert with formatted address
7. Patient location is pinned on map

### Rate Limits:
- Nominatim allows max 1 request per second
- No API key required
- Free for non-commercial use

## Data Flow

```
Admin Dashboard Form
  ↓
  1. User enters: "MG Road, Bangalore"
  2. User enters: "Heart attack, chest pain"
  ↓
Geocoding Service
  ↓
  3. Converts address to: {lat: 12.9716, lng: 77.5946}
  ↓
Create Trip in Database
  ↓
  4. Stores:
     - pickup_location: {lat: 12.9716, lng: 77.5946}
     - pickup_address: "MG Road, Bangalore"
     - incident_description: "Heart attack, chest pain"
  ↓
Driver Receives Trip
  ↓
  5. DriverMapView displays:
     - Map centered on patient location
     - Patient Info Card with address & condition
     - Route from ambulance → patient
  ↓
Driver Navigates to Patient
  ↓
  6. Real-time distance and ETA updates
     - Shows exact pinpoint on map
     - Displays incident details for preparation
```

## Database Schema

### Updated `trips` table:
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY,
  ambulance_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  pickup_location JSONB,           -- {lat, lng}
  pickup_address TEXT,              -- NEW: "MG Road, Bangalore"
  incident_description TEXT,        -- NEW: "Heart attack, chest pain"
  hospital_name TEXT,
  hospital_location JSONB,
  status TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  priority TEXT
);
```

## UI Components Modified

### AdminDashboard.tsx
- Added `pickup_address` field to form state
- Added `geocodingLoading` state
- Added `handleGeocodeAddress()` function
- Added location input section with geocode button
- Updated `confirmDispatch()` to pass new fields to API

### DriverMapView.tsx
- Enhanced patient marker popup with address & condition
- Added **Patient Details Card** (top-right overlay)
- Shows pickup address with map pin icon
- Shows incident description with heartbeat icon
- Maintains distance/ETA overlay (top-left)

### services/geocoding.ts (NEW)
- `geocodeAddress()`: Convert text address to GPS coordinates
- `reverseGeocode()`: Convert GPS coordinates to address
- Uses Nominatim API (OpenStreetMap)

### types.ts
- Updated `Trip` interface with optional fields:
  - `pickup_address?: string`
  - `incident_description?: string`

## Troubleshooting

### Geocoding Not Working
- **Check internet connection**: Nominatim requires online access
- **Try simpler address**: Use "Indiranagar, Bangalore" instead of full street address
- **Manual coordinates**: Enter coordinates directly: "12.9716, 77.5946"
- **Check console**: Open browser DevTools → Console for error messages

### Patient Details Not Showing in Driver View
- **Check database**: Verify `pickup_address` and `incident_description` columns exist
- **Run SQL migration**: Execute `supabase/add-location-fields.sql`
- **Clear old data**: Old trips won't have these fields
- **Create new test trip**: Use admin dashboard to create new emergency

### Map Not Loading
- **Clear browser cache**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- **Check network**: Ensure CartoDB tiles can load
- **Verify coordinates**: Must be in Bangalore range (lat: 12-14, lng: 77-78)

## Future Enhancements

### Planned Features:
1. **Google Maps Directions API**: Replace straight-line routes with turn-by-turn navigation
2. **Voice Navigation**: Text-to-speech for driver guidance
3. **Address Autocomplete**: Suggest addresses as user types
4. **Photo Upload**: Attach incident scene photos
5. **Multi-language Support**: Kannada, Hindi translations
6. **Offline Mode**: Cache maps for offline navigation
7. **Traffic Integration**: Real-time traffic-based ETA

### Integration Ideas:
- **WhatsApp Location Sharing**: Accept location pins from callers
- **Phone GPS Auto-fill**: Use caller's phone GPS as pickup location
- **Hospital Bed Availability**: Show available beds at destination
- **Patient Medical History**: Pre-load patient records if available

## API Reference

### Geocoding Service

```typescript
import { geocodeAddress } from '../services/geocoding';

// Geocode an address
const result = await geocodeAddress("MG Road, Bangalore");
console.log(result);
// Output:
// {
//   location: { lat: 12.9716, lng: 77.5946 },
//   formattedAddress: "Mahatma Gandhi Road, Bangalore Urban, Karnataka, 560001, India"
// }

// Handle failure
if (!result) {
  console.error('Location not found');
}
```

### Updated API Call

```typescript
import { api } from '../services/api';

await api.requestTrip({
  patient_name: 'John Doe',
  patient_phone: '+91 98765 43210',
  pickup_location: { lat: 12.9716, lng: 77.5946 },
  pickup_address: 'MG Road, Bangalore',              // NEW
  incident_description: 'Heart attack, chest pain',  // NEW
  hospital_name: 'Manipal Hospital',
  hospital_location: { lat: 12.9698, lng: 77.7499 },
  priority: 'high'
});
```

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Admin can enter address in location field
- [ ] Geocoding button finds coordinates
- [ ] Coordinates display updates after geocoding
- [ ] Incident details save correctly
- [ ] Driver sees patient info card on map
- [ ] Patient marker popup shows address & condition
- [ ] Distance & ETA display correctly
- [ ] Map centers on patient location
- [ ] Route line shows from ambulance to patient

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database schema is updated
3. Test with simple addresses first
4. Review this documentation

---

**Last Updated**: February 2026
**Version**: 2.0.0
