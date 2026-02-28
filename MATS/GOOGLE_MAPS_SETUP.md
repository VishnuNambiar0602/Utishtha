# Google Maps Setup Guide

## Get Your Google Maps API Key

The application now uses Google Maps for superior mapping experience with smooth zoom, pan, and location services.

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept Terms of Service if prompted

### Step 2: Create a New Project (if needed)

1. Click the project dropdown in the top bar
2. Click "NEW PROJECT"
3. Enter project name: **"MATS Ambulance System"**
4. Click "CREATE"
5. Wait for project creation (usually 10-30 seconds)
6. Select your new project from the dropdown

### Step 3: Enable Maps JavaScript API

1. Click the **hamburger menu** (☰) in top-left
2. Navigate to **"APIs & Services"** → **"Library"**
3. Search for **"Maps JavaScript API"**
4. Click on it
5. Click the blue **"ENABLE"** button
6. Wait for API to be enabled

### Step 4: Create API Credentials

1. Click **"APIs & Services"** → **"Credentials"** in the left menu
2. Click **"+ CREATE CREDENTIALS"** button at the top
3. Select **"API key"**
4. Your API key will be generated and displayed
5. **IMPORTANT:** Copy the API key immediately

### Step 5: (Optional but Recommended) Restrict Your API Key

For security, restrict your API key:

1. Click **"EDIT API KEY"** (or the pencil icon next to your key)
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check only **"Maps JavaScript API"**
3. Under **"Application restrictions"** (for production):
   - Select **"HTTP referrers (web sites)"**
   - Add your domains:
     - `http://localhost:*`
     - `http://127.0.0.1:*`
     - Your production domain
4. Click **"SAVE"**

### Step 6: Add API Key to Your Project

1. Open your project folder
2. Locate the `.env` file in the root directory
3. Find the line:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```
4. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. **Save the file**

### Step 7: Restart Development Server

**IMPORTANT:** You must restart the server for changes to take effect

1. Stop the current server (Ctrl+C in terminal)
2. Restart with:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3001/
4. The map should now load with Google Maps!

## Billing Information

### Free Tier
Google Maps provides **$200 free credit per month**, which covers:
- **28,000+ map loads per month**
- More than enough for development and small-scale production

### What Counts as Usage?
- Each map load (page view with map)
- Each geocoding request (address → coordinates)
- Each directions request (future feature)

### For Production
If you expect high traffic:
1. Enable billing in Google Cloud Console
2. Set up budget alerts
3. Monitor usage in the console

## Troubleshooting

### Map Not Loading - "Google Maps API Key Required"
**Solution:** Make sure you:
- Added the API key to `.env` file
- Restarted the dev server (`Ctrl+C` then `npm run dev`)
- The key doesn't have quotes around it

### "This API project is not authorized to use this API"
**Solution:** 
- Go back to APIs & Services → Library
- Enable "Maps JavaScript API"
- Wait 1-2 minutes for changes to propagate

### "RefererNotAllowedMapError"
**Solution:**
- Edit your API key restrictions
- Add `http://localhost:*` to HTTP referrers
- Or temporarily remove restrictions for testing

### Map Shows but Says "For development purposes only"
**Solution:** This is normal for:
- Free tier without billing enabled
- Testing/development
- Doesn't affect functionality

To remove:
- Set up billing in Google Cloud Console (still free under $200/month)

## Features with Google Maps

### ✅ What Works Now
- ✨ Smooth zoom in/out (scroll wheel, +/- buttons)
- 🖱️ Drag/pan the map with mouse
- 📍 Click markers to see info
- 🗺️ Street view (person icon drag to map)
- 🌍 Map type toggle (satellite, terrain)
- 📐 Accurate distance calculations
- 🎯 Auto-fit bounds to show all markers

### 🔜 Future Features (Easy to Add)
- Turn-by-turn directions using Directions API
- Real-time traffic data
- Route optimization
- Places search/autocomplete
- Geocoding improvements

## Before vs After

### Before (Leaflet + OSM)
- ❌ Zoom issues (can't zoom properly)
- ❌ Tiles sometimes don't load
- ❌ Basic markers only
- ❌ Limited interactivity
- ✅ Free, no API key needed

### After (Google Maps)
- ✅ Smooth zoom at all levels
- ✅ Reliable map loading
- ✅ Rich info windows
- ✅ Street view available
- ✅ Free tier ($200/month credit)
- ✅ Better address search
- ✅ Production-ready

## Cost Estimation

### Development (This Project)
- **Monthly Usage:** ~1,000 map loads
- **Cost:** $0 (well under free tier)
- **Free tier covers:** 28,000 loads/month

### Production (Live System)
Example: 50 active ambulances, 200 emergency calls/day

- **Map loads:** ~1,500/day = 45,000/month
- **Cost per 1,000:** $7
- **Total cost:** $7 × 45 = **~$315/month**
- **With free credit:** $315 - $200 = **$115/month actual cost**

### Keep Costs Down
1. Cache map instances (already implemented)
2. Use static maps for non-interactive views
3. Implement lazy loading
4. Set daily quotas in console

## API Key Security

### ✅ DO:
- Keep `.env` file in `.gitignore` (already done)
- Use HTTP referrer restrictions
- Set up API quotas
- Monitor usage regularly
- Rotate keys if exposed

### ❌ DON'T:
- Commit `.env` to GitHub
- Share API key publicly
- Use same key for multiple projects
- Skip billing alerts setup

## Support

### Need Help?
1. Check Google Maps Platform [Documentation](https://developers.google.com/maps/documentation)
2. Visit [Google Maps Platform Support](https://developers.google.com/maps/support)
3. Check [StackOverflow](https://stackoverflow.com/questions/tagged/google-maps)

### Common Questions

**Q: Do I need a credit card?**
A: Not for development under free tier. Set up billing when deploying.

**Q: Will I be charged?**
A: No, unless you exceed $200/month usage (28,000+ map loads).

**Q: Can I use a test API key?**
A: Yes! Generate a key and start using immediately.

**Q: How do I check my usage?**
A: Google Cloud Console → APIs & Services → Dashboard

---

**Last Updated:** February 2026  
**Version:** 3.0.0 (Google Maps Migration)
