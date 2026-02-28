# Medical Reports Database Setup

This guide explains how to set up the database infrastructure for the medical report integration feature.

## Overview

The medical report integration requires:
1. A `medical_reports` table to store report metadata
2. A Supabase Storage bucket to store PDF files
3. Proper indexes and security policies

### Quick Reference

**Storage Bucket:**
- Bucket ID: `medical-reports`
- Public Access: Yes (for downloads)
- Path Structure: `medical-reports/{incident_id}/{filename}`

**Table:**
- Table Name: `medical_reports`
- Foreign Key: `incident_id` → `trips(id)` (CASCADE DELETE)
- Security: Anonymous read/write access

**File Naming:**
- Format: `medical-report-{incident_id}-{timestamp}.pdf`
- Example: `medical-report-123e4567-e89b-12d3-a456-426614174000-1704067200000.pdf`

## Setup Instructions

### Step 1: Create the Medical Reports Table

Run the SQL script to create the `medical_reports` table:

```bash
# In Supabase SQL Editor, run:
Utishtha/MATS/supabase/create-medical-reports-table.sql
```

This will:
- Create the `medical_reports` table with all required columns
- Add a foreign key constraint to the `trips` table
- Create indexes on `incident_id` and `created_at` for efficient querying
- Enable row level security with anonymous access policy
- Add documentation comments to all columns

### Step 2: Create the Storage Bucket

Run the SQL script to create the storage bucket:

```bash
# In Supabase SQL Editor, run:
Utishtha/MATS/supabase/create-medical-reports-storage.sql
```

This will:
- Create a public storage bucket named `medical-reports`
- Set up policies for public read access
- Allow anonymous users to upload, update, and delete files

**Bucket Configuration:**
- **Bucket ID:** `medical-reports`
- **Bucket Name:** `medical-reports`
- **Public Access:** `true` (allows public downloads via URL)
- **Path Structure:** `medical-reports/{incident_id}/{filename}`

**Storage Policies:**
- Public read access for all users (no authentication required for downloads)
- Anonymous upload, update, and delete permissions (matching trips table security model)

### Step 3: Verify the Setup

After running both scripts, verify the setup:

1. **Check the table exists:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'medical_reports';
   ```

2. **Check the indexes:**
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'medical_reports';
   ```

3. **Check the storage bucket:**
   ```sql
   SELECT * FROM storage.buckets 
   WHERE id = 'medical-reports';
   ```
   
   Expected result:
   - `id`: medical-reports
   - `name`: medical-reports
   - `public`: true

4. **Check the storage policies:**
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'storage' AND tablename = 'objects'
   AND policyname LIKE '%medical%';
   ```
   
   Expected policies:
   - Public Access to Medical Reports (SELECT)
   - Allow anon users to upload medical reports (INSERT)
   - Allow anon users to update medical reports (UPDATE)
   - Allow anon users to delete medical reports (DELETE)

5. **Check the table policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'medical_reports';
   ```
   
   Expected policy:
   - Allow anon read/write medical_reports (ALL)

## Table Schema

### medical_reports

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| incident_id | uuid | Foreign key to trips table (cascade delete) |
| patient_name | text | Patient name from incident report |
| diagnosis | text | Primary diagnosis from GRASP2026 |
| confidence_score | numeric(5,2) | Diagnosis confidence (0-100) |
| report_url | text | URL to PDF in Supabase Storage |
| api_response | jsonb | Complete GRASP2026 API response |
| created_by | text | Admin user identifier (optional) |
| created_at | timestamptz | Report generation timestamp |
| updated_at | timestamptz | Last update timestamp (optional) |

### Indexes

- `medical_reports_incident_id_idx` - Fast lookups by incident
- `medical_reports_created_at_idx` - Fast sorting by creation date (descending)

### Foreign Keys

- `incident_id` references `trips(id)` with `ON DELETE CASCADE`
  - When a trip is deleted, all associated medical reports are automatically deleted

## Storage Structure

Medical report PDFs are stored in the following structure:

```
medical-reports/
  └── {incident_id}/
      └── {filename}
```

