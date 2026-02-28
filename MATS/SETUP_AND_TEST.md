# Medical Report Integration - Setup and Testing Guide

This guide will help you set up and test the medical report integration feature.

## Prerequisites

1. **Supabase Project**: You need access to your Supabase project
2. **GRASP2026 Backend**: The GRASP2026 Flask backend should be running
3. **Node.js and npm**: Installed on your system

## Step 1: Install Dependencies

```bash
cd Utishtha/MATS
npm install html2pdf.js react-dom
```

## Step 2: Set Up Supabase Database

### 2.1 Create Medical Reports Table

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/create-medical-reports-table.sql`
4. Click **Run** to execute the SQL script

This will create:
- `medical_reports` table with all required columns
- Indexes for efficient querying
- Row level security policies
- Foreign key constraints

### 2.2 Create Storage Bucket

1. In the same SQL Editor
2. Copy and paste the contents of `supabase/create-medical-reports-storage.sql`
3. Click **Run** to execute the SQL script

This will create:
- `medical-reports` storage bucket
- Public access policies for downloads
- Anonymous upload/update/delete policies

### 2.3 Verify Setup

Run these verification queries in the SQL Editor:

```sql
-- Check table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'medical_reports';

-- Check storage bucket exists
SELECT * FROM storage.buckets 
WHERE id = 'medical-reports';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'medical_reports';
```

## Step 3: Configure Environment Variables

Ensure your `.env` file has the following variables:

```env
# Existing variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_KEY=your_gemini_api_key

# New variable for GRASP2026
VITE_GRASP2026_API_URL=http://localhost:5000
```

**Note**: Update `VITE_GRASP2026_API_URL` to point to your GRASP2026 backend URL.

## Step 4: Start GRASP2026 Backend

1. Navigate to your GRASP2026 project directory
2. Start the Flask backend:

```bash
cd GRASP2026/Medical-XAI/backend
python app.py
```

3. Verify it's running by visiting: `http://localhost:5000/health` (or your configured URL)

## Step 5: Start Utishtha Frontend

```bash
cd Utishtha/MATS
npm run dev
```

## Step 6: Test the Medical Report Integration

### Test Case 1: Generate a Medical Report

1. **Open AdminDashboard** in your browser
2. **Create a new trip** with the following details:
   - Patient Name: `Test Patient`
   - Patient Phone: `+91 98765 43210`
   - Incident Description: `Patient has high fever, severe cough, difficulty breathing, and chest pain for 2 days`
   - Location: Enter any address in Bangalore (e.g., "MG Road, Bangalore")
3. **Click "Get AI Recommendation"** to geocode the address and get hospital recommendations
4. **Verify**: You should see the 3 nearest hospitals with actual distances displayed
5. **Click "Dispatch"** to create the trip
6. **Click "Generate Medical Report"** button for the newly created trip
7. **Wait**: You should see a loading spinner with "Generating..." text
8. **Success**: An alert should appear with the report URL
9. **Download**: Click the URL to download and view the PDF report

### Test Case 2: Verify Hospital Distance Calculations

1. **Create trips at different locations** in Bangalore
2. **Check AI recommendations** for each location
3. **Verify**: The recommended hospitals should be different based on the location
4. **Verify**: Distances should be displayed (e.g., "2.5 km" or "850 m")

### Test Case 3: View Generated Reports

1. **Open Supabase Dashboard**
2. **Go to Table Editor** → `medical_reports`
3. **Verify**: You should see records for generated reports
4. **Go to Storage** → `medical-reports` bucket
5. **Verify**: You should see PDF files organized by incident_id

### Test Case 4: Error Handling

Test various error scenarios:

1. **No Symptoms**: Try generating a report with incident description: "Car accident on highway"
   - Expected: Error message "No medical symptoms detected"

2. **GRASP2026 Offline**: Stop the GRASP2026 backend and try generating a report
   - Expected: Error message "Medical diagnosis service is currently unavailable"

3. **Missing Required Fields**: Try generating a report for a trip without incident_description
   - Expected: Validation error

