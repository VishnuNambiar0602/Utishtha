# 🗺️ Map Troubleshooting Guide

## Issue: Map showing gray/blank area

If your map is showing a gray or blank area with just zoom controls, try these steps:

### Step 1: Hard Refresh Browser
1. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
2. Or press **F12** to open DevTools, right-click on the refresh button, select "Empty Cache and Hard Reload"

### Step 2: Check Internet Connection
The map tiles are downloaded from OpenStreetMap servers. Make sure you're connected to the internet.

### Step 3: Check Browser Console for Errors
1. Press **F12** to open Developer Tools
2. Click on the **Console** tab
3. Look for any red error messages related to:
   - `Failed to load resource`
   - `net::ERR_`
   - `Leaflet`
   - `tile.openstreetmap.org`

### Step 4: Check if Leaflet CSS is Loaded
1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for `leaflet.css` in the list - it should show status 200
4. If it shows 404 or fails to load, that's the problem

### Step 5: Try a Different Browser
Sometimes browser extensions or security settings can block map tiles. Try:
- Chrome/Edge (normal mode)
- Chrome/Edge (Incognito mode)
- Firefox
- Safari

### Step 6: Check Firewall/Antivirus
Some firewalls or antivirus software may block connections to:
- `tile.openstreetmap.org`
- `unpkg.com` (CDN for Leaflet)

Add these to your allowlist if needed.

### Step 7: Alternative - Use Different Tile Provider
If OpenStreetMap tiles are blocked, you can try alternative providers:

Edit `components/MapView.tsx` and replace the TileLayer URL:

**Option 1: CartoDB (No signup needed)**
```tsx
<TileLayer
  attribution='&copy; OpenStreetMap contributors &copy; CARTO'
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
/>
```

**Option 2: Esri World Street Map**
```tsx
<TileLayer
  attribution='Tiles &copy; Esri'
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
/>
```

### Step 8: Clear Database and Reset
If the map loads but ambulances don't show:

1. Go to Supabase Dashboard → SQL Editor
2. Run:
```sql
DELETE FROM trips;
DELETE FROM ambulances;
```
3. Refresh your browser - new ambulances with Indian locations will be created

### Still Not Working?

Check these common issues:

1. **Port 3000 is blocked**: Try changing the port in `vite.config.ts`
2. **Yarn/npm packages corrupted**: Run `npm install` again
3. **Clear node_modules**: Delete `node_modules` folder and run `npm install`
4. **Vite cache**: Delete `.vite` folder in your project

### What You Should See:

When working correctly:
- ✅ Interactive map of India
- ✅ Zoom controls (+/-) in top-left
- ✅ Colored dots for ambulances (green, orange, red, gray)
- ✅ Smooth panning and zooming
- ✅ Street names and city labels
- ✅ Legend in bottom-right corner

### Browser Console Commands:

Open console (F12) and type these to debug:

```javascript
// Check if Leaflet is loaded
console.log(window.L);

// Check if React-Leaflet is working
console.log(document.querySelector('.leaflet-container'));

// Check map dimensions
console.log(document.querySelector('.leaflet-container').offsetHeight);
```

All should return values (not null/undefined).

---

**If none of these work, share:**
1. Screenshot of browser console errors (F12 → Console)
2. Screenshot of Network tab showing leaflet.css request
3. Your operating system and browser version