**Path Format:** `medical-reports/{incident_id}/{filename}`

Where:
- `{incident_id}` is the UUID of the trip/incident from the trips table
- `{filename}` follows the format: `medical-report-{incident_id}-{timestamp}.pdf`

Example:
```
medical-reports/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── medical-report-123e4567-e89b-12d3-a456-426614174000-1704067200000.pdf
```

This structure:
- Organizes reports by incident for easy retrieval
- Allows multiple reports per incident (if regenerated)
- Uses timestamps to ensure unique filenames
- Enables efficient querying and cleanup

## Security Policies

### Table Policies

- **Allow anon read/write medical_reports**: Allows anonymous users full access to the table
  - This matches the existing security model for the `trips` table
  - In production, you may want to restrict this to authenticated users only

### Storage Policies

- **Public Access to Medical Reports**: Anyone can read/download reports
- **Allow anon users to upload**: Anonymous users can upload new reports
- **Allow anon users to update**: Anonymous users can update existing reports
- **Allow anon users to delete**: Anonymous users can delete reports

## Usage Example

### Uploading a Medical Report to Storage

When uploading a PDF to Supabase Storage, use the following path structure:

```typescript
// TypeScript example
const incident_id = '123e4567-e89b-12d3-a456-426614174000';
const timestamp = Date.now();
const filename = `medical-report-${incident_id}-${timestamp}.pdf`;
const storagePath = `${incident_id}/${filename}`;

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('medical-reports')
  .upload(storagePath, pdfBlob, {
    contentType: 'application/pdf',
    upsert: false
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('medical-reports')
  .getPublicUrl(storagePath);

console.log('Report URL:', publicUrl);
// Output: https://your-project.supabase.co/storage/v1/object/public/medical-reports/123e4567-e89b-12d3-a456-426614174000/medical-report-123e4567-e89b-12d3-a456-426614174000-1704067200000.pdf
```

### Insert a Medical Report

```sql
INSERT INTO medical_reports (
  incident_id,
  patient_name,
  diagnosis,
  confidence_score,
  report_url,
  api_response,
  created_by
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'John Doe',
  'Acute Bronchitis',
  87.50,
  'https://your-project.supabase.co/storage/v1/object/public/medical-reports/123e4567-e89b-12d3-a456-426614174000/report.pdf',
  '{"diseases": [{"name": "Acute Bronchitis", "confidence": 87.5}]}'::jsonb,
  'admin@example.com'
);
```

### Query Reports by Incident

```sql
SELECT * FROM medical_reports 
WHERE incident_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC;
```

### Query Recent Reports

```sql
SELECT 
  mr.id,
  mr.patient_name,
  mr.diagnosis,
  mr.confidence_score,
  mr.created_at,
  t.incident_description
FROM medical_reports mr
JOIN trips t ON mr.incident_id = t.id
ORDER BY mr.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Issue: Foreign key constraint fails

**Error:** `insert or update on table "medical_reports" violates foreign key constraint`

**Solution:** Ensure the `incident_id` exists in the `trips` table before inserting a medical report.

### Issue: Storage bucket not found

**Error:** `Bucket not found`

**Solution:** Run the `create-medical-reports-storage.sql` script to create the bucket.

### Issue: Permission denied on storage

**Error:** `new row violates row-level security policy`

**Solution:** Verify that the storage policies were created correctly by running:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'storage';
```

## Migration Rollback

If you need to remove the medical reports infrastructure:

```sql
-- Drop the table (this will also drop the indexes and policies)
DROP TABLE IF EXISTS public.medical_reports CASCADE;

-- Delete the storage bucket
DELETE FROM storage.buckets WHERE id = 'medical-reports';

-- Note: This will also delete all stored PDF files
```

## Next Steps

After completing the database setup:

1. Update the TypeScript types in `types.ts` to include the `MedicalReport` interface
2. Implement the `medicalReportService.ts` service
3. Update the AdminDashboard UI to include report generation functionality

See the main implementation plan in `.kiro/specs/medical-report-integration/tasks.md` for the complete task list.