## Expected Results

### Successful Report Generation

A successful report should include:

1. **Patient Information Section**
   - Patient name
   - Contact information
   - Incident date and location
   - Symptom duration

2. **Top Diagnosis**
   - Disease name
   - Confidence score (percentage)
   - Explanation

3. **XAI Scoring Breakdown**
   - How the diagnosis was determined
   - Symptom match information
   - Coverage percentage

4. **Recognized Symptoms**
   - List of matched symptoms

5. **Most Important Symptoms**
   - Feature importance visualization
   - High/Medium/Low impact indicators

6. **Top 5 Diagnoses Table**
   - Disease names
   - Recommended specialists
   - Confidence scores

7. **Differential Diagnosis** (if applicable)
   - Score comparison
   - Shared symptoms
   - Distinguishing symptoms

8. **Medical Disclaimer**

### Hospital Recommendations

When you enter a location and click "Get AI Recommendation", you should see:

1. **Nearest Ambulance**: The closest available ambulance with distance
2. **Top 3 Hospitals**: The three nearest hospitals with actual distances
3. **Rationale**: AI-generated explanation for the recommendations

Example output:
```
Nearest Ambulance: AMB-001 (2.3 km away)

Recommended Hospitals:
1. Apollo Hospital Jayanagar - 1.5 km
2. St. Johns Medical College Hospital - 2.1 km
3. KIMS Hospital Jayanagar - 2.8 km

Rationale: Ambulance AMB-001 is the nearest available unit. The recommended 
hospitals are the three closest facilities specializing in emergency care.
```

## Troubleshooting

### Issue: "GRASP2026 API URL is not configured"

**Solution**: Ensure `VITE_GRASP2026_API_URL` is set in your `.env` file and restart the dev server.

### Issue: "Failed to upload PDF to storage"

**Solution**: 
1. Check that the storage bucket was created successfully
2. Verify storage policies are set correctly
3. Check Supabase project quotas

### Issue: "No medical symptoms detected"

**Solution**: 
1. Ensure the incident description contains actual medical symptoms
2. Try more detailed descriptions (e.g., "fever, cough, headache")
3. Check Gemini AI API key is valid

### Issue: Hospitals are not sorted by distance

**Solution**:
1. Clear browser cache and reload
2. Verify the distance calculation utility is imported correctly
3. Check browser console for any errors

### Issue: PDF generation fails

**Solution**:
1. Ensure `html2pdf.js` is installed: `npm install html2pdf.js`
2. Check browser console for errors
3. Verify ResultsWithSpecialists component renders correctly

## Performance Notes

- **Symptom Extraction**: ~2-3 seconds (Gemini AI)
- **Diagnosis API**: ~3-5 seconds (GRASP2026)
- **PDF Generation**: ~5-10 seconds (html2pdf.js)
- **Total Time**: ~10-18 seconds for complete report generation

## Next Steps After Testing

Once testing is successful:

1. **Deploy GRASP2026 Backend**: Deploy to a production server and update `VITE_GRASP2026_API_URL`
2. **Add More Hospitals**: Expand the `HOSPITALS` array in `constants.ts` with more locations
3. **Implement Optional Features**: 
   - Report regeneration confirmation modal
   - Medical Report column in trip history table
   - Download functionality from UI
   - Report status badges
4. **Add Authentication**: Restrict report generation to authenticated admins only
5. **Add Rate Limiting**: Prevent abuse of the report generation feature

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Check the Supabase logs for database/storage errors
3. Check the GRASP2026 backend logs for API errors
4. Review the implementation in `services/medicalReportService.ts`

## Summary

You've successfully set up:
- ✅ Database schema for medical reports
- ✅ Storage bucket for PDF files
- ✅ Symptom extraction with Gemini AI
- ✅ GRASP2026 diagnosis API integration
- ✅ PDF generation with XAI explanations
- ✅ Distance-based hospital recommendations
- ✅ UI integration in AdminDashboard

The system is ready for testing!
