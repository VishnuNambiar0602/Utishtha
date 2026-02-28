# Testing Instructions - Hospital & Ambulance Recommendations

## ✅ What Should Work Now

### 1. Distance-Based Hospital Recommendations
When you click "AI ASSISTED DISPATCH", the system will:
- Calculate actual distances from patient location to all hospitals
- Sort hospitals by distance (nearest first)
- Show top 3 nearest hospitals with distances displayed
- Example: "Apollo Hospital Jayanagar - 2.5 km"

### 2. Nearest Ambulance Selection
The system will:
- Calculate distances from patient location to all available ambulances
- Automatically select the nearest available ambulance
- Display the ambulance ID in "Assigned Unit"

## 🧪 Test Scenarios

### Test 1: Basic Hospital Recommendation
1. **Patient Name**: Test Patient
2. **Phone**: 1234567890
3. **Incident**: Has fever and headache
4. **Location**: MG Road, Bangalore
5. **Click**: "Find Location on Map" (should geocode successfully)
6. **Click**: "AI ASSISTED DISPATCH"
7. **Expected Result**:
   - Nearest ambulance shown (e.g., AMB-001)
   - 3 nearest hospitals with distances
   - AI rationale explaining the selection

### Test 2: Different Location
1. **Location**: Whitefield, Bangalore
2. **Click**: "Find Location on Map"
3. **Click**: "AI ASSISTED DISPATCH"
4. **Expected Result**:
   - Different hospitals than Test 1 (because location is different)
   - Hospitals sorted by distance from Whitefield

### Test 3: Various Bangalore Locations
Try these locations to verify geocoding works:
- ✅ "Koramangala, Bangalore"
- ✅ "Indiranagar, Bangalore"
- ✅ "Jayanagar, Bangalore"
- ✅ "HSR Layout, Bangalore"
- ✅ "Electronic City, Bangalore"
- ✅ "Hebbal, Bangalore"
- ✅ "Mysore Road" (your example)

### Test 4: Verify Distance Calculations
1. Create trip at "MG Road, Bangalore" (Lat: ~12.9716, Lng: ~77.5946)
2. Expected nearest hospitals:
   - Apollo Hospital Jayanagar (~3-4 km)
   - BGS Gleneagles Global Hospital (~2-3 km)
   - St. Johns Medical College Hospital (~4-5 km)

## 🐛 Troubleshooting

### Issue: "Could not find location"
**Causes**:
- Geocoding service rate limit (wait 1-2 seconds and try again)
- Location name too vague (add "Bangalore" to the search)
- Typo in location name

**Solutions**:
1. Add ", Bangalore" to your search (e.g., "Mysore Road, Bangalore")
2. Try alternative names (e.g., "Mysuru Road" instead of "Mysore Road")
3. Use landmarks (e.g., "Kempegowda Bus Station, Bangalore")
4. Wait a few seconds between searches (rate limiting)

### Issue: Hospitals not showing distances
**Check**:
1. Open browser console (F12)
2. Look for errors in the console
3. Verify the AI recommendation response includes distance field

**Expected console output**:
```javascript
{
  nearestAmbulanceId: "AMB-001",
  hospitals: [
    { name: "Apollo Hospital", location: {...}, distance: "2.5 km" },
    { name: "Fortis Hospital", location: {...}, distance: "3.1 km" },
    { name: "Manipal Hospital", location: {...}, distance: "4.2 km" }
  ],
  rationale: "Ambulance AMB-001 is the nearest..."
}
```

### Issue: Same hospitals recommended for all locations
**This means the distance calculation isn't working**:
1. Check browser console for JavaScript errors
2. Verify `utils/distance.ts` is imported correctly
3. Restart the dev server: `npm run dev`

## 📊 Expected Behavior

### Before (Old System)
- ❌ Always showed first 3 hospitals from list
- ❌ No distance information
- ❌ Same hospitals regardless of location
- ❌ No actual distance calculations

### After (New System)
- ✅ Shows 3 nearest hospitals based on actual distance
- ✅ Displays distances (e.g., "2.5 km" or "850 m")
- ✅ Different hospitals for different locations
- ✅ Haversine formula for accurate distance calculation
- ✅ Nearest ambulance automatically selected

## 🎯 Success Criteria

The system is working correctly if:

1. **Different locations show different hospitals**
   - MG Road should show different hospitals than Whitefield
   - Hospitals should be sorted by distance

2. **Distances are displayed**
   - Each hospital should show distance (e.g., "2.5 km")
   - Distances should make sense geographically

3. **Nearest ambulance is selected**
   - The ambulance closest to patient location is chosen
   - Different locations may select different ambulances

4. **Geocoding works for most locations**
   - Common Bangalore locations should geocode successfully
   - If one name doesn't work, try adding "Bangalore" or use alternative spelling

## 🔍 How to Verify Distance Calculations

### Manual Verification
1. Note the patient coordinates after geocoding (shown in UI)
2. Check the recommended hospitals
3. Use Google Maps to verify distances:
   - Search: "Distance from [patient location] to [hospital name]"
   - Compare with displayed distance (should be similar)

### Example Verification
**Patient Location**: MG Road, Bangalore (12.9716, 77.5946)

**Expected Nearest Hospitals**:
1. BGS Gleneagles Global Hospital (12.9924, 77.5625) - ~2.5 km
2. Apollo Hospital Jayanagar (12.9250, 77.5937) - ~5.2 km
3. St. Johns Medical College Hospital (12.9310, 77.6173) - ~7.5 km

**How to Check**:
- Open Google Maps
- Search "MG Road Bangalore to BGS Gleneagles Hospital"
- Verify distance matches approximately

## 📝 Notes

- **Geocoding Rate Limits**: Nominatim (OpenStreetMap) has rate limits. Wait 1-2 seconds between searches.
- **Distance Accuracy**: Haversine formula calculates "as the crow flies" distance, not road distance.
- **Hospital List**: Currently using 10 hospitals in Bangalore. Can be expanded in `constants.ts`.
- **Ambulance Locations**: Using 6 ambulances at various Bangalore locations.

## 🚀 Next Steps After Verification

Once you confirm the distance-based recommendations are working:

1. **Test Medical Report Generation**:
   - Start GRASP2026 backend
   - Create trip with medical symptoms
   - Click "Generate Medical Report"
   - Download and view PDF

2. **Add More Hospitals**:
   - Edit `Utishtha/MATS/constants.ts`
   - Add more hospital entries with coordinates

3. **Improve Geocoding**:
   - Consider using Google Maps Geocoding API (requires API key)
   - Add caching for frequently searched locations

## ❓ Questions to Answer

After testing, please verify:

- [ ] Do different locations show different hospitals?
- [ ] Are distances displayed for each hospital?
- [ ] Is the nearest ambulance automatically selected?
- [ ] Does geocoding work for common Bangalore locations?
- [ ] Do the distances make sense geographically?

If any of these are "No", check the troubleshooting section above!
