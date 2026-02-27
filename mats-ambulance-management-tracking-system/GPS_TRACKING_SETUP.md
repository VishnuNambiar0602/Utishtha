# GPS Tracking Setup Guide

## 🎯 What's New

Your MATS system now has **real-time GPS tracking** with:
- ✅ Real OpenStreetMap integration (Leaflet)
- ✅ Live GPS tracking from vendor portal
- ✅ Battery level monitoring
- ✅ GPS location history in database
- ✅ Real-time map updates every 2 seconds

## 🗄️ Database Setup

### Step 1: Run the Updated Schema

Go to your Supabase Dashboard:
1. Navigate to: https://supabase.com/dashboard/project/btyerxwzgnuxyjxcvtjx/editor
2. Click on **SQL Editor**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** to execute

This will create the new `gps_locations` table for tracking.

### Step 2: Verify Tables

After running the schema, verify these tables exist:
- `ambulances` - Ambulance info and current location
- `trips` - Emergency trip records
- `gps_locations` - **NEW** - GPS tracking history with accuracy, speed, heading, battery

## 📱 How to Use

### For Admin Dashboard (Your View)

1. Open http://localhost:3000/ and login
2. The map now shows a **real OpenStreetMap**
3. Ambulance positions update automatically every 2 seconds
4. Click on any ambulance marker to see details
5. Red pulsing markers show emergency pickup locations

### For Vendor/Driver Portal (Ambulance Tracking)

1. Open http://localhost:3000/ and select "Vendor Login"
2. When the page loads, it will request GPS permissions - **ALLOW IT**
3. Bottom of screen shows:
   - **GPS Active** (green dot) when tracking
   - **Battery Level** (device battery %)
4. Your location is automatically sent to the server every few seconds
5. Admin dashboard will see your real-time position on the map

## 🌍 Testing GPS Tracking

### Option 1: Test on Your Computer (Simulated)
Most browsers on desktop will use IP-based geolocation (less accurate but works for testing)

### Option 2: Test on Your Mobile Phone (Real GPS)
1. Find your local IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.x.x)

2. Open on your phone: `http://YOUR_IP:3000`
   Example: `http://192.168.1.100:3000`

3. Login to Vendor Portal
4. Allow GPS permissions
5. Walk around - you'll see your position update on the admin map!

### Option 3: Test with Multiple Devices
1. Open Vendor Portal on 2+ phones (AMB-001, AMB-002, etc.)
2. Open Admin Dashboard on your computer
3. See all ambulances moving in real-time on the map!

## 🔧 GPS Configuration

### High Accuracy GPS Settings (Already configured in code)
```typescript
{
  enableHighAccuracy: true,  // Use GPS, not just WiFi
  timeout: 10000,            // 10 second timeout
  maximumAge: 0              // Always get fresh location
}
```

### Data Being Tracked
- **Latitude/Longitude** - Precise GPS coordinates
- **Accuracy** - GPS accuracy in meters
- **Speed** - Movement speed (if available)
- **Heading** - Direction of travel (if available)
- **Battery Level** - Device battery percentage
- **Timestamp** - When the location was recorded

## 🎨 Map Features

### Ambulance Status Colors
- 🟢 **Green** - Available
- 🟠 **Orange** - En Route
- 🔴 **Red** - At Hospital
- ⚪ **Gray** - Offline

### Interactive Features
- Click ambulance markers to see driver info and status
- Click patient markers to see trip details
- Map auto-zooms to show all ambulances and emergencies
- Hover over markers for tooltips

## 🔐 Security Notes

1. **GPS Permissions**: Required for vendor portal to track ambulances
2. **HTTPS**: For production, use HTTPS (GPS works better)
3. **Background Tracking**: Currently only tracks when page is open
4. **Privacy**: All GPS data is stored in your private Supabase database

## 🚀 Next Steps (Optional Future Enhancements)

1. **Background GPS Tracking** - Track even when browser is closed
2. **Route History Playback** - Replay past ambulance routes
3. **Geofencing** - Alert when ambulance enters/exits areas
4. **Speed Monitoring** - Track if ambulances are speeding
5. **Mobile App** - Native iOS/Android app for better GPS
6. **SMS Location Sharing** - Send location via SMS

## ❓ Troubleshooting

### GPS Not Working?
- Check browser permissions (Settings → Privacy → Location)
- Make sure you're on HTTPS or localhost
- Try on mobile phone with real GPS hardware
- Check browser console for errors (F12)

### Map Not Loading?
- Check internet connection (needs to download map tiles)
- Clear browser cache
- Check browser console for errors

### Locations Not Updating?
- Verify Supabase connection in console
- Check that `gps_locations` table exists
- Make sure `.env` file has correct credentials
- Restart the dev server

## 📊 Viewing GPS History

To view all GPS tracking data in Supabase:
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select `gps_locations` table
4. See all tracked positions with timestamps

You can export this data for analysis or create custom reports!

---

**Your GPS tracking is now live! 🎉**

Open the vendor portal on your phone, allow GPS, and watch the admin dashboard update in real-time!
