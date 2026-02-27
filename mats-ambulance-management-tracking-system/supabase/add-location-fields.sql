-- Add pickup_address and incident_description columns to trips table
-- Run this in your Supabase SQL Editor

ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS incident_description TEXT;

-- Add comments for documentation
COMMENT ON COLUMN trips.pickup_address IS 'Text address entered by admin for patient location (e.g., "MG Road, Bangalore")';
COMMENT ON COLUMN trips.incident_description IS 'Description of the emergency/incident condition';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'trips'
ORDER BY ordinal_position;
