-- Reset Database for Bangalore Setup
-- Run this in Supabase SQL Editor to clear old data and start fresh

-- Delete existing data (ignore errors if tables don't exist)
DELETE FROM trips WHERE true;
DELETE FROM ambulances WHERE true;

-- The app will automatically create new Bangalore ambulances when you refresh the page
-- Make sure to refresh your browser after running this SQL

SELECT 'Database cleared! Refresh your browser to load Bangalore ambulances.' as message;
