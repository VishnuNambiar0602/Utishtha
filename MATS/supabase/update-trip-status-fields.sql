-- SQL Migration to add timestamp fields for trip status tracking
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS pickup_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS arrival_time TIMESTAMPTZ;

-- Update the trips table to include more status options if needed
-- Currently status is a text field, but we should standardize the values:
-- 'assigned', 'en_route_to_pickup', 'arrived_at_pickup', 'picked_up', 'en_route_to_hospital', 'arrived_at_hospital', 'completed'
