-- Create Supabase Storage bucket for medical report PDFs
-- Run this in your Supabase SQL Editor
--
-- This script creates:
-- 1. A public storage bucket named 'medical-reports'
-- 2. Policies for public read access
-- 3. Policies for anonymous upload, update, and delete operations
--
-- Path structure: medical-reports/{incident_id}/{filename}
-- Example: medical-reports/123e4567-e89b-12d3-a456-426614174000/medical-report-123e4567-e89b-12d3-a456-426614174000-1704067200000.pdf

-- Create storage bucket for medical reports
insert into storage.buckets (id, name, public)
values ('medical-reports', 'medical-reports', true)
on conflict (id) do nothing;

-- Add comment for documentation
comment on table storage.buckets is 'Storage buckets for file uploads';

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
-- These policies control access to files in the medical-reports bucket
-- The security model matches the trips table (anonymous access)

-- Policy 1: Public read access - anyone can download medical reports
create policy "Public Access to Medical Reports"
  on storage.objects for select
  using ( bucket_id = 'medical-reports' );

-- Policy 2: Anonymous upload - allows report generation without authentication
create policy "Allow anon users to upload medical reports"
  on storage.objects for insert
  to anon
  with check ( bucket_id = 'medical-reports' );

-- Policy 3: Anonymous update - allows report regeneration
create policy "Allow anon users to update medical reports"
  on storage.objects for update
  to anon
  using ( bucket_id = 'medical-reports' )
  with check ( bucket_id = 'medical-reports' );

-- Policy 4: Anonymous delete - allows cleanup of old reports
create policy "Allow anon users to delete medical reports"
  on storage.objects for delete
  to anon
  using ( bucket_id = 'medical-reports' );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify the bucket and policies were created correctly

-- Verify the bucket was created successfully
select id, name, public, created_at
from storage.buckets
where id = 'medical-reports';

-- Expected result:
-- id: medical-reports
-- name: medical-reports
-- public: true
-- created_at: <timestamp>

-- Verify the storage policies were created
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' 
  and tablename = 'objects'
  and policyname like '%medical%'
order by policyname;

-- Expected policies:
-- 1. Allow anon users to delete medical reports (DELETE, {anon})
-- 2. Allow anon users to update medical reports (UPDATE, {anon})
-- 3. Allow anon users to upload medical reports (INSERT, {anon})
-- 4. Public Access to Medical Reports (SELECT, {})

-- Test bucket access (optional - requires a test file)
-- select name, bucket_id, created_at
-- from storage.objects
-- where bucket_id = 'medical-reports'
-- limit 5;
