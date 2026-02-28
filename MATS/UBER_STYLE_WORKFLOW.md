# 🚑 MATS - Uber/Ola Style Ambulance System

## Overview
Your MATS system works like Uber/Ola/Rapido for ambulances:
- **Admin** sees everything on the map (like Uber HQ)
- **Driver** gets assigned and picks up patient (like Uber driver)
- **Patient** location is tracked (like Uber passenger)
- **Real-time GPS tracking** for all ambulances

---

## 🎯 Complete Workflow

### 1. **Emergency Call Comes In**
**Admin Portal** (http://localhost:3000/)
1. Admin clicks **"NEW CALL"** button
2. Enters patient details:
   - Patient Name
   - Phone Number
   - Emergency Description
   - Location (or click on map)
3. Clicks **"AI ASSISTED DISPATCH"**

### 2. **System Finds Nearest Ambulance**
- System calculates distance from all available ambulances
- Shows recommended ambulance (closest one)
- Shows recommended hospital based on emergency type
- Admin confirms the dispatch

### 3. **Driver Gets Assignment** (Like Uber Driver Gets Ride Request)
**Vendor Portal** (http://localhost:3000/ → Vendor Login)
- Driver sees **"NEW MISSION"** notification
- Shows patient location on map
- Shows destination hospital
- Driver clicks **"MARK ENROUTE"** (accepts the ride)

### 4. **Real-Time Tracking** (Like Uber Live Tracking)
**Admin Dashboard:**
- Sees ambulance moving on map (updates every 2 seconds)
- Marker changes color:
  - 🟢 GREEN = Available
  - 🟠 ORANGE = En Route to Patient
  - 🔴 RED = At Hospital
- Patient's location shows as pulsing red dot

**Driver Portal:**
- GPS automatically tracks position
- Shows battery level
- Shows current status

### 5. **Driver Picks Up Patient**
When driver reaches patient:
1. Driver clicks **"ARRIVED AT PICKUP"**
2. Status changes to "Transporting to Hospital"
3. Map updates in real-time

### 6. **Driver Drops Off at Hospital**
When reaching hospital:
1. Driver clicks **"DELIVERED TO HOSPITAL"**
2. Trip marked as **COMPLETED**
3. Ambulance becomes **AVAILABLE** again
4. Ready for next emergency

---

## 📱 How Each User Sees the System

### **Admin View** (Like Uber Control Center)
```
┌─────────────────────────────────────────┐
│  MATS Dispatch HQ                       │
├─────────────────────────────────────────┤
│                                         │
│  [MAP OF BANGALORE]                     │
│    🟢 AMB-001 (Available)               │
│    🟠 AMB-002 (En Route)                │
│    🔴 AMB-003 (At Hospital)             │
│    📍 Emergency Location                │
│                                         │
│  Active Trips:                          │
│  - Patient: John Doe                    │
│  - Ambulance: AMB-002                   │
│  - Hospital: Apollo                     │
│                                         │
└─────────────────────────────────────────┘
```

### **Driver View** (Like Uber Driver App)
```
┌─────────────────────────────────────────┐
│  VENDOR UNIT - AMB-001                  │
├─────────────────────────────────────────┤
│                                         │
│  🚨 NEW MISSION                         │
│                                         │
│  📍 Pickup: John Doe                    │
│     Location: MG Road                   │
│     Lat: 12.9716, Lng: 77.5946          │
│                                         │
│  🏥 Destination:                        │
│     Apollo Hospital Jayanagar           │
│                                         │
│  [MARK ENROUTE]                         │
│                                         │
│  GPS: Active 🟢                         │
│  Battery: 85%                           │
└─────────────────────────────────────────┘
```

---

## 🔄 Real-Time Features (Already Working!)

### GPS Tracking
- **Driver Portal**: Automatically sends location every few seconds
- **Admin Dashboard**: Updates map every 2 seconds
- **Accuracy**: GPS coordinates with accuracy in meters
- **Battery Monitoring**: Shows driver's device battery

### Status Updates
- **AVAILABLE** → Ready for assignment
- **ASSIGNED** → Got the call, not started yet
- **ENROUTE** → Going to pick up patient
- **ARRIVED** → At patient location
- **HOSPITAL** → Transporting to hospital
- **COMPLETED** → Dropped off, back to available

### Map Features
- Click ambulance markers to see driver details
- Click patient markers to see emergency details
- Zoom in/out to see different areas
- Pan around Bangalore
- Legend shows status colors

---

## 🚀 Quick Setup to Clear Old Data

### Step 1: Clear Database
1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/btyerxwzgnuxyjxcvtjx/editor
2. Click **SQL Editor** (left menu)
3. Copy and paste this:
   ```sql
   DELETE FROM gps_locations;
   DELETE FROM trips;
   DELETE FROM ambulances;
   ```
4. Click **Run**

### Step 2: Restart Application
1. In your browser, go to http://localhost:3000/
2. Press **Ctrl + Shift + R** (hard refresh)
3. System will automatically create 6 new Bangalore ambulances

### Step 3: Verify
You should now see:
- ✅ Map centered on Bangalore
- ✅ 6 ambulances spread across the city
- ✅ All ambulances in Bangalore area
- ✅ Smooth zoom and pan

---

## 📍 Current Ambulance Locations in Bangalore

1. **AMB-001** - MG Road (City Center)
2. **AMB-002** - Hebbal (North)
3. **AMB-003** - HSR Layout (Southeast)
4. **AMB-004** - Malleswaram (Northwest)
5. **AMB-005** - Koramangala (South-Central)
6. **AMB-006** - Yeshwanthpur (West)

---

## 🏥 Available Hospitals

- Manipal Hospital Whitefield
- Fortis Hospital Bannerghatta
- Apollo Hospital Jayanagar
- Columbia Asia Hebbal
- Narayana Health City
- St. Johns Medical College Hospital
- Sakra World Hospital
- BGS Gleneagles Global Hospital
- Aster CMI Hospital Hebbal
- KIMS Hospital Jayanagar

---

## 🎮 Try It Out!

### Test the Full Workflow:

1. **Admin Portal**: http://localhost:3000/
   - Login as Admin
   - Click "NEW CALL"
   - Enter emergency details
   - Dispatch ambulance

2. **Driver Portal**: Open in new tab or mobile
   - Login as Vendor
   - Select ambulance (AMB-001, AMB-002, etc.)
   - Allow GPS permissions
   - See assigned trip
   - Mark status as you progress

3. **Watch Live**: 
   - Keep admin portal open
   - Watch ambulance move on map as driver's location updates
   - See status changes in real-time

---

## 🆘 Troubleshooting

### Map shows wrong location?
1. Clear database (SQL above)
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear browser cache

### Map won't move?
1. Try scrolling with mouse wheel
2. Make sure you're not clicking on markers
3. Refresh the page

### Ambulances not showing?
1. Check database has data (Supabase dashboard)
2. Check browser console (F12) for errors
3. Make sure dev server is running

---

**Your system is now like Uber for ambulances! 🚑**
Just clear the old database data and refresh to see Bangalore.
