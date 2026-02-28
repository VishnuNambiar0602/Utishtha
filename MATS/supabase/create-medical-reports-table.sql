-- Create medical_reports table for storing medical report metadata
-- This table links to the trips table and stores comprehensive information about generated medical reports
-- Run this in your Supabase SQL Editor

-- Create the medical_reports table
create table if not exists public.medical_reports (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.trips(id) on delete cascade,
  patient_name text not null,
  diagnosis text not null,
  confidence_score numeric(5,2) not null,
  report_url text not null,
  api_response jsonb not null,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Add comments for documentation
comment on table public.medical_reports is 'Stores metadata and references for generated medical diagnostic reports';
comment on column public.medical_reports.id is 'Unique identifier for the medical report';
comment on column public.medical_reports.incident_id is 'Foreign key reference to the trips table';
comment on column public.medical_reports.patient_name is 'Name of the patient from the incident report';
comment on column public.medical_reports.diagnosis is 'Primary diagnosis from GRASP2026 analysis';
comment on column public.medical_reports.confidence_score is 'Confidence score of the diagnosis (0-100)';
comment on column public.medical_reports.report_url is 'URL to the generated PDF report in Supabase Storage';
comment on column public.medical_reports.api_response is 'Complete JSON response from GRASP2026 diagnosis API';
comment on column public.medical_reports.created_by is 'User ID or identifier of the admin who generated the report';
comment on column public.medical_reports.created_at is 'Timestamp when the report was generated';
comment on column public.medical_reports.updated_at is 'Timestamp when the report was last updated';

-- Create indexes for efficient querying
create index if not exists medical_reports_incident_id_idx on public.medical_reports(incident_id);
create index if not exists medical_reports_created_at_idx on public.medical_reports(created_at desc);

-- Enable row level security
alter table public.medical_reports enable row level security;

-- Create policy for anonymous access (matching existing trips table policy)
create policy "Allow anon read/write medical_reports"
  on public.medical_reports
  for all
  to anon
  using (true)
  with check (true);

-- Verify the table was created successfully
select 
  column_name, 
  data_type, 
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'medical_reports'
order by ordinal_position;
